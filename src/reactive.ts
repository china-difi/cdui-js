import { Component, createEffect, createSignal, createUniqueId, lazy, untrack } from 'solid-js';

export const defineProperty = Object.defineProperty;
export const defineProperties = Object.defineProperties;
export const create = Object.create;
export const isArray = Array.isArray;

export interface ServerContext {
  /**
   * 异步等待集合
   */
  promises: any[];
  /**
   * 已经获取的异步缓存
   */
  cache: Map<string, any>;
  /**
   * 需要 SSR 缓存的 key 集合
   */
  ssr: { [key: string]: any };
}

/**
 * 当前服务端渲染上下文
 */
let serverContext: ServerContext;

/**
 * 设置当前服务端渲染上下文
 *
 * @param context 渲染上下文
 */
export const setServerContext = (context: ServerContext) => {
  serverContext = context;
};

/**
 * 服务端渲染页面配置
 */
export interface SSRRenderPage {
  /**
   * 页面路径
   */
  path: string;

  /**
   * 搜索
   */
  search?: string;

  /**
   * 页面 title 集合，(key 为语言代码)
   */
  title?: string;

  /**
   * 页面描述集合，(key 为语言代码)
   */
  description?: string;

  /**
   * 出现异常时是否终止渲染（渲染终止）
   */
  abort?: boolean;
}

const signalOptions: any = { equals: false, internal: true };
const proxyMap = new WeakMap();

const arrayToKeys = (names: string[]) => {
  let result = Object.create(null);

  for (let i = 0, l = names.length; i < l; i++) {
    result[names[i]] = 1;
  }

  return result;
};

const arrayMutationMethods = arrayToKeys([
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'fill',
  'copyWithin',
]);

function arrayProxyGetHandler(target: any, property: any, receiver) {
  let index = typeof property === 'string' && +property;
  let value = target[property];

  // 拦截索引访问
  if (index >= 0) {
    if (typeof value !== 'object' || !value) {
      return value;
    }

    // 已经是代理对象
    if (value.__raw__) {
      return value;
    }

    return proxyMap.get(value) || (isArray(value) ? createArraySignal(value)[0]() : reactiveObject(value));
  }

  if (property === '__raw__') {
    return target;
  }

  if (typeof value === 'function') {
    if (arrayMutationMethods[property]) {
      let handler = this;
      let set = handler.fn;

      return function () {
        let result = value.apply(target, arguments);

        // 触发更新
        set(receiver);
        return result !== target ? result : receiver;
      };
    }

    return value.bind(receiver);
  }

  // 其他属性正常返回
  return value;
}

function arrayProxySetHandler(target: any, property: any, value, receiver) {
  let index = typeof property === 'string' && +property;

  // 如果是通过索引设置值
  if (property >= 0) {
    target[index] = value;

    // 触发更新
    this.fn(receiver);
    return true;
  }

  // 如果设置的是length属性
  if (property === 'length') {
    if (target.length !== value) {
      target.length = value;

      // 触发更新
      this.fn(receiver);
      return true;
    }

    return true;
  }

  return Reflect.set(target, property, value, receiver);
}

const createArraySignal = (value: any[]) => {
  let handler = { get: arrayProxyGetHandler, set: arrayProxySetHandler, fn: null };
  let proxy = new Proxy(value, handler);
  let signal = createSignal(proxy, signalOptions);

  handler.fn = signal[1];

  return signal;
};

const initSignal = (signals, property, value) => {
  return (signals[property] =
    typeof value !== 'object' || !isArray(value) ? createSignal(value) : createArraySignal(value));
};

const reactiveObject = (object) => {
  const signals = create(null);

  const proxy = new Proxy(object, {
    get(target, property, receiver) {
      if (property !== '__raw__') {
        let value = (signals[property] || initSignal(signals, property, target[property]))[0]();

        if (typeof value !== 'object' || !value) {
          return value;
        }

        // 已经是代理对象
        if (value.__raw__) {
          return value;
        }

        return proxyMap.get(value) || (isArray(value) ? createArraySignal(value)[0]() : reactiveObject(value));
      }

      return target;
    },

    set(target, property, value, receiver) {
      if (value && typeof value === 'object') {
        value = value.__raw__ || value;
      }

      (signals[property] || initSignal(signals, property, target[property]))[1]((target[property] = value));
      return true;
    },

    deleteProperty() {
      console.error('Cannot delete reactive object property');
      return false;
    },
  });

  proxyMap.set(object, proxy);
  return proxy;
};

const throwReactiveError = () => {
  throw new Error(`Array cannot directly create reactive object，Please use like: reactive({ items: [] })`);
};

/**
 * 创建响应式对象
 *
 * @param object 要封装为响应的对象
 */
export const reactive = <T extends { [key: string]: any }>(object: T extends any[] ? never : T): T => {
  if (object && typeof object === 'object') {
    // 已经是代理对象
    if (object.__raw__) {
      return object;
    }

    return proxyMap.get(object) || (!isArray(object) && reactiveObject(object)) || throwReactiveError();
  }

  throw new Error(`${object} can not create reactive object`);
};

/**
 * 获取响应式代理对象的原始数据
 *
 * @param proxy 响应式对象
 */
export const toRaw = <T>(proxy: T): T => {
  // @ts-ignore
  return (proxy && proxy.__raw__) || proxy;
};

/**
 * 观测响应式属性变化
 *
 * @param deps 依赖属性集
 * @param callbackFn 变化时的回调函数
 */
export const watch = <T extends unknown>(deps: () => T, callbackFn: (values: T) => void): void => {
  let initialized;

  createEffect(() => {
    // 已经初始化
    if (initialized) {
      callbackFn(deps());
    } else {
      // 回集依赖
      deps();
      // 标记已经初始化
      initialized = true;
    }
  });
};

/**
 * 异步管理器结果
 */
export interface FetcherResult<T> {
  /**
   * 异步加载数据方法
   */
  asyncLoad: () => Promise<T>;

  /**
   * 异步状态
   */
  status: 'loading' | 'done' | 'fail';

  /**
   * 成功返回的结果数据
   */
  result?: T;

  /**
   * 错误信息
   */
  error?: any;
}

/**
 * 创建异步获取器
 *
 * @param asyncLoad 异步加载数据方法
 * @param ssr_cache 在服务端渲染的模式下是否缓存请求结果到 HTML 中
 */
export const createFetcher = <T>(asyncLoad: () => Promise<T>, ssr_cache?: string) => {
  let [status, setStatus] = createSignal('loading');
  let [result, setResult] = createSignal();
  let [error, setError] = createSignal();
  let data;

  // @ts-ignore
  if (import.meta.env.SSR) {
    let id = createUniqueId();

    if ((data = serverContext.cache.get(id))) {
      setStatus('done');
      setResult(data);
    } else {
      serverContext.promises.push(
        asyncLoad().then((result) => {
          serverContext.cache.set(id, result);

          // 需要缓存到 HTML 中
          if (ssr_cache) {
            serverContext.ssr[ssr_cache] = result;
          }
        }),
      );
    }
  } else {
    if (ssr_cache && (data = (window as any).SSR) && (data = data[ssr_cache])) {
      setStatus('done');
      setResult(data);
    } else {
      asyncLoad().then(
        (result) => {
          setStatus('done');
          setResult(result as any);
        },
        (error) => {
          setStatus('fail');
          setError(error);
        },
      );
    }
  }

  return defineProperties(
    {
      asyncLoad,
    },
    {
      status: {
        get: status,
        set: setStatus,
      },
      result: {
        get: result,
        set: setResult,
      },
      error: {
        get: error,
        set: setError,
      },
    },
  ) as unknown as FetcherResult<T>;
};

/**
 * 延迟加载组件
 *
 * @param importFn 按需导入的组件 import('...')
 */
export const LazyComponent = (
  importFn: () => Promise<{
    default: Component<any>;
  }>,
) => {
  return lazy(importFn);
};
