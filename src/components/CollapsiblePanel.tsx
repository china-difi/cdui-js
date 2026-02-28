import { createSignal, splitProps } from 'solid-js';

import { JSX } from '../jsx';
import { defineProperty } from '../reactive';

const COLLAPSED_CLASS = 'collapsed';

/**
 * 可收拢面板外部调用接口
 */
export interface CollapsiblePanelApi {
  /**
   * 是否收拢
   */
  collapsed: boolean;

  /**
   * 从当前或指定开始大小过渡到指定大小
   *
   * @param size 指定大小
   * @param fromSize 开始大小
   */
  transitionTo(size: string, fromSize?: string): void;
}

/**
 * 可收拢面板（第一个子项为头部区域，收拢时会增加 class "collapsed"）
 */
export const CollapsiblePanel = (
  props: JSX.HTMLAttributes<never> & {
    /**
     * 是否默认收拢
     */
    collapsed?: boolean;
    /**
     * 收拢时的大小（默认为 ''）
     */
    collapsedSize?: string;
    /**
     * 自定义获取展开时的大小（默认为滚动区的大小）
     */
    getExpandedSize?: () => string;
    /**
     * 是否使用过渡动画（需自己设置 height transition，如：will-change: height; transition: height 0.2s linear）
     */
    useTransition?: boolean;
    /**
     * 外部调用接口
     */
    api?: (api: CollapsiblePanelApi) => void;
  },
) => {
  let ref: HTMLElement;

  const [thisProps, restProps] = splitProps(props, [
    'class',
    'collapsed',
    'collapsedSize',
    'getExpandedSize',
    'useTransition',
    'api',
  ]);
  const [collapsed, setCollapsed] = createSignal(thisProps.collapsed || false);

  const transitionTo = (size: string, fromSize?: string) => {
    let style = ref.style;
    let transition = style.transition;

    style.transition = 'none';

    fromSize && (style.height = fromSize);
    style.height = ref.offsetHeight + 'px';

    style.transition = transition;

    setTimeout(() => {
      style.height = size || '';
    });
  };

  const update = (value: boolean) => {
    if (value !== collapsed()) {
      let classList = ref.classList;
      let style = ref.style;

      // 设置成收拢状态
      if (value) {
        if (thisProps.useTransition) {
          style.height = ref.offsetHeight + 'px';

          setTimeout(() => {
            style.height = thisProps.collapsedSize || '';
            classList.add(COLLAPSED_CLASS);
          });
        } else {
          style.height = thisProps.collapsedSize || '';
          classList.add(COLLAPSED_CLASS);
        }
      } else {
        let getExpandedSize = thisProps.getExpandedSize;

        // 设置成展开状态
        if (thisProps.useTransition) {
          style.height = ref.offsetHeight + 'px';

          setTimeout(() => {
            style.height = (getExpandedSize && getExpandedSize()) || ref.scrollHeight + 'px';
            // 移除收拢的 class
            classList.remove(COLLAPSED_CLASS);
          });
        } else {
          style.height = (getExpandedSize && getExpandedSize()) || '';
          // 移除收拢的 class
          classList.remove(COLLAPSED_CLASS);
        }
      }

      setCollapsed(value);
    }
  };

  thisProps.api &&
    thisProps.api(
      defineProperty({ transitionTo }, 'collapsed', {
        get: collapsed,
        set: update,
      }) as CollapsiblePanelApi,
    );

  return (
    <div
      ref={ref as any}
      class={['collapsed-panel', thisProps.collapsed && COLLAPSED_CLASS, thisProps.class]
        .filter((item) => item)
        .join(' ')}
      {...restProps}
    ></div>
  );
};
