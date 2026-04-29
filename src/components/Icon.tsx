import { JSX } from '../jsx';
import { combineClass, omitProps } from '../reactive';

const OMIT_PROPS = ['class', 'name'] as const;

/**
 * 图标组件
 */
export const Icon = (props?: JSX.SvgSVGAttributes<never> & { name: string }) => {
  return (
    <svg class={combineClass('icon', props.class)} aria-hidden={true} {...omitProps(props, OMIT_PROPS)}>
      <use href={'#icon-' + props.name}></use>
    </svg>
  );
};
