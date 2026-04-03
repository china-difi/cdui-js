import { createRoot } from 'solid-js';

import { JSX } from './jsx';
import { disableAutoCloseEvent, hideMaskLayer, registerAutoClose, showMaskLayer, unregisterAutoClose } from './dom';

const disableAutoClose = disableAutoCloseEvent.onpointerdown;

const alignPopups: [
  style: CSSStyleDeclaration,
  alignTarget: HTMLElement,
  left: number,
  top: number,
  x: number,
  y: number,
][] = [];

document.addEventListener(
  'scroll',
  () => {
    for (let i = 0, l = alignPopups.length; i < l; i++) {
      let [style, alignTarget, left, top, x, y] = alignPopups[i];
      let rect = alignTarget.getBoundingClientRect();

      style.left = x + (rect.left - left) + 'px';
      style.top = y + (rect.top - top) + 'px';
      style.bottom = '';
    }
  },
  true,
);

const computeAlign = (
  host: HTMLElement,
  popup: HTMLElement,
  alignTarget: HTMLElement,
  direction: 'bottom' | 'top' | 'right' | 'left',
  reverse: boolean,
) => {
  let style = host.style;

  let rect = alignTarget.getBoundingClientRect();
  let alignWidth = rect.width;
  let alignHeight = rect.height;

  let popupWidth = popup.offsetWidth;
  let popupHeight = popup.offsetHeight;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  let left = rect.left;
  let top = rect.top;
  let x: number;
  let y: number;
  let is: boolean;

  if ((is = direction === 'bottom') || direction === 'top') {
    // 向下弹出
    if (is) {
      y = top + alignHeight + 2;

      // 下面空间不够且上面的空间大于下面的空间
      if (windowHeight - y < popupHeight && windowHeight - y < top - 2) {
        // 向上弹出
        is = false;
        y = top - 2 - popupHeight;
      }
    } else {
      // 向上弹出
      y = top - 2 - popupHeight;

      // 上面空间不够且下面的空间大于上面的空间
      if (top - 2 < popupHeight && y - 2 < windowHeight - y) {
        // 向下弹出
        is = true;
        y = top + alignHeight + 2;
      }
    }

    if (reverse) {
      // 右对齐
      x = left + alignWidth - popupWidth;

      // 右边空间不够且左边空间大于右边空间
    } else {
      // 左对齐
      x = left;

      // 左边空间不够且右边空间大于左边空间
    }

    style.left = x + 'px';
    style.right = '';
    style.top = is ? y + 'px' : '';
    style.bottom = is ? '' : windowHeight - (top - 2) + 'px';
  } else {
    // 是否向右弹出
    is = direction === 'right';
  }

  // 注册滚动对齐侦听
  alignPopups.push([style, alignTarget, left, top, x, y]);
};

const openPopup = (popup: HTMLElement, options: PopupOptions) => {
  let align = options.align;
  let direction = options.direction || 'bottom';
  let host = popup.parentNode as HTMLElement;
  let style = host.style;

  host.className = `popup popup-${align ? 'align' : 'fixed'}-${direction}`;

  if (align) {
    computeAlign(host, popup, align, direction, options.reverse);
  } else {
    style.left = style.top = style.right = style.bottom = '';
  }

  if (options.mask) {
    showMaskLayer(() => closePopup(popup, options));
  }

  // 过渡动画
  if (options.transition) {
    let height = popup.offsetHeight;

    style.height = '0';

    setTimeout(() => {
      style.height = height + 'px';
    });
  }
};

const closePopup = (popup: HTMLElement, options: PopupOptions) => {
  let body = document.body;
  let parent = popup.parentNode as HTMLElement;
  let align;

  if (options.mask) {
    hideMaskLayer();
  }

  // 注销滚动对齐侦听
  if ((align = options.align)) {
    for (let i = alignPopups.length; i--; ) {
      if (alignPopups[i][0] === align) {
        alignPopups.splice(i, 1);
        break;
      }
    }
  }

  // 过渡动画
  if (options.transition) {
    let style = parent.style;

    style.height = popup.offsetHeight + 'px';

    setTimeout(() => {
      style.height = '0';
      body.removeChild(parent);
    });
  } else {
    body.removeChild(parent);
  }
};

/**
 * 打开弹出层选项
 */
export interface PopupOptions {
  /**
   * 弹出方向  （位置不够时自动向反方向弹出）
   */
  direction?: 'bottom' | 'top' | 'right' | 'left';
  /**
   * 是否与指定组件对齐（不设置则从屏幕的指定方向弹出）
   */
  align?: HTMLElement;
  /**
   * 是否反向对齐（仅设置了 align 时有效）
   */
  reverse?: boolean;
  /**
   * 是否启用过渡动画
   */
  transition?: boolean;
  /**
   * 是否显示遮罩层（不设置时默认页面小于等于 480px 显示遮罩层）
   */
  mask?: boolean;
  /**
   * 关闭时是否销毁（默认销毁）
   */
  destroy?: boolean;
}

/**
 * 弹出层
 */
export type Popup = HTMLElement & {
  /**
   * 关闭弹出层
   */
  close(destroy?: boolean): void;
};

/**
 * 打开弹出层
 *
 * @param component 要弹出的组件
 * @param options 打开弹出层选项
 */
export const showPopup = (component: () => JSX.Element, options?: PopupOptions): Popup => {
  return createRoot((dispose) => {
    let body = document.body;
    let popup = component() as Popup;
    let host = document.createElement('div');

    const close = (popup.close = () => {
      unregisterAutoClose(close);
      closePopup(popup, options);

      options.destroy !== false && dispose();
    });

    host.ontransitionend = () => (host.style.height = 'auto');
    host.onpointerdown = disableAutoClose;

    host.appendChild(popup);
    body.appendChild(host);

    openPopup(popup, options || (options = {}));

    registerAutoClose(close);

    return popup;
  });
};
