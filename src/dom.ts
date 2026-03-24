export const isBrowser = typeof window !== 'undefined';

export const addEventListener: typeof document.addEventListener = isBrowser
  ? document.addEventListener.bind(document)
  : () => {};

export const removeEventListener: typeof document.removeEventListener = isBrowser
  ? document.removeEventListener.bind(document)
  : () => {};

/**
 * 显示遮罩层的数量
 */
let maskLayers: Function[] = [];
/**
 * 遮罩层
 */
let maskLayer: HTMLElement;

if (isBrowser) {
  const root = document.documentElement;

  const disableGlobalScroll = (event) => {
    if (!maskLayers.length) {
    } else {
      let target = event.target as HTMLElement;

      while (target && target !== root) {
        if (
          (window.getComputedStyle(target).overflow !== 'hidden' && target.scrollWidth > target.clientWidth) ||
          target.scrollHeight > target.clientHeight
        ) {
          // todo 未处理滚动条顶或底的问题
          return;
        }

        target = target.parentNode as HTMLElement;
      }

      event.preventDefault();
      return false;
    }
  };

  root.addEventListener('wheel', disableGlobalScroll, { passive: false });
  root.addEventListener('touchmove', disableGlobalScroll, { passive: false });

  document.addEventListener('DOMContentLoaded', () => {
    let div = (maskLayer = document.createElement('div'));

    div.className = 'mask-layer';
    div.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;display:none;background:rgba(0,0,0,0.4);z-index:8';

    // 点击遮罩层方法
    div.addEventListener('click', (event) => {
      let callbackFn = maskLayers[maskLayers.length - 1];

      callbackFn && callbackFn(event);
    });

    document.body.appendChild(div);
  });
}

/**
 * 空函数
 */
const noop = () => {};

/**
 * 显示遮罩层
 */
export const showMaskLayer = isBrowser
  ? (onclick?: () => void) => {
      maskLayer.style.display = 'block';
      maskLayers.push(onclick);
    }
  : noop;

/**
 * 隐藏遮罩层
 */
export const hideMaskLayer = isBrowser
  ? () => {
      maskLayers.pop();

      if (!maskLayers.length) {
        maskLayer.style.display = 'none';
      }
    }
  : noop;

const autocloseList = [];

/**
 * 注册自动关闭方法（弹出层，菜单等）
 *
 * @param onclose 自动关闭方法
 */
export const registerAutoClose = isBrowser
  ? (onclose: () => void) => {
      autocloseList.push(onclose);
    }
  : () => {};

/**
 * 取消注册自动关闭方法（弹出层，菜单等）
 *
 * @param onclose 自动关闭方法
 */
export const unregisterAutoClose = (onclose: () => void) => {
  for (let i = autocloseList.length; i--; ) {
    if (autocloseList[i] === onclose) {
      autocloseList.splice(i, 1);
      break;
    }
  }
};

/**
 * 是否禁止自动关闭
 */
let disableAutoClose = false;

/**
 * 开始侦听自动关闭事件
 */
export const startAutoCloseEvent = isBrowser
  ? () => {
      // 延迟注册解决 solidjs 事件顺序问题
      setTimeout(() => {
        document.addEventListener('pointerdown', () => {
          if (disableAutoClose) {
            disableAutoClose = false;
          } else {
            for (let i = 0, l = autocloseList.length; i < l; i++) {
              autocloseList[i]();
            }
          }
        });
      });
    }
  : noop;

/**
 * 禁止自动关闭事件
 */
export const disableAutoCloseEvent = {
  onpointerdown: () => {
    disableAutoClose = true;
  },
};
