import { createMemo, mapArray } from 'solid-js';

import { JSX } from '../jsx';

export const For = <T, U extends JSX.Element>(props: {
  /**
   * 要循环的数据集合
   */
  each: readonly T[];
  /**
   * 子节点
   *
   * @param item 数据项
   * @param index 索引
   * @returns JSX.Element
   */
  children: (item: T, index: () => number) => U;
}) => {
  return createMemo(
    mapArray(() => props.each, props.children),
    void 0,
    {
      name: 'value',
    }
  ) as unknown as JSX.Element;
};
