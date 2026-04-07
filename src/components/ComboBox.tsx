import { JSX } from '../jsx';
import { combineClass, omitProps, useContext, watch } from '../reactive';
import { disableAutoCloseEvent } from '../dom';
import { PopupApi, initDropdown } from '../popup';

import { FormItemContext } from './provider';

const OMIT_PROPS = ['class', 'value', 'format', /*'readonly', */ 'popup', 'popupOnFocus', 'api'] as const;

/**
 * 下拉框组件
 */
export const ComboBox = (
  props?: Omit<JSX.HTMLAttributes<never>, 'children'> & {
    /**
     * 弹出层
     */
    popup: () => JSX.Element;
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
    // /**
    //  * 是否只读
    //  */
    // readonly?: boolean;
    /**
     * 获取焦点时是否自动弹出
     */
    popupOnFocus?: boolean;
    /**
     * 值变更事件
     */
    onchange?: (event: CustomEvent<Date>) => void;
    /**
     * 外部调用接口
     */
    api: (api: PopupApi) => void;
  },
) => {
  const formItem = useContext(FormItemContext);

  const initFormItem = (dom: HTMLInputElement) => {
    watch(
      () => props.value,
      (value) => formItem.setValue(value),
    );

    formItem.init(dom);
  };

  let api: PopupApi;

  return (
    <div
      ref={(dom) => {
        api = initDropdown(dom, () => <div class="combobox-popup">{props.popup()}</div>);
        props.api && props.api(api);
      }}
      class={combineClass('combobox', props.class)}
      {...disableAutoCloseEvent}
      {...omitProps(props, OMIT_PROPS)}
    >
      <input
        ref={formItem && initFormItem}
        class="combobox-input"
        value={props.format ? props.format(props.value) : '' + (props.value || '')}
        readonly={true}
        onfocus={() => props.popupOnFocus && api.openPopup()}
        onclick={() => !props.popupOnFocus && api.togglePopup()}
      ></input>
      <svg class="combobox-icon icon icon-s" aria-hidden={true} onclick={() => api.togglePopup()}>
        <use href="#icon-dropdown"></use>
      </svg>
    </div>
  );
};
