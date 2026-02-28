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
}

/**
 * 显示遮罩层
 */
export const showMaskLayer = (onclick?: () => void) => {
  if (isBrowser) {
    if (!maskLayers.length) {
      if (!maskLayer) {
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
      }

      maskLayer.style.display = 'block';
    }

    maskLayers.push(onclick);
  }
};

/**
 * 隐藏遮罩层
 */
export const hideMaskLayer = () => {
  if (isBrowser) {
    maskLayers.pop();

    if (!maskLayers.length) {
      maskLayer.style.display = 'none';
    }
  }
};

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
 * 侦听自动关闭事件（一般设置到 solid-js 的 App 节点上，且只能侦听一次）
 */
export const listenAutoCloseEvent = {
  onpointerdown: () => {
    for (let i = 0, l = autocloseList.length; i < l; i++) {
      autocloseList[i]();
    }
  },
};

/**
 * 禁止自动关闭事件
 */
export const disableAutoCloseEvent = {
  onpointerdown: (event: Event) => {
    event.stopPropagation();
  },
};
