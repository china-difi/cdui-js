/**
 * 自定义响应结果
 */
export interface ResponseResult {
  /**
   * 响应类型  custom: 自定义响应结果  retry: 重试
   */
  type: 'custom' | 'retry';

  /**
   * 自定义响应结果（type === 'custom' 时有效）
   */
  result?: any;
}

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
  response: (() => {}) as (response: Response, options?: RequestInit) => Promise<ResponseResult> | void,
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

const respondDefault = (response: Response, json: boolean) => {
  // 失败返回异常
  return response.ok
    ? json
      ? response.json()
      : response
    : Promise.reject(response.status + ' ' + response.statusText);
};

const handleResponse = (response: Response, url: string, json: boolean, options?: RequestInit) => {
  // 响应拦截
  let result = httpInterceptor.response(response, options);

  // 返回了异步对象
  return result
    ? result.then((result) => {
        switch (result && result.type) {
          case 'custom':
            return result.result;

          case 'retry':
            return sendInternal(url, json, options);

          default:
            return respondDefault(response, json);
        }
      })
    : respondDefault(response, json);
};

/**
 * 发送方法
 *
 * @param url 请求URL
 * @param json 是否返回 json 数据
 * @param options 请求参数
 */
let sendInternal = (url: string, json: boolean, options?: RequestInit): Promise<Response> => {
  return fetch(url, options).then((response) => handleResponse(response, url, json, options));
};

/**
 * 发送自定义请求
 *
 * @param url 请求URL
 * @param options 请求参数
 */
const send = (url: string, options?: RequestInit): Promise<Response> => {
  return fetch(url, options).then((response) => handleResponse(response, url, false, options));
};

/**
 * 自定义请求 JSON 响应数据
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

  return sendInternal(url, true, options) as unknown as HttpResult<T>;
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
const get = <T>(url: string, options?: Omit<RequestInit, 'method' | 'body'>): HttpResult<T> => {
  return request('GET', url, void 0, options);
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
const post = <T>(url: string, data?: unknown, options?: Omit<RequestInit, 'method' | 'body'>): HttpResult<T> => {
  return request('POST', url, data, options);
};

/**
 * PUT请求获取 JSON 数据
 *
 * @param url 请求URL
 * @param data 请求数据（JSON）
 * @param options 请求参数
 */
const put = <T>(url: string, data: unknown, options?: Omit<RequestInit, 'method' | 'body'>): HttpResult<T> => {
  return request('PUT', url, data, options);
};

/**
 * DELET请求获取 JSON 数据
 *
 * @param url 请求URL
 * @param options 请求参数
 */
const del = <T>(url: string, data?: unknown, options?: Omit<RequestInit, 'method' | 'body'>): HttpResult<T> => {
  return request('DELETE', url, data, options);
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
  sendInternal = (url: string, json: boolean, options?: RequestInit): Promise<Response> => {
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

        return handleResponse(response, url, json, options);
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
