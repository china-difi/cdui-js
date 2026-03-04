import { JSX, createMemo, createRoot, onCleanup } from 'solid-js';

export interface SwitchProps {
  /**
   * 要切换的分支
   */
  case?: {
    /**
     * 目标组件
     */
    component: () => JSX.Element;
    /**
     * 缓存 id
     */
    id?: string;
  };
}

export const Switch = (props: SwitchProps) => {
  let roots = {};
  let disposes = {};

  onCleanup(() => {
    for (let key in disposes) {
      disposes[key]();
    }

    roots = disposes = null;
  });

  return createMemo(() => {
    let branch = props.case;
    let id;

    if (branch) {
      if ((id = branch.id)) {
        return (
          roots[id] ||
          (roots[id] = createRoot((dispose) => {
            disposes[id] = dispose;
            return branch.component();
          }))
        );
      }

      return branch.component();
    }
  }) as unknown as JSX.Element;
};
