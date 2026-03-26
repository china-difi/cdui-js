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
    onValueChange?: (value: Date) => void;
    /**
     * 禁用函数
     */
    disableFn?: (year: number, month: number, date: number) => boolean;
  },
) => {
  return <div></div>;
};
