import { JSX } from '../jsx';
import { MonthWidget as i18n } from '../i18n';
import { replaceTemplate } from '../template';
import { createSignal, combineClass } from '../reactive';
import { For } from './For';

const getCurrentMonth = () => {
  let date = new Date();
  return [date.getFullYear(), date.getMonth() + 1] as [year: number, month: number];
};

const MONTH_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const MonthItem = (props: {
  value: number;
  selectedValue: [year: number, month: number];
  currentValue: [year: number, month: number];
  onclick: (event: Event) => void;
  disableFn?: (year: number, month: number) => boolean;
}) => {
  let year = 0;
  let month = props.value;

  if (month > 12) {
    year = 1;
    month -= 12;
  }

  const checkCurrent = () => {
    const today = new Date();
    const currentValue = props.currentValue;

    return today.getFullYear() === currentValue[0] + year && today.getMonth() + 1 === month;
  };

  const checkSelected = () => {
    let selectedValue = props.selectedValue;
    const currentValue = props.currentValue;

    return selectedValue && selectedValue[0] === currentValue[0] + year && selectedValue[1] === month;
  };

  return (
    <span
      class={`datewidget-item${year ? ' next-block' : ''}${checkCurrent() ? ' today' : ''}${
        checkSelected() ? ' selected' : ''
      }${props.disableFn && props.disableFn(props.currentValue[0] + year, month) ? ' disabled' : ''}`}
      data-month={`${year}|${month}`}
      onclick={props.onclick}
    >
      {replaceTemplate(i18n.Format, month)}
    </span>
  );
};

/**
 * 月份组件
 */
export const MonthWidget = (
  props: Omit<JSX.HTMLAttributes<never>, 'children'> & {
    /**
     * 年月值
     */
    value?: [year: number, month: number];
    /**
     * 值变更事件
     */
    onValueChange?: (value: Date) => void;
    /**
     * 禁用函数
     */
    disableFn?: (year: number, month: number) => boolean;
  },
) => {
  let domTitle: HTMLElement;
  let domBody: HTMLElement;

  const [selectedValue, setSelectedValue] = createSignal(props.value);
  const [currentValue, setCurrentValue] = createSignal(selectedValue() || getCurrentMonth());

  const onclick = (event: Event) => {
    let target = event.currentTarget as HTMLElement;
    let month = target.dataset.month as any;

    // 没有选中
    if (month && !target.classList.contains('selected')) {
      month = month.split('|');
      month = [currentValue()[0] + (month[0] | 0), month[1] | 0];

      setSelectedValue(month);
      props.onValueChange && props.onValueChange(month);
    }
  };

  return (
    <div class={combineClass('monthwidget datewidget', props.class)}>
      <div class="datewidget-header">
        <div ref={domTitle as any} class="datewidget-title">
          {replaceTemplate(i18n.Title, currentValue()[0])}
        </div>
        <svg
          class="icon icon-s"
          aria-hidden={true}
          onclick={() => setCurrentValue([currentValue()[0] - 1, currentValue()[1]])}
        >
          <use href="#icon-backward"></use>
        </svg>
        <svg
          class="icon icon-s"
          aria-hidden={true}
          onclick={() => setCurrentValue([currentValue()[0] + 1, currentValue()[1]])}
        >
          <use href="#icon-forward"></use>
        </svg>
      </div>
      <div ref={domBody as any} class="datewidget-body">
        <For each={MONTH_LIST}>
          {(item) => (
            <MonthItem
              value={item}
              selectedValue={selectedValue()}
              currentValue={currentValue()}
              onclick={onclick}
            ></MonthItem>
          )}
        </For>
      </div>
    </div>
  );
};
