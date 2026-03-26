// export interface

import { createContext } from '../reactive';

/**
 * 表单项提供者值类型
 */
export interface FormItemProviderValue {
  /**
   * 获取绑定值
   */
  getValue(): any;

  /**
   * 设置绑定值
   * 
   * @param value 绑定值
   */
  setValue(value: any): void;

  /**
   * 初始化表单输入组件
   *
   * @param input 表单输入组件
   */
  init(input: HTMLElement): boolean;
}

/**
 * 表单项上下文
 */
export const FormItemContext = createContext<FormItemProviderValue>();
