import { JSX } from '../jsx';

export const Button = (props?: JSX.HTMLAttributes<never>) => {
  return <button type="button" {...props}></button>;
};
