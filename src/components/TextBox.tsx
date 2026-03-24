import { JSX } from '../jsx';
import { combineClass, splitProps } from '../reactive';

export const TextBox = (props?: JSX.SvgSVGAttributes<never>) => {
  let [thisProps, restProps] = splitProps(props, ['class']);

  return <input type="text" class={combineClass('textbox', thisProps.class)} {...restProps}></input>;
};
