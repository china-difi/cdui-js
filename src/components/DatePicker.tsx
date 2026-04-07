import { JSX } from '../jsx';
import { combineClass, createSignal, omitProps, render, useContext, watch } from '../reactive';
import { disableAutoCloseEvent } from '../dom';
import { initDropdown, PopupApi } from '../popup';

import { Canlendar, parseDate } from './Canlendar';
import { FormItemContext } from './provider';

const Date_regex = /[YyMDdHhmsSQq]+/g;
const Date_zeros = ['', '0', '00', '000', '0000'];

const DATE_GET_YEAR = 'getFullYear';
const DATE_GET_MONTH = 'getMonth';
const DATE_GET_DATE = 'getDate';
const DATE_GET_HOUR = 'getHours';
const DATE_GET_MINUTE = 'getMinutes';
const DATE_GET_SECOND = 'getSeconds';

export const formatDate = (date: Date, format: string) => {
  if (date) {
    switch (format || (format = 'yyyy-MM-dd')) {
      case 'GMT':
      case 'ISO':
      case 'UTC':
      case 'Date':
      case 'Time':
      case 'Locale':
      case 'LocaleDate':
      case 'LocaleTime':
        return (date as unknown as { [key: string]: Function })['to' + format + 'String']();

      default:
        return format.replace(Date_regex, (text) => {
          let length = text.length;
          let value;

          switch (text[0]) {
            case 'y':
            case 'Y':
              value = date[DATE_GET_YEAR]();
              break;

            case 'M':
              value = date[DATE_GET_MONTH]() + 1;
              break;

            case 'd':
              value = date[DATE_GET_DATE]();
              break;

            case 'H':
            case 'h':
              value = date[DATE_GET_HOUR]();
              break;

            case 'm':
              value = date[DATE_GET_MINUTE]();
              break;

            case 's':
              value = date[DATE_GET_SECOND]();
              break;

            case 'S':
              value = date.getMilliseconds();
              break;

            case 'Q':
            case 'q':
              value = ((date[DATE_GET_MONTH]() + 3) / 3) | 0;
              break;
          }

          text = '' + value;
          length -= text.length;

          return length <= 0 ? text : Date_zeros[length] + text;
        });
    }
  }

  return '';
};

const OMIT_PROPS = ['class', 'value', 'format', /*'readonly',*/ 'popupOnFocus', 'disableFn', 'api'] as const;

/**
 * 日期选择组件
 */
export const DatePicker = (
  props?: Omit<JSX.HTMLAttributes<never>, 'children' | 'onchange'> & {
    /**
     * 值
     */
    value?: string | number | Date;
    /**
     * 日期格式
     */
    format?: string;
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
     * 禁用函数
     */
    disableFn?: (year: number, month: number, date: number) => boolean;
    /**
     * 外部调用接口
     */
    api?: (api: PopupApi) => void;
  },
) => {
  let api: PopupApi;

  const formItem = useContext(FormItemContext);

  const initFormItem = (dom: HTMLElement) => {
    watch(
      () => props.value,
      (value) => formItem.setValue(value),
    );

    formItem.init(dom);
  };

  return (
    <div
      ref={(dom: HTMLElement) => {
        api = initDropdown(
          dom,
          () => (
            <Canlendar
              value={props.value}
              onchange={(event) => {
                dom.dispatchEvent(
                  new CustomEvent('change', {
                    detail: event.detail,
                    bubbles: true, // 允许事件冒泡
                  }),
                );

                api.closePopup();
              }}
              disableFn={props.disableFn}
            ></Canlendar>
          ),
          { alignWidth: false },
        );

        formItem && initFormItem(dom);
        props.api && props.api(api);
      }}
      class={combineClass('datepicker', props.class)}
      {...disableAutoCloseEvent}
      {...(omitProps(props, OMIT_PROPS) as any)}
    >
      <input
        class="datepicker-input"
        value={formatDate(parseDate(props.value), props.format)}
        readonly={true}
        onfocus={() => props.popupOnFocus && api.openPopup()}
        onclick={() => !props.popupOnFocus && api.togglePopup()}
      ></input>
      <svg class="datepicker-icon icon icon-s" aria-hidden={true} onclick={() => api.togglePopup()}>
        <use href="#icon-dropdown"></use>
      </svg>
    </div>
  );
};
