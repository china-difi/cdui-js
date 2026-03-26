import { createSignal, combineClass } from '../reactive';

import { JSX } from '../jsx';
import { Canleandar as i18n } from '../i18n';
import { replaceTemplate } from '../template';
import { For } from './For';

const formatMonth = (month: number) => {
  return month > 9 ? month : '0' + month;
};

const getCurrentMonth = () => {
  let date = new Date();
  return [date.getFullYear(), date.getMonth() + 1];
};

const switchMonth = (value: [year: number, month: number], offset: 1 | -1) => {
  let year = value[0];
  let month = value[1] + offset;

  if (month === 0) {
    month = 12;
    year--;
  } else if (month > 12) {
    month = 1;
    year++;
  }

  return [year, month];
};

const MONTH_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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
    disableFn?: (year: number, month: number, date: number) => boolean;
  },
) => {
  let domTitle: HTMLElement;
  let domBody: HTMLElement;

  const [selectedValue, setSelectedDate] = createSignal(props.value);
  const [currentValue, setCurrentValue] = createSignal(selectedValue() || getCurrentMonth());

  return (
    <div>
      <div class="monthwidget-header">
        <div ref={domTitle as any} class="monthwidget-title">
          {replaceTemplate(i18n.Month, currentValue()[0], formatMonth(currentValue()[1]))}
        </div>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(switchMonth(selectedValue(), -1))}>
          <use href="#icon-backward"></use>
        </svg>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(switchMonth(selectedValue(), 1))}>
          <use href="#icon-forward"></use>
        </svg>
      </div>
      <div
        ref={domBody as any}
        class="monthwidget-body"
        onclick={(event) => {
          let target = event.target as HTMLElement;
          let value, onValueChange;

          if (target && (onValueChange = props.onValueChange)) {
            let dom = domBody.querySelector('.selected') as HTMLElement;

            if (dom !== target) {
              value = [currentValue()[0], +target.textContent];

              setSelectedDate(value);
              onValueChange(value);
            }
          }
        }}
      >
        <For each={MONTH_LIST}>{(item) => <span>{item}</span>}</For>
      </div>
    </div>
  );
};
