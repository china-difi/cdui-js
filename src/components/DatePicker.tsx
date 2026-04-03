import { JSX } from '../jsx';
import { combineClass, createSignal, omitProps, render } from '../reactive';
import { disableAutoCloseEvent } from '../dom';
import { Popup, PopupApi } from './Popup';
import { Canlendar, parseDate } from './Canlendar';

const formatDate = (date: Date, format: string) => {
  return date ? date.toLocaleString() : '';
};

const showCanlendar = (dom: HTMLElement) => {
  let popup: PopupApi;

  render(
    () => (
      <Popup
        api={(api) => {
          popup = api;
          api.openPopup();
        }}
      >
        <Canlendar></Canlendar>
      </Popup>
    ),
    dom,
  );
};

const OMIT_PROPS = ['class', 'value', 'readonly', 'format'] as const;

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
    /**
     * 是否只读
     */
    readonly?: boolean;
    /**
     * 值变更事件
     */
    onchange?: (event: CustomEvent<Date>) => void;
    /**
     * 禁用函数
     */
    disableFn?: (year: number, month: number, date: number) => boolean;
  },
) => {
  let dom: HTMLElement;

  const [value, setValue] = createSignal(props.value && parseDate(props.value));

  return (
    <div ref={dom as any} class={combineClass('datepicker', props.class)} {...(omitProps(props, OMIT_PROPS) as any)}>
      <div class="datepicker-host" {...disableAutoCloseEvent}>
        <input
          class="datepicker-input"
          value={formatDate(value(), props.format)}
          readonly={props.readonly}
          onclick={() => props.readonly && showCanlendar(dom)}
        ></input>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => showCanlendar(dom)}>
          <use href="#icon-dropdown"></use>
        </svg>
      </div>
    </div>
  );
};
