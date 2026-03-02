import { Component, createEffect, createSignal, createUniqueId, lazy, untrack } from 'solid-js';

export const defineProperty = Object.defineProperty;
export const defineProperties = Object.defineProperties;
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

class ReactiveArray {}

/**
 * 创建响应式对象
 *
 * @param props 属性集
 */
export const reactive = <T extends { [key: string]: any }>(props: T): T => {
  let descriptors = Object.getOwnPropertyDescriptors(props);
  let result = {};
  let properties = {};

  for (let name in descriptors) {
    let descriptor = descriptors[name];
    let get = descriptor.get;
    let set = descriptor.set;

    if (get) {
      get = get.bind(result);

      if (set) {
        set = set.bind(result);
      }
    } else if (set) {
      set = set.bind(result);
    } else {
      let value = props[name];

      if (typeof value === 'object') {
        if (isArray(value)) {
          for (let i = value.length; i--; ) {
            if (typeof value[i] === 'object') {
              value[i] = reactive(value[i]);
            }
          }
        } else {
          value = reactive(value);
        }
      }

      let signal = createSignal(value);

      get = signal[0];
      set = signal[1];
    }

    properties[name] = { get, set };
  }

  return defineProperties(result, properties) as T;
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
      // 不收集依赖的情况下执行回调
      untrack(() => callbackFn(deps()));
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
 * @param promise 异步对象
 * @param ssr_cache 在服务端渲染的模式下是否缓存请求结果到 HTML 中
 */
export const createFetcher = <T>(promise?: () => Promise<T>, ssr_cache?: string) => {
  let [status, setStatus] = createSignal('loading');
  let [result, setResult] = createSignal();
  let [error, setError] = createSignal();
  let data;

  if (promise) {
    if (import.meta.env.SSR) {
      let id = createUniqueId();

      if ((data = serverContext.cache.get(id))) {
        setStatus('done');
        setResult(data);
      } else {
        serverContext.promises.push(
          promise().then((result) => {
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
        promise().then(
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
  }

  return defineProperties(
    {},
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
  ) as FetcherResult<T>;
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
