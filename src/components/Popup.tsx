import { JSX } from '../jsx';
import { layout } from '../layout';
import { omitProps, onMount } from '../reactive';
import { disableAutoCloseEvent, hideMaskLayer, registerAutoClose, showMaskLayer } from '../dom';
import { createRoot } from 'solid-js';

const POPUP_TOP_CLASS = 'popup-top';
const POPUP_RIGHT_CLASS = 'popup-right';

/**
 * 当前弹出层
 */
const currentPopup = {
  /**
   * 当前 DOM 对象
   */
  dom: null as HTMLElement,
  /**
   * 是否显示了遮罩层
   */
  mask: false,
};

/**
 * 是否使用下拉动画
 */
let useDropdownTransition = true;

/**
 * 显示遮罩层方法
 */
let showMaskLayerFn = () => layout['le-480'];

/**
 * 设置是否使用下拉动画
 *
 * @param use 是否使用
 */
export const setUseDropdownTransition = (use: boolean) => {
  useDropdownTransition = use;
};

/**
 * 设置显示遮罩层的方法
 *
 * @param fn 显示遮罩层的方法
 */
export const setShowMaskLayerFn = (fn: () => boolean) => {
  showMaskLayerFn = fn || showMaskLayerFn;
};

const showPopup = (dom: HTMLElement, onPopup?: (dom: HTMLElement) => void | false) => {
  // 下拉钩子
  if (onPopup && onPopup(dom) === false) {
    return;
  }

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let classList = dom.classList;
  let style = dom.style;

  // 有下拉
  if (currentPopup.dom) {
    // 先关闭
    hidePopup();
  }

  // 记录当前弹出层
  currentPopup.dom = dom;

  if ((currentPopup.mask = showMaskLayerFn())) {
    showMaskLayer(closePopup);
  }

  let host = dom.parentNode as HTMLElement;

  // 先显示
  // style.width = host.offsetWidth + 'px';
  style.height = 'auto';
  style.display = 'block';

  // 获取宽高及计算位置
  let width = (dom.firstElementChild as HTMLElement).offsetWidth;
  let height = dom.offsetHeight;
  let rect = host.getBoundingClientRect();

  // 同步子组件宽度
  // style.width = width + 'px';

  if (windowHeight - rect.top - rect.height < height + 4 && rect.top >= height) {
    classList.add(POPUP_TOP_CLASS);
  } else {
    classList.remove(POPUP_TOP_CLASS);
  }

  if (windowWidth - rect.left - rect.width > width + 4 && rect.left >= width) {
    classList.add(POPUP_RIGHT_CLASS);
  } else {
    classList.remove(POPUP_RIGHT_CLASS);
  }

  // 过渡动画
  if (useDropdownTransition) {
    style.height = '0';

    setTimeout(() => {
      style.height = height + 'px';
    });
  }
};

const hidePopup = () => {
  let popup = currentPopup;
  let dom = popup.dom;
  let style = dom.style;

  currentPopup.dom = null;

  if (popup.mask) {
    hideMaskLayer();
  }

  // 过渡动画
  if (useDropdownTransition) {
    style.height = dom.offsetHeight + 'px';

    setTimeout(() => {
      style.height = '0';
    });
  } else {
    style.display = 'none';
  }
};

const togglePopup = (dom: HTMLElement, onPopup?: (dom: HTMLElement) => void | false, event?: Event) => {
  // 有显示下拉
  if (currentPopup.dom) {
    // 不是当前下拉框
    if (currentPopup.dom !== dom) {
      // 先关闭
      closePopup();
    }

    showPopup(dom, onPopup);
  } else {
    showPopup(dom, onPopup);
  }

  event && event.stopPropagation();
};

const OMIT_PROPS = ['onPopup', 'api', 'children'] as const;

/**
 * 弹出层外部访问接口
 */
export interface PopupApi {
  /**
   * 是否已经弹出
   */
  popup: boolean;
  /**
   * 打开弹出框
   */
  openPopup(): void;
  /**
   * 关闭弹出框
   */
  closePopup(): void;
  /**
   * 显示或关闭弹出层
   */
  togglePopup(): void;
}

/**
 * 弹出层属性
 */
export interface PopupProps {
  /**
   * 弹出对话框钩子
   */
  onPopup?: (dom: HTMLElement) => void | false;
  /**
   * 外部调用接口
   */
  api?: (api: PopupApi) => void;
}

/**
 * 弹出层组件
 */
export const Popup = (props?: JSX.HTMLAttributes<never> & PopupProps) => {
  let popup: HTMLElement;

  // 初始化外部调用接口
  props.api &&
    onMount(() => {
      props.api({
        get popup() {
          return currentPopup.dom === popup;
        },
        openPopup: () => showPopup(popup, props.onPopup),
        closePopup: () => currentPopup.dom === popup && hidePopup(),
        togglePopup: () => togglePopup(popup, props.onPopup),
      });
    });

  return (
    <div
      ref={popup as any}
      class="popup"
      style={{ display: 'none' }}
      {...disableAutoCloseEvent}
      ontransitionend={() => currentPopup.dom === popup || (popup.style.display = 'none')}
    >
      <div {...omitProps(props, OMIT_PROPS)}>{props.children}</div>
    </div>
  );
};

/**
 * 关闭当前弹出层
 */
export const closePopup = () => {
  currentPopup.dom && hidePopup();
};

// 注册点击关闭弹出层的方法
registerAutoClose(closePopup);
