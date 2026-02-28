import { isBrowser } from './dom';

/**
 * 订阅者集合
 */
type SubscriberList = Array<[onmessage: (message: SubscribeMessage) => void, once?: boolean]>;

/**
 * 返回结果方法名
 */
const ONRETURN = Symbol('onreturn');

/**
 * 复制对象
 */
const assign = Object.assign;

/**
 * 订阅集合
 */
const subscribes: { [key: string]: SubscriberList } = Object.create(null);

/**
 * 返回结果处理函数集合
 */
const onreturnFns: Map<number, (result: unknown, error?: unknown) => void> = new Map();

/**
 * 递增的回调 id
 */
let returnIdInc = 1;

/**
 * 分发消息
 *
 * @param event 消息事件
 */
const dispatchMessage = (message: SubscribeMessage) => {
  let list = subscribes[message.type];

  // 发送消息
  if (list) {
    let length = list.length;
    let index = -1;

    for (let i = 0; i < length; i++) {
      let item = list[i];

      // 没有标记删除
      if (item[0]) {
        // 通知订阅者
        item[0](message);

        // 可多次执行
        if (!item[1]) {
          // 有删除
          if (index >= 0) {
            list[index++] = item;
          }

          continue;
        }
      }

      // 记录第一个删除项
      if (index < 0) {
        index = i;
      }
    }

    // 有删除的订阅
    if (index >= 0 && index < length) {
      list.splice(index);
    }
  }
};

/**
 * 订阅消息
 */
export interface SubscribeMessage<T = unknown, R = unknown> {
  /**
   * 消息类型
   */
  type: string;

  /**
   * 消息数据
   */
  data: T;

  /**
   * 发送消息窗口
   */
  source: Window;

  /**
   * 源地址（仅 sendMessageTo 有效）
   */
  origin: string;

  /**
   * 回调函数id（仅 sendMessageTo 有效）
   */
  returnId?: number;

  /**
   * 返回（仅 sendMessage 有效）
   *
   * @param result 返回结果
   * @param error 错误信息
   */
  [ONRETURN]?: (result: R, error: string) => void;
}

/**
 * 订阅消息
 *
 * @param type 消息类型
 * @param onmessage 消息处理函数
 * @param once 是否执行一次后自动注销
 */
export const subscribe = <T = unknown, R = unknown>(
  type: string,
  onmessage: (message: SubscribeMessage<T, R>) => void,
  once?: boolean
) => {
  let items = subscribes[type];

  if (items) {
    items.push([onmessage, once]);
  } else {
    subscribes[type] = [[onmessage, once]];
  }
};

/**
 * 取消订阅
 *
 * @param type 消息类型
 * @param onmessage 消息处理函数
 */
export const unsubscribe = <T = unknown, R = unknown>(
  type: string,
  onmessage: (message: SubscribeMessage<T, R>) => void
) => {
  let items = subscribes[type];

  if (items) {
    for (let i = items.length; i--; ) {
      if (items[i][0] === onmessage) {
        // 标记已删除
        items[i][0] = null;
        break;
      }
    }
  }
};

/**
 * 向当前窗口发送消息（同步执行）
 *
 * @param type 消息类型
 * @param data 消息数据
 * @param onreturn 返回结果处理函数（返回 true 时继续等待下一个返回结果，否则不再等待）
 */
export const sendMessage = <T = unknown, R = unknown>(
  type: string,
  data: T,
  onreturn?: (result: R, error?: string) => void | true
) => {
  let message = {
    type,
    data,
    source: window,
    origin: location.href,
  } as SubscribeMessage;

  if (onreturn) {
    message[ONRETURN] = onreturn;
  }

  dispatchMessage(message);
};

/**
 * 向指定窗口发送消息（使用 window.postMessage 发送，异步执行）
 *
 * @param window 目标窗口
 * @param type 消息类型
 * @param data 消息数据（要可序列化）
 * @param onreturn 返回结果处理函数（返回 true 时继续等待下一个返回结果，否则不再等待）
 */
export const sendMessageTo = <T = unknown, R = unknown>(
  window: Window,
  type: string,
  data?: T,
  onreturn?: (result: R, error?: string) => void | true
) => {
  let returnId;

  if (typeof onreturn === 'function') {
    // 添加到返回函数集合，Id 添加随机值防止猜测
    onreturnFns.set((returnId = returnIdInc++ + Math.random()), onreturn);
  }

  window.postMessage(
    {
      type,
      data,
      returnId,
    },
    '*'
  );
};

/**
 * 返回消息结果
 *
 * @param message 订阅消息
 * @param result 返回结果
 * @param error 错误信息
 */
export const returnMessageResult = <T = unknown, R = unknown>(
  message: SubscribeMessage<T>,
  result: R,
  error?: string
) => {
  let returnId, onreturn;

  if ((onreturn = message[ONRETURN])) {
    try {
      // 执行回调（返回 true 表示需要继续等待返回结果）
      if (!onreturn(result, error)) {
        message[ONRETURN] = void 0;
      }
    } catch {
      // 出错时不再接收返回结果
      message[ONRETURN] = void 0;
    }
  } else if ((returnId = message.returnId)) {
    message.source.postMessage(
      {
        returnId,
        result,
        error,
      },
      '*'
    );
  }
};

/**
 * 浏览器环境接收窗口消息
 */
isBrowser &&
  window.addEventListener(
    'message',
    (event) => {
      let message = event.data;
      let returnId, onreturn;

      // 有 type 字段才处理
      if (message) {
        if (message.type) {
          // 需创建新的消息以免影响第三方消息处理
          message = assign({}, message);
          message.source = event.source;
          message.origin = event.origin;

          // 分发消息
          dispatchMessage(message);
        } else if ((returnId = message.returnId) && (onreturn = onreturnFns.get(returnId))) {
          // 返回消息

          try {
            // 执行返回结果处理函数（返回 true 表示需要继续等待返回结果）
            if (!onreturn(message.result, message.error)) {
              // 删除返回结果处理函数
              onreturnFns.delete(returnId);
            }
          } catch {
            // 出错时不再接收返回结果
            onreturnFns.delete(returnId);
          }
        }
      }
    },
    true
  );
