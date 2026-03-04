import { createRoot } from 'solid-js';

import { JSX } from '../jsx';

/**
 * 对话框
 */
export type Dialog = HTMLElement & {
  /**
   * 关闭对话框方法
   */
  close(): void;
};

/**
 * 显示对话框
 *
 * @param component 对话框组件
 * @returns 关闭对话框方法
 */
export const showDialog = (component: () => JSX.Element): Dialog => {
  return createRoot((dispose) => {
    let body = document.body;
    let dialog = component() as Dialog;

    dialog.style.cssText = 'position:fixed;z-index:9';
    body.appendChild(dialog);

    dialog.close = () => {
      body.removeChild(dialog);
      dispose();
    };

    return dialog;
  });
};
