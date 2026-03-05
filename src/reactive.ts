import { Component, createEffect, createSignal, createUniqueId, lazy } from 'solid-js';

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

/**
 * 信息参数（不对比值变化）
 */
const signalOptions: any = { equals: false, internal: true };
/**
 * 对象与代理对象映射
 */
const proxyMap = new WeakMap();

const arrayToKeys = (names: string[]) => {
  let result = Object.create(null);

  for (let i = 0, l = names.length; i < l; i++) {
    result[names[i]] = 1;
  }

  return result;
};

/**
 * 对数组子项有响应的方法
 */
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
    // 简单值
    if (typeof value !== 'object' || !value) {
      return value;
    }

    // 已经是代理对象
    if (value.__raw__) {
      return value;
    }

    return proxyMap.get(value) || (!isArray(value) ? reactiveObject(value) : reactiveArray(value));
  }

  if (property === 'length') {
    // 收集依赖
    this.signal[0]();
    return value;
  }

  if (property === '__raw__') {
    return target;
  }

  if (typeof value === 'function') {
    if (arrayMutationMethods[property]) {
      let set = this.signal[1];

      return function () {
        let result = value.apply(target, arguments);

        // 触发更新
        set(true);
        return result !== target ? result : receiver;
      };
    }

    return value.bind(receiver);
  }

  // 其他属性正常返回
  return value;
}

function arrayProxySetHandler(target: any, property: any, value) {
  let index = typeof property === 'string' && +property;

  // 如果是通过索引设置值
  if (property >= 0) {
    // 值有变化
    if (target[index] !== value) {
      target[index] = value;
      // 触发更新
      this.signal[1](true);
    }

    return true;
  }

  // 如果设置的是length属性
  if (property === 'length') {
    // 长度有变化
    if (target.length !== value) {
      target.length = value;
      // 触发更新
      this.signal[1](true);
      return true;
    }

    return true;
  }

  return target[property];
}

const reactiveObject = (object: object) => {
  const signals = create(null);

  const proxy = new Proxy(object, {
    get(target, property) {
      if (property !== '__raw__') {
        let signal = signals[property] || (signals[property] = createSignal(true, signalOptions));
        let value = target[property];

        // 收集依赖
        signal[0]();

        // 值类型
        if (typeof value !== 'object' || !value) {
          return value;
        }

        // 已经是代理对象
        if (value.__raw__) {
          return value;
        }

        return proxyMap.get(value) || (!isArray(value) ? reactiveObject(value) : reactiveArray(value));
      }

      return target;
    },

    set(target, property, value) {
      let sign = signals[property];

      // 只存储原始数据
      if (typeof value === 'object' && value) {
        value = value.__raw__ || value;
      }

      // 有收集依赖且值有变化
      if (sign && value !== target[property]) {
        target[property] = value;
        // 触发更新
        sign[1](true);
      } else {
        target[property] = value;
      }

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

const reactiveArray = (array: any[]) => {
  let proxy = new Proxy(array, {
    get: arrayProxyGetHandler,
    set: arrayProxySetHandler,
    signal: createSignal(true, signalOptions),
  } as any);

  proxyMap.set(array, proxy);
  return proxy;
};

/**
 * 响应式代理类型
 */
export type ReactiveProxy<T> = T extends object ? (T extends any[] ? { value: T } : T) : { value: T };

/**
 * 创建响应式对象
 *
 * @param value 要封装为响应式的数据
 */
export const reactive = <T>(value: T): ReactiveProxy<T> => {
  if (typeof value === 'object' && value) {
    // 已经是代理对象
    // @ts-ignore
    if (value.__raw__) {
      return value as ReactiveProxy<T>;
    }

    return proxyMap.get(value) || reactiveObject(!isArray(value) ? value : { value });
  }

  return reactiveObject({ value }) as ReactiveProxy<T>;
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
