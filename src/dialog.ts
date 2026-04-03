import { createRoot } from 'solid-js';

import { JSX } from './jsx';
import { hideMaskLayer, showMaskLayer } from './dom';

/**
 * 对话框
 */
export type Dialog = HTMLElement & {
  /**
   * 关闭对话框
   */
  close(destroy?: boolean): void;
};

/**
 * 显示对话框
 *
 * @param component 对话框组件
 * @returns 对话框对象
 */
export const showDialog = (component: () => JSX.Element): Dialog => {
  return createRoot((dispose) => {
    let body = document.body;
    let dialog = component() as Dialog;
    let style = dialog.style;

    style.position = 'fixed';
    style.zIndex = '9';

    showMaskLayer();

    body.appendChild(dialog);

    dialog.close = (destroy?: boolean) => {
      hideMaskLayer();
      body.removeChild(dialog);
      destroy !== false && dispose();
    };

    return dialog;
  });
};
