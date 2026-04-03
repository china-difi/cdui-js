import { JSX } from '../jsx';
import { combineClass, omitProps, useContext, watch } from '../reactive';
import { disableAutoCloseEvent } from '../dom';
import { Popup, PopupApi, PopupProps } from './Popup';
import { FormItemContext } from './provider';

const OMIT_PROPS = ['class', 'value', 'readonly', 'popupOnFocus', 'popup', 'onPopup', 'api', 'children'] as const;

/**
 * 下拉框组件
 */
export const ComboBox = (
  props?: JSX.HTMLAttributes<never> &
    PopupProps & {
      /**
       * 值
       */
      value?: any;
      /**
       * 值样式
       *
       * @param value 当前值
       */
      format?(value: any): string;
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
  let popup: PopupApi;

  const formItem = useContext(FormItemContext);

  const initFormItem = (dom: HTMLInputElement) => {
    watch(
      () => props.value,
      (value) => formItem.setValue(value),
    );

    formItem.init(dom);
  };

  return (
    <div class={combineClass('combobox', props.class)} {...omitProps(props, OMIT_PROPS)}>
      <div class="combobox-host" {...disableAutoCloseEvent}>
        <input
          ref={formItem && initFormItem}
          class="combobox-input"
          value={props.format ? props.format(props.value) : '' + (props.value || '')}
          readonly={props.readonly}
          onfocus={() => props.popupOnFocus && popup.openPopup()}
          onclick={() => props.readonly && !props.popupOnFocus && popup.togglePopup()}
        ></input>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => popup.togglePopup()}>
          <use href="#icon-dropdown"></use>
        </svg>
      </div>
      <Popup
        api={(api) => {
          popup = api;
          props.api && props.api(popup);
        }}
        onPopup={props.onPopup}
        {...props.popup}
      >
        {props.children}
      </Popup>
    </div>
  );
};
