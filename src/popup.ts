import { createRoot } from 'solid-js';

import { JSX } from './jsx';
import { disableAutoCloseEvent, hideMaskLayer, registerAutoClose, showMaskLayer, unregisterAutoClose } from './dom';
import { layout } from './layout';

const disableAutoClose = disableAutoCloseEvent.onpointerdown;

const alignPopups: [
  style: CSSStyleDeclaration,
  alignTarget: HTMLElement,
  left: number,
  top: number,
  x: number,
  y: number,
][] = [];

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
   * 是否与对齐组件同宽
   */
  alignWidth?: boolean;
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
  /**
   * 打开弹出层事件
   */
  onopen?: () => void;
  /**
   * 关闭弹出层事件
   */
  onclose?: () => void;
}

/**
 * 弹出层
 */
export type Popup = HTMLElement & {
  /**
   * 是否打开状态
   */
  opened: boolean;
  /**
   * 关闭弹出层
   */
  close(destroy?: boolean): void;
};

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
  popup: Popup,
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

const openPopup = (popup: Popup, options: PopupOptions) => {
  let align = options.align;
  let direction = options.direction || 'bottom';
  let host = popup.parentNode as HTMLElement;
  let style = host.style;

  host.className = `popup popup-${align ? 'align' : 'fixed'}-${direction}`;

  if (align) {
    // 没有指定宽度
    if (options.alignWidth !== false && !host.style.width) {
      host.style.width = align.offsetWidth + 'px';
    }

    computeAlign(host, popup, align, direction, options.reverse);
  } else {
    style.left = style.top = style.right = style.bottom = '';
  }

  if (options.mask) {
    showMaskLayer(() => closePopup(popup, options));
  }

  // 设置为打开状态
  popup.opened = true;
  // 触发打开事件
  options.onopen && options.onopen();

  // 过渡动画
  if (options.transition) {
    let height = popup.offsetHeight;

    style.height = '0';

    setTimeout(() => {
      style.height = height + 'px';
    });
  }
};

const closePopup = (popup: Popup, options: PopupOptions) => {
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

  // 设置为关闭状态
  popup.opened = false;
  // 触发关闭事件
  options.onclose && options.onclose();

  // 过渡动画
  if (options.transition) {
    let style = parent.style;

    style.height = popup.offsetHeight + 'px';

    setTimeout(() => {
      style.height = '0';
    });
  } else {
    body.removeChild(parent);
  }
};

/**
 * 打开弹出层
 *
 * @param component 要弹出的组件
 * @param options 打开弹出层选项
 */
export const showPopup = (component: JSX.Element | (() => JSX.Element), options?: PopupOptions): Popup => {
  return createRoot((dispose) => {
    let body = document.body;
    let popup = (typeof component === 'function' ? component() : component) as Popup;
    let host = document.createElement('div');

    const close = (popup.close = () => {
      unregisterAutoClose(close);
      closePopup(popup, options);

      options.destroy !== false && dispose();
    });

    host.onpointerdown = disableAutoClose;
    host.ontransitionend = () => {
      host.style.height = 'auto';
      popup.opened || body.removeChild(host);
    };

    host.appendChild(popup);
    body.appendChild(host);

    openPopup(popup, options || (options = {}));

    registerAutoClose(close);

    return popup;
  });
};

let dropdownTransition = true;

/**
 * 设置下拉框是否使用过渡动画
 *
 * @param transition 是否使用过渡动画
 */
export const setDropdownTransition = (transition: boolean) => {
  dropdownTransition = transition;
};

/**
 * 弹出层外部调用接口
 */
export interface PopupApi {
  /**
   * 打开弹出层
   */
  openPopup(): void;
  /**
   * 关闭弹出层
   */
  closePopup(): void;
  /**
   * 打开或关闭弹出层
   */
  togglePopup(): void;
}

/**
 * 初始化弹出层
 *
 * @param dom 对齐组件
 * @param popupTarget 弹出目标组件
 * @param options 指定弹出参数
 */
export const initDropdown = (dom: HTMLElement, popupTarget: () => JSX.Element, options?: PopupOptions): PopupApi => {
  let popup: Popup;

  const openPopup = () => {
    popup ||
      (popup = showPopup(popupTarget(), {
        align: layout['gt-480'] && dom,
        onclose: () => (popup = null),
        transition: dropdownTransition,
        ...options,
      }));
  };

  const closePopup = () => {
    popup && popup.close();
  };

  const togglePopup = () => {
    if (popup) {
      popup.close();
    } else {
      openPopup();
    }
  };

  return {
    openPopup,
    closePopup,
    togglePopup,
  };
};
