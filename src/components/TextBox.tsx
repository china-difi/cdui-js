import { JSX } from '../jsx';
import { combineClass, omitProps, useContext } from '../reactive';
import { FormItemContext } from './provider';

const OMIT_PROPS = ['class', 'value', 'onchange'] as const;

export const TextBox = (props?: JSX.InputHTMLAttributes<never>) => {
  const formItem = useContext(FormItemContext);

  const initFormItem = (dom: HTMLInputElement) => {
    dom.addEventListener('change', () => formItem.setValue(dom.value));
    formItem.init(dom);
  };

  return (
    <input
      ref={formItem && initFormItem}
      type="text"
      class={combineClass('textbox', props.class)}
      value={formItem ? formItem.getValue() : props.value}
      {...omitProps(props, OMIT_PROPS)}
    ></input>
  );
};
