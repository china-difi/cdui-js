import { JSX } from '../jsx';
import { combineClass, createSignal, splitProps } from '../reactive';
import { disableAutoCloseEvent } from '../dom';
import { For } from './For';
import { Popup, PopupApi } from './Popup';
import { parseDate } from './Canlendar';

const formatDate = (date: Date, format: string) => {
  return date ? date.toLocaleString() : '';
};

const showPopup = () => {};

const MobileTouchScroll = (props: { items: (number | string)[] }) => {
  return (
    <div>
      <For each={props.items}>{(item) => <div>{item}</div>}</For>
    </div>
  );
};

const formatMonth = (value: Date) => {
  let month = value.getMonth() + 1;

  return month > 9 ? month : '0' + month;
};

// const computeMobileList = (value: Date) => {
//   let year = value.getFullYear();
//   let month = value.getMonth() + 1;
//   let date = value.getDate();

//   return [
//     year > 5 ? [year - 2, year - 1, year, year + 1, year + 2]: [1,2,3,4,5],
//     [formatMonth(month - 2), ]
//   ];
// };

// const MobileDatePicker = (yearList: number[], monthList: string[], dateList: string[]) => {
//   return (
//     <div>
//       <MobileTouchScroll items={yearList}></MobileTouchScroll>
//       <MobileTouchScroll items={monthList}></MobileTouchScroll>
//       <MobileTouchScroll items={dateList}></MobileTouchScroll>
//     </div>
//   );
// };

/**
 * 日期选择组件
 */
export const DatePicker = (
  props?: JSX.HTMLAttributes<never> & {
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
  },
) => {
  let [thisProps, restProps] = splitProps(props, ['class', 'value', 'readonly', 'format', 'children']);
  let popup: PopupApi;

  const [value, setValue] = createSignal(thisProps.value && parseDate(thisProps.value));

  return (
    <div class={combineClass('datepicker', thisProps.class)} {...restProps}>
      <div class="datepicker-host" {...disableAutoCloseEvent}>
        <input
          class="datepicker-input"
          value={formatDate(value(), thisProps.format)}
          readonly={thisProps.readonly}
          onclick={() => thisProps.readonly && popup.togglePopup()}
        ></input>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => popup.togglePopup()}>
          <use href="#icon-dropdown"></use>
        </svg>
      </div>
      <Popup api={(api) => (popup = api)} onPopup={() => showPopup()}>
        {thisProps.children}
      </Popup>
    </div>
  );
};
