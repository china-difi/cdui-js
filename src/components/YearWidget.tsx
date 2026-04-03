import { JSX } from '../jsx';
import { YearWidget as i18n } from '../i18n';
import { replaceTemplate } from '../template';
import { createSignal, combineClass, omitProps } from '../reactive';

// 渲染年项
const renderYears = (
  items: string[],
  from: number,
  to: number,
  className: string,
  todayValue: number,
  selectedValue?: number,
  disableFn?: (year: number) => boolean,
) => {
  for (let i = from; i < to; i++) {
    items.push(
      `<span class="datewidget-item${className}${todayValue === i ? ' today' : ''}${selectedValue === i ? ' selected' : ''}${
        disableFn && disableFn(i) ? ' disabled' : ''
      }" data-year="${i}">${i}</span>`,
    );
  }
};

const renderItems = (currentValue: number, selectedValue?: number, disableFn?: (year: number) => boolean) => {
  let today = new Date();
  let items = [];

  // 渲染前面 10 年
  renderYears(items, currentValue, currentValue + 10, '', today.getFullYear(), selectedValue, disableFn);

  // 渲染后面 6 年
  renderYears(
    items,
    currentValue + 10,
    currentValue + 16,
    ' next-block',
    today.getFullYear(),
    selectedValue,
    disableFn,
  );

  return items.join('');
};

const OMIT_PROPS = ['class', 'value', 'disableFn'] as const;

/**
 * 年份组件
 */
export const YearWidget = (
  props: Omit<JSX.HTMLAttributes<never>, 'children' | 'onchange'> & {
    /**
     * 年值
     */
    value?: number;
    /**
     * 值变更事件
     */
    onchange?: (event: CustomEvent<number>) => void;
    /**
     * 禁用函数
     */
    disableFn?: (year: number) => boolean;
  },
) => {
  let dom: HTMLElement;

  const [selectedValue, setSelectedValue] = createSignal(props.value);
  const [currentValue, setCurrentValue] = createSignal((((selectedValue() || new Date().getFullYear()) / 10) | 0) * 10);

  return (
    <div
      ref={dom as any}
      class={combineClass('yearwidget datewidget', props.class)}
      {...(omitProps(props, OMIT_PROPS) as any)}
    >
      <div class="datewidget-header">
        <div class="datewidget-title">{replaceTemplate(i18n.Title, currentValue(), currentValue() + 9)}</div>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(currentValue() - 10)}>
          <use href="#icon-backward"></use>
        </svg>
        <svg class="icon icon-s" aria-hidden={true} onclick={() => setCurrentValue(currentValue() + 10)}>
          <use href="#icon-forward"></use>
        </svg>
      </div>
      <div
        class="datewidget-body yearwidget-body"
        onclick={(event) => {
          let target = event.target as HTMLElement;
          let year;

          while (target && target !== dom) {
            if ((year = +target.dataset.year)) {
              // 父节点
              let parent = dom.parentNode as HTMLElement;
              // 是否嵌入到年月组件中
              let inline = parent.classList.contains('datewidget');

              // 没有选中
              if (inline || !target.classList.contains('selected')) {
                setSelectedValue(year);

                dom.dispatchEvent(
                  new CustomEvent('change', {
                    detail: year,
                    bubbles: !inline, // 允许事件冒泡
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
