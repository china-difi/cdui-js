import { splitProps } from 'solid-js';

import { JSX } from '../jsx';

import { disableAutoCloseEvent, registerAutoClose } from '../dom';

const POPUP_TOP_CLASS = 'combobox-popup-top';
const POPUP_RIGHT_CLASS = 'combobox-popup-right';

/**
 * 当前弹出层
 */
let currentPopup: ComboBoxApi;

/**
 * 关闭当前弹出层
 */
export const closePopup = () => {
  currentPopup && currentPopup.closePupup();
};

/**
 * 是否使用下拉动画
 */
export let useDropdownTransition = true;

/**
 * 设置是否使用下拉动画
 *
 * @param use 是否使用
 */
export const setUseDropdownTransition = (use: boolean) => {
  useDropdownTransition = use;
};

// 注册点击关闭弹出层的方法
registerAutoClose(closePopup);

/**
 * 下拉框组件外部访问接口
 */
export interface ComboBoxApi {
  /**
   * 打开弹出框
   */
  openPopup(): void;
  /**
   * 关闭弹出框
   */
  closePupup(): void;
}

/**
 * 下拉框组件
 */
export const ComboBox = <T, U extends JSX.Element>(
  props?: JSX.HTMLAttributes<never> & {
    /**
     * 值
     */
    value?: string;
    /**
     * 是否只读
     */
    readonly?: boolean;
    /**
     * 外部调用接口
     */
    api?: (api: ComboBoxApi) => void;
  },
) => {
  let [thisProps, restProps] = splitProps(props, ['class', 'value', 'readonly', 'api', 'children']);
  let popup: HTMLElement;
  let opened: boolean;

  const toggle = (event?: Event) => {
    if (popup) {
      let combobox = popup.parentNode as HTMLElement;
      let rect = combobox.getBoundingClientRect();
      let style = popup.style;

      if ((opened = !opened)) {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let classList = popup.classList;

        if (currentPopup) {
          currentPopup.closePupup();
        }

        // 设置当前弹出层
        currentPopup = api;

        style.height = 'auto';
        style.display = 'block';

        let height = popup.offsetHeight;

        if (windowHeight - rect.top - rect.height < height + 4 && rect.top >= height) {
          classList.add(POPUP_TOP_CLASS);
        } else {
          classList.remove(POPUP_TOP_CLASS);
        }

        if (windowWidth - rect.left - rect.width >= 0) {
          classList.add(POPUP_RIGHT_CLASS);
        } else {
          classList.remove(POPUP_RIGHT_CLASS);
        }

        if (useDropdownTransition) {
          style.height = '0';

          setTimeout(() => {
            style.height = height + 'px';
          });
        }
      } else {
        currentPopup = null;

        if (useDropdownTransition) {
          style.height = popup.offsetHeight + 'px';

          setTimeout(() => {
            style.height = '0';
          });
        } else {
          style.display = 'none';
        }
      }
    }

    event && event.stopPropagation();
  };

  const api = {
    openPopup: () => opened || toggle(),
    closePupup: () => opened && toggle(),
  };

  // 初始化外部调用接口
  props.api && props.api(api);

  return (
    <div class={'combobox' + (thisProps.class ? ' ' + thisProps.class : '')} {...restProps}>
      <div class="combobox-host" {...disableAutoCloseEvent} onclick={() => thisProps.readonly && toggle()}>
        <input value={thisProps.value ?? ''} readonly={thisProps.readonly} style={{ border: 'none' }}></input>
        <svg class="icon icon-s" aria-hidden={true} style={{ height: '100%', padding: '0 4px' }} onclick={toggle}>
          <use href="#icon-dropdown"></use>
        </svg>
      </div>
      <div
        ref={popup as any}
        class="combobox-popup"
        style={{ display: 'none' }}
        {...disableAutoCloseEvent}
        ontransitionend={() => opened || (popup.style.display = 'none')}
      >
        {thisProps.children}
      </div>
    </div>
  );
};
