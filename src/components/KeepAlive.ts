import { JSX, createMemo, createRoot, onCleanup } from 'solid-js';

export const KeepAlive = (props: {
  /**
   * 是否显示
   */
  show: boolean;
  children: JSX.Element | JSX.Element[];
}) => {
  let root, ondestory;

  onCleanup(() => {
    ondestory && ondestory();
  });

  return createMemo(() => {
    return (
      props.show &&
      (root ||
        (root = createRoot((dispose) => {
          ondestory = dispose;
          return props.children;
        })))
    );
  }) as unknown as JSX.Element;
};
