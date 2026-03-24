import { JSX } from '../jsx';
import { combineClass, splitProps } from '../reactive';
import { disableAutoCloseEvent } from '../dom';
import { Popup, PopupApi, PopupProps } from './Popup';

/**
 * 下拉框组件
 */
export const ComboBox = (
  props?: JSX.HTMLAttributes<never> &
    PopupProps & {
      /**
       * 值
       */
      value?: string;
      /**
       * 是否只读
       */
      readonly?: boolean;
      /**
       * 获取焦点时是否自动弹出
       */
      popupOnFocus?: boolean;
      /**
       * 弹出层属性
       */
      popup?: Omit<JSX.HTMLAttributes<never>, 'children'>;
    },
) => {
  let [thisProps, restProps] = splitProps(props, [
    'class',
    'value',
    'readonly',
    'popupOnFocus',
    'popup',
    'onPopup',
    'api',
    'children',
  ]);
  let popup: PopupApi;

  const initApi = (api) => {
    popup = api;
    thisProps.api && thisProps.api(popup);
  };

  return (
    <div class={combineClass('combobox', thisProps.class)} {...restProps}>
      <div class="combobox-host" {...disableAutoCloseEvent}>
        <input
          class="combobox-input"
          value={thisProps.value || ''}
          readonly={thisProps.readonly}
          onfocus={() => thisProps.popupOnFocus && popup.openPopup()}
          onclick={() => thisProps.readonly && !thisProps.popupOnFocus && popup.togglePopup()}
        ></input>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => popup.togglePopup()}>
          <use href="#icon-dropdown"></use>
        </svg>
      </div>
      <Popup api={initApi} onPopup={thisProps.onPopup} {...thisProps.popup}>
        {thisProps.children}
      </Popup>
    </div>
  );
};
