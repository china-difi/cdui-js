import { createSignal, combineClass } from '../reactive';

import { JSX } from '../jsx';

export const MonthPicker = (
  props: Omit<JSX.HTMLAttributes<never>, 'children'> & {
    /**
     * 日期值
     */
    value?: Date | string | number;
    /**
     * 值变更事件
     */
    onchange?: (event: CustomEvent) => void;
    /**
     * 禁用函数
     */
    disableFn?: (year: number, month: number, date: number) => boolean;
  },
) => {
  return <div></div>;
};
