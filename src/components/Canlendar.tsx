import { JSX } from '../jsx';
import { createSignal, combineClass, omitProps, render } from '../reactive';
import { Canlendar as i18n } from '../i18n';
import { replaceTemplate } from '../template';

import { For } from './For';
import { MonthWidget } from './MonthWidget';

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

export const getYearMonth = (date: Date) => {
  return [date.getFullYear(), date.getMonth() + 1] as const;
};

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
  let today = todayValue.getFullYear() === year && todayValue.getMonth() + 1 === month ? todayValue.getDate() : -1;
  let selected =
    selectedValue && selectedValue.getFullYear() === year && selectedValue.getMonth() + 1 === month
      ? selectedValue.getDate()
      : -1;

  for (let i = from; i <= to; i++) {
    items.push(
      `<span class="datewidget-item${className}${today === i ? ' today' : ''}${selected === i ? ' selected' : ''}${
        disableFn && disableFn(year, month, i) ? ' disabled' : ''
      }" data-day="${year + '|' + month + '|' + i}">${i}</span>`,
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
  currentValue: readonly [year: number, month: number],
  selectedValue?: Date,
  disableFn?: (year: number, month: number, date: number) => boolean,
) => {
  let today = new Date();
  let year = currentValue[0];
  let month = currentValue[1];
  let firstDate = new Date(year, month - 1, 1); // 获取当前月的第一天

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
  days = new Date(year, month, 0).getDate();

  // 渲染本月日期
  renderDates(items, year, month, 1, days, '', today, selectedValue, disableFn);

  // 当前月最后一天没有占满，渲染下月数据
  if ((index += days) < 42) {
    renderNextMonthItems(items, year, month + 1, 42 - index, today, selectedValue, disableFn);
  }

  return items.join('');
};

const switchMonth = (value: readonly [year: number, month: number], offset: 1 | -1) => {
  let year = value[0];
  let month = value[1] + offset;

  if (month > 12) {
    year++;
    month = 1;
  } else if (!month) {
    year--;
    month = 12;
  }

  return [year, month] as const;
};

const formatMonth = (month: number) => {
  return month > 9 ? month : '0' + month;
};

const showMonthWidget = (dom: HTMLElement, setCurrentValue: (value) => void, selectedValue?: Date) => {
  let value =
    selectedValue && ([selectedValue.getFullYear(), selectedValue.getMonth() + 1] as [year: number, month: number]);

  render(
    () => (
      <MonthWidget
        value={value}
        style={{ position: 'absolute', top: '0', left: '0', width: '100%', border: 'none' }}
        onchange={(event) => {
          let result = event.detail;

          dom.removeChild(event.target as HTMLElement);

          if (!selectedValue || result[0] !== value[0] || result[1] !== value[1]) {
            setCurrentValue(result);
          }
        }}
      ></MonthWidget>
    ),
    dom,
  );
};

const OMIT_PROPS = ['class', 'value', 'disableFn'] as const;

/**
 * 日历组件
 */
export const Canlendar = (
  props: Omit<JSX.HTMLAttributes<never>, 'children' | 'onchange'> & {
    /**
     * 日期值
     */
    value?: Date | string | number;
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

  const [selectedValue, setSelectedValue] = createSignal(parseDate(props.value));
  const [currentValue, setCurrentValue] = createSignal(getYearMonth(selectedValue() || new Date()));

  return (
    <div
      ref={dom as any}
      class={combineClass('canlendar datewidget', props.class)}
      {...(omitProps(props, OMIT_PROPS) as any)}
    >
      <div class="datewidget-header canlendar-header">
        <div class="datewidget-title" onclick={() => showMonthWidget(dom, setCurrentValue, selectedValue())}>
          {replaceTemplate(i18n.Title, currentValue()[0], formatMonth(currentValue()[1]))}
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
        class="datewidget-body canlendar-body"
        onclick={(event) => {
          let target = event.target as HTMLElement;
          let day;

          while (target && target !== dom) {
            if ((day = target.dataset.day)) {
              // 没有选中
              if (!target.classList.contains('selected')) {
                day = day.split('|');
                day = new Date(day[0] | 0, (day[1] | 0) - 1, day[2] | 0);

                setSelectedValue(day);

                dom.dispatchEvent(
                  new CustomEvent('change', {
                    detail: day,
                    bubbles: true, // 允许事件冒泡
                  }),
                );
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
