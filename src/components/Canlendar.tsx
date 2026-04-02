import { JSX } from '../jsx';
import { createSignal, combineClass, omitProps } from '../reactive';
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
  todayValue: Date,
  selectedValue?: Date,
  disableFn?: (year: number, month: number, date: number) => boolean,
) => {
  let today = todayValue.getFullYear() === year && todayValue.getMonth() === month ? todayValue.getDate() : -1;
  let selected =
    selectedValue && selectedValue.getFullYear() === year && selectedValue.getMonth() === month
      ? selectedValue.getDate()
      : -1;

  for (let i = from; i <= to; i++) {
    items.push(
      `<span class="datewidget-item${className}${today === i ? ' today' : ''}${selected === i ? ' selected' : ''}${
        disableFn && disableFn(year, month, i) ? ' disabled' : ''
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
  todayValue: Date,
  selectedValue?: Date,
  disableFn?: (year: number, month: number, date: number) => boolean,
) => {
  // 获取上月天数
  let days = new Date(year, month, 0).getDate();

  if (month > 0) {
    month--;
  } else {
    year--;
    month = 11;
  }

  renderDates(items, year, month, days - index + 1, days, ' prev-block', todayValue, selectedValue, disableFn);
};

const renderNextMonthItems = (
  items: string[],
  year: number,
  month: number,
  days: number,
  todayValue: Date,
  selectedValue?: Date,
  disableFn?: (year: number, month: number, date: number) => boolean,
) => {
  if (month < 11) {
    month++;
  } else {
    year++;
    month = 0;
  }

  renderDates(items, year, month, 1, days, ' next-block', todayValue, selectedValue, disableFn);
};

const renderItems = (
  currentValue: Date,
  selectedValue?: Date,
  disableFn?: (year: number, month: number, date: number) => boolean,
) => {
  let today = new Date();
  let year = currentValue.getFullYear();
  let month = currentValue.getMonth();
  let firstDate = new Date(year, month, 1); // 获取当前月的第一天

  let firstWeek = firstDate.getDay();
  let items = [];
  let index = 0;
  let days;

  // 当前月第一天不是周一，渲染上月数据
  if (firstWeek !== 1) {
    index = firstWeek > 0 ? firstWeek - 1 : 6;
    renderPrevMonthItems(items, year, month, index, today, selectedValue, disableFn);
  }

  // 获取当前月的天数
  days = new Date(year, month + 1, 0).getDate();
  // 渲染本月日期
  renderDates(items, year, month, 1, days, '', today, selectedValue, disableFn);

  // 当前月最后一天没有占满，渲染下月数据
  if ((index += days) < 42) {
    renderNextMonthItems(items, year, month, 42 - index, today, selectedValue, disableFn);
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

const OMIT_PROPS = ['class', 'value', 'onValueChange', 'disableFn'] as const;

/**
 * 日历组件
 */
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
    disableFn?: (year: number, month: number, date: number) => boolean;
  },
) => {
  let domTitle: HTMLElement;
  let domBody: HTMLElement;

  const [selectedValue, setSelectedValue] = createSignal(parseDate(props.value));
  const [currentValue, setCurrentValue] = createSignal(selectedValue() || new Date());

  return (
    <div class={combineClass('canlendar datewidget', props.class)} {...omitProps(props, OMIT_PROPS)}>
      <div class="datewidget-header canlendar-header">
        <div ref={domTitle as any} class="datewidget-title">
          {replaceTemplate(i18n.Title, currentValue().getFullYear(), formatMonth(currentValue()))}
        </div>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(switchMonth(currentValue(), -1))}>
          <use href="#icon-backward"></use>
        </svg>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(switchMonth(currentValue(), 1))}>
          <use href="#icon-forward"></use>
        </svg>
      </div>
      <div class="datewidget-header canlendar-weeks">
        <For each={i18n.Weeks}>{(item) => <span>{item}</span>}</For>
      </div>
      <div
        ref={domBody as any}
        class="datewidget-body canlendar-body"
        onclick={(event) => {
          let target = event.target as HTMLElement;
          let date;

          while (target && target !== domBody) {
            if ((date = target.dataset.date)) {
              // 没有选中
              if (!target.classList.contains('selected')) {
                date = date.split('|');
                date = new Date(date[0] | 0, date[1] | 0, date[2] | 0);

                setSelectedValue(date);
                props.onValueChange && props.onValueChange(date);
              }

              break;
            } else {
              target = target.parentNode as HTMLElement;
            }
          }
        }}
        innerHTML={renderItems(currentValue(), selectedValue(), props.disableFn)}
      ></div>
    </div>
  );
};
