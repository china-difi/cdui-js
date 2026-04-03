import { JSX } from '../jsx';
import { MonthWidget as i18n } from '../i18n';
import { replaceTemplate } from '../template';
import { createSignal, combineClass, omitProps, render } from '../reactive';
import { For } from './For';
import { YearWidget } from './YearWidget';

const MONTH_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const MonthItem = (props: {
  value: number;
  selectedValue: [year: number, month: number];
  currentValue: number;
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

    return today.getFullYear() === props.currentValue + year && today.getMonth() + 1 === month;
  };

  const checkSelected = () => {
    let selectedValue = props.selectedValue;

    return selectedValue && selectedValue[0] === props.currentValue + year && selectedValue[1] === month;
  };

  return (
    <span
      class={`datewidget-item${year ? ' next-block' : ''}${checkCurrent() ? ' today' : ''}${
        checkSelected() ? ' selected' : ''
      }${props.disableFn && props.disableFn(props.currentValue + year, month) ? ' disabled' : ''}`}
      data-month={`${year}|${month}`}
      onclick={props.onclick}
    >
      {replaceTemplate(i18n.Format, month)}
    </span>
  );
};

const showYearWidget = (
  dom: HTMLElement,
  setCurrentValue: (value) => void,
  selectedValue?: [year: number, month: number],
) => {
  render(
    () => (
      <YearWidget
        value={selectedValue && selectedValue[0]}
        style={{ position: 'absolute', top: '0', left: '0', width: '100%', border: 'none' }}
        onchange={(event) => {
          let result = event.detail;

          dom.removeChild(event.target as HTMLElement);

          if (!selectedValue || result !== selectedValue[0]) {
            setCurrentValue(result);
          }
        }}
      ></YearWidget>
    ),
    dom,
  );
};

const OMIT_PROPS = ['class', 'value', 'disableFn'] as const;

/**
 * 月份组件
 */
export const MonthWidget = (
  props: Omit<JSX.HTMLAttributes<never>, 'children' | 'onchange'> & {
    /**
     * 年月值
     */
    value?: [year: number, month: number];
    /**
     * 值变更事件
     */
    onchange?: (value: CustomEvent<[year: number, month: number]>) => void;
    /**
     * 禁用函数
     */
    disableFn?: (year: number, month: number) => boolean;
  },
) => {
  let dom: HTMLElement;

  const [selectedValue, setSelectedValue] = createSignal(props.value);
  const [currentValue, setCurrentValue] = createSignal(selectedValue() ? selectedValue()[0] : new Date().getFullYear());

  const onclick = (event: Event) => {
    let target = event.currentTarget as HTMLElement;
    let month = target.dataset.month as any;

    // 没有选中
    if (month) {
      // 父节点
      let parent = dom.parentNode as HTMLElement;
      // 是否嵌入到日历组件中
      let inline = parent.classList.contains('datewidget');

      if (inline || !target.classList.contains('selected')) {
        month = month.split('|');
        month = [currentValue() + (month[0] | 0), month[1] | 0];

        setSelectedValue(month);

        dom.dispatchEvent(
          new CustomEvent('change', {
            detail: month,
            bubbles: !inline, // 允许事件冒泡
          }),
        );
      }
    }
  };

  return (
    <div
      ref={dom as any}
      class={combineClass('monthwidget datewidget', props.class)}
      {...(omitProps(props, OMIT_PROPS) as any)}
    >
      <div class="datewidget-header">
        <div class="datewidget-title" onclick={() => showYearWidget(dom, setCurrentValue, selectedValue())}>
          {replaceTemplate(i18n.Title, currentValue())}
        </div>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(currentValue() - 1)}>
          <use href="#icon-backward"></use>
        </svg>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(currentValue() + 1)}>
          <use href="#icon-forward"></use>
        </svg>
      </div>
      <div class="datewidget-body">
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
