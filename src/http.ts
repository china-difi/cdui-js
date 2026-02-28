/**
 * http 拦截器
 */
export const httpInterceptor = {
  /**
   * 请求拦截
   */
  request: (() => {}) as (url: string, options: RequestInit) => string | void,

  /**
   * 响应拦截（返回 Promise true 表示需要重新发送请求，返回 Promise false 抛出默认异常）
   */
  response: (() => {}) as (
    response: Response,
    options?: RequestInit,
    preventLogon?: boolean,
  ) => Promise<boolean> | void,
};

/**
 * API响应结果
 */
export interface Result<T> {
  /**
   * 响应代码
   */
  code: number | string;
  /**
   * 响应消息
   */
  message: string;
  /**
   * 响应数据
   */
  data: T;
}

/**
 * http 响应结果
 */
export type HttpResult<T> = Promise<Result<T>> & {
  /**
   * 获取返回响应结果 { code, message, data } 中的 data
   */
  get data(): Promise<T>;
};

// 扩展 data 属性
Object.defineProperty(Promise.prototype, 'data', {
  configurable: true,

  get() {
    return this.then((result) => {
      let data = result.data;

      if (data !== void 0) {
        return data;
      }

      return Promise.reject(result.code + ' ' + result.message);
    });
  },
});

const handleResponse = (response: Response, url: string, options?: RequestInit, preventLogon?: boolean) => {
  // 响应拦截
  let promise = httpInterceptor.response(response, options, preventLogon);

  // 返回了异步对象
  if (promise) {
    // 返回状态为 true 表示需要重新发送请求
    return promise.then((status) =>
      status ? sendInternal(url, options, preventLogon) : Promise.reject(response.status + ' ' + response.statusText),
    );
  }

  // 成功响应
  if (response.ok) {
    return response;
  }

  // 失败返回异常
  return Promise.reject(response.status + ' ' + response.statusText);
};

/**
 * 发送方法
 *
 * @param url 请求URL
 * @param data 请求数据
 * @param options 请求参数
 */
let sendInternal = (url: string, options?: RequestInit, preventLogon?: boolean): Promise<Response> => {
  return fetch(url, options).then((response) => handleResponse(response, url, options, preventLogon));
};

/**
 * 自定义请求发送
 *
 * @param url 请求URL
 * @param options 请求参数
 */
const send = (url: string, options?: RequestInit, preventLogon?: boolean): Promise<Response> => {
  return fetch(url, options).then((response) => handleResponse(response, url, options, preventLogon));
};

/**
 * 自定义请求 JSON 数据的方法
 *
 * @param method 请求方法
 * @param url 请求URL
 * @param data 请求数据
 * @param options 请求参数
 */
const request = <T>(
  method: string,
  url: string,
  data?: unknown,
  options?: Omit<RequestInit, 'body'>,
  preventLogon?: boolean,
): HttpResult<T> => {
  if (options) {
    let headers = options.headers;

    options.method = method;

    if (headers ? !headers['Content-Type'] : (headers = options.headers = {})) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  if (data !== void 0) {
    (options as RequestInit).body = JSON.stringify(data);
  }

  url = httpInterceptor.request(url, options) || url;

  return sendInternal(url, options, preventLogon).then((response) => response.json()) as HttpResult<T>;
};

/**
 * GET请求获取 JSON 数据
 *
 * @param url 请求URL
 * @param options 请求参数
 * @example 取消示例
 * import http from 'cdui-js/http';
 *
 * const controller = new AbortController();
 * const signal = controller.signal;
 *
 * // 3秒后未返回则取消
 * setTimeout(() => controller.abort(), 3000);
 * // 发送带取消信号的请求
 * http.get('https://example.com/api/...', { signal });
 */
const get = <T>(url: string, options?: Omit<RequestInit, 'method' | 'body'>, preventLogon?: boolean): HttpResult<T> => {
  return request('GET', url, void 0, options, preventLogon);
};

/**
 * POST请求获取 JSON 数据
 *
 * @param url 请求URL
 * @param data 请求数据（JSON）
 * @param options 请求参数
 * @example 取消示例
 * import http from 'cdui-js/http';
 *
 * const controller = new AbortController();
 * const signal = controller.signal;
 *
 * // 3秒后未返回则取消
 * setTimeout(() => controller.abort(), 3000);
 * // 发送带取消信号的请求
 * http.post('https://example.com/api/...', null, { signal });
 */
const post = <T>(
  url: string,
  data?: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
  preventLogon?: boolean,
): HttpResult<T> => {
  return request('POST', url, data, options, preventLogon);
};

/**
 * PUT请求获取 JSON 数据
 *
 * @param url 请求URL
 * @param data 请求数据（JSON）
 * @param options 请求参数
 */
const put = <T>(
  url: string,
  data: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
  preventLogon?: boolean,
): HttpResult<T> => {
  return request('PUT', url, data, options, preventLogon);
};

/**
 * DELET请求获取 JSON 数据
 *
 * @param url 请求URL
 * @param options 请求参数
 */
const del = <T>(
  url: string,
  data?: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
  preventLogon?: boolean,
): HttpResult<T> => {
  return request('DELETE', url, data, options, preventLogon);
};

/**
 * 网络跟踪结果
 */
export interface NetworkTrackingResult {
  start: number;
  end: number;
  url: string;
  options?: RequestInit;
  response?: Response;
  error?: any;
}

/**
 * 跟踪网络请求
 *
 * @param callbackFn 回调处理
 */
export const track = (callbackFn: (result: NetworkTrackingResult) => void) => {
  sendInternal = (url: string, options?: RequestInit, preventLogon?: boolean): Promise<Response> => {
    let start = Date.now();

    return fetch(url, options)
      .then((response) => {
        callbackFn({
          start,
          end: Date.now(),
          url,
          options,
          response,
        });

        return handleResponse(response, url, options, preventLogon);
      })
      .catch((error) => {
        callbackFn({
          start,
          end: Date.now(),
          url,
          options,
          error,
        });

        return Promise.reject(error);
      });
  };
};

/**
 * http 请求
 */
export const http = {
  send,
  request,
  get,
  post,
  put,
  del,
};
