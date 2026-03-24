import { createSignal, combineClass, splitProps } from '../reactive';

import { JSX } from '../jsx';
import { Canleandar as i18n } from '../i18n';
import { replaceTemplate } from '../template';
import { For } from './For';

// 渲染日期项
const renderDates = (
  items: string[],
  year: number,
  month: number,
  from: number,
  to: number,
  className: string,
  todayDate: Date,
  selectedDate?: Date,
  disableDate?: (year: number, month: number, date: number) => boolean,
) => {
  let today = todayDate.getFullYear() === year && todayDate.getMonth() === month ? todayDate.getDate() : -1;
  let selected =
    selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month
      ? selectedDate.getDate()
      : -1;

  for (let i = from; i <= to; i++) {
    items.push(
      `<span class="canlendar-date${className}${today === i ? ' today' : ''}${selected === i ? ' selected' : ''}${
        disableDate && disableDate(year, month, i) ? ' disabled' : ''
      }" data-date="${year + '|' + month + '|' + i}">${i}</span>`,
    );
  }
};

// 渲染上月日期项
const renderPrevMonthItems = (
  items: string[],
  year: number,
  month: number,
  index: number,
  todayDate: Date,
  selectedDate?: Date,
  disableDate?: (year: number, month: number, date: number) => boolean,
) => {
  // 获取上月天数
  let days = new Date(year, month, 0).getDate();

  if (month > 0) {
    month--;
  } else {
    year--;
    month = 11;
  }

  renderDates(items, year, month, days - index + 1, days, ' prev-month', todayDate, selectedDate, disableDate);
};

const renderNextMonthItems = (
  items: string[],
  year: number,
  month: number,
  days: number,
  todayDate: Date,
  selectedDate?: Date,
  disableDate?: (year: number, month: number, date: number) => boolean,
) => {
  if (month < 11) {
    month++;
  } else {
    year++;
    month = 0;
  }

  renderDates(items, year, month, 1, days, ' next-month', todayDate, selectedDate, disableDate);
};

const renderItems = (
  showDate: Date,
  selectedDate?: Date,
  disableDate?: (year: number, month: number, date: number) => boolean,
) => {
  let today = new Date();
  let year = showDate.getFullYear();
  let month = showDate.getMonth();
  let firstDate = new Date(year, month, 1); // 获取当前月的第一天

  let firstWeek = firstDate.getDay();
  let items = [];
  let index = 0;
  let days;

  // 当前月第一天不是周一，渲染上月数据
  if (firstWeek !== 1) {
    index = firstWeek > 0 ? firstWeek - 1 : 6;
    renderPrevMonthItems(items, year, month, index, today, selectedDate, disableDate);
  }

  // 获取当前月的天数
  days = new Date(year, month + 1, 0).getDate();
  // 渲染本月日期
  renderDates(items, year, month, 1, days, '', today, selectedDate, disableDate);

  // 当前月最后一天没有占满，渲染下月数据
  if ((index += days) < 42) {
    renderNextMonthItems(items, year, month, 42 - index, today, selectedDate, disableDate);
  }

  return items.join('');
};

const switchMonth = (value: Date, offset: 1 | -1) => {
  let date = new Date(value.getTime());
  let month = value.getMonth();

  date.setMonth(month + offset);

  return date;
};

export const parseDate = (value: Date | string | number) => {
  if (value) {
    switch (typeof value) {
      case 'number':
        return new Date(value);

      case 'string':
        return new Date(value.replace(/\//g, '-'));

      default:
        return value;
    }
  }
};

const formatMonth = (value: Date) => {
  let month = value.getMonth() + 1;

  return month > 9 ? month : '0' + month;
};

export const Canlendar = (
  props: Omit<JSX.HTMLAttributes<never>, 'children'> & {
    /**
     * 日期值
     */
    value?: Date | string | number;
    /**
     * 值变更事件
     */
    onValueChange?: (value: Date) => void;
    /**
     * 禁用函数
     */
    disableDate?: (year: number, month: number, date: number) => boolean;
  },
) => {
  const [thisProps, restProps] = splitProps(props, ['class', 'value', 'onValueChange', 'disableDate']);

  let domMonth: HTMLElement;
  let domBody: HTMLElement;

  const [selectedDate, setSelectedDate] = createSignal(parseDate(thisProps.value));
  const [showDate, setShowDate] = createSignal(selectedDate() || new Date());

  return (
    <div class={combineClass('canlendar', thisProps.class)} {...restProps}>
      <div class="canlendar-header">
        <div ref={domMonth as any} class="canlendar-month">
          {replaceTemplate(i18n.Month, showDate().getFullYear(), formatMonth(showDate()))}
        </div>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setShowDate(switchMonth(showDate(), -1))}>
          <use href="#icon-backward"></use>
        </svg>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setShowDate(switchMonth(showDate(), 1))}>
          <use href="#icon-forward"></use>
        </svg>
      </div>
      <div class="canlendar-weeks">
        <For each={i18n.Weeks}>{(item) => <span>{item}</span>}</For>
      </div>
      <div
        ref={domBody as any}
        class="canlendar-body"
        onclick={(event) => {
          let target = event.target as HTMLElement;
          let date, onValueChange;

          if (target && (date = target.dataset.date) && (onValueChange = thisProps.onValueChange)) {
            let dom = domBody.querySelector('.selected') as HTMLElement;

            if (dom !== target) {
              date = date.split('|');
              date = new Date(date[0] | 0, date[1] | 0, date[2] | 0);

              setSelectedDate(date);
              onValueChange(date);
            }
          }
        }}
        innerHTML={renderItems(showDate(), selectedDate(), thisProps.disableDate)}
      ></div>
    </div>
  );
};
