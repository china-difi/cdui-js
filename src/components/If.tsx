import { createMemo } from 'solid-js';

import { JSX } from '../jsx';

/**
 * 条件渲染
 *
 * @param props 属性集合
 */
export const If = (props: { when: any; children: JSX.Element | JSX.Element[]; else?: JSX.Element | JSX.Element[] }) => {
  return createMemo(() => {
    return props.when ? props.children : props.else;
  }) as unknown as JSX.Element;
};
