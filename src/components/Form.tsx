import { Form as i18n } from '../i18n';

import { createContext, useContext, onMount, combineClass, omitProps } from '../reactive';
import { JSX } from '../jsx';
import { replaceTemplate } from '../template';
import { FormItemContext } from './provider';

/**
 * 表单属性集
 */
export interface FormItemProps {
  /**
   * 关联的字段名（可使用 "." 表示嵌套字段，如："a.b.c"）
   */
  field: string;
  /**
   * 标签
   */
  label: string | JSX.Element;
  /**
   * 标签宽度（未设置则继承所属表单的标签宽度）
   */
  labelWidth?: string;
  /**
   * 标签对齐方式（未设置则继承所属表单的对齐方式）
   */
  align?: '' | 'left' | 'top' | 'right';
  /**
   * 是否必填
   */
  required?: boolean;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
  /**
   * 错误信息
   */
  error?: string;
  /**
   * 必填校验信息
   */
  requiredError?: string;
}

/**
 * 表单外部调用接口
 */
export interface FormApi {
  /**
   * 校验表单
   *
   * @param filter 过滤器（校验部分字段）
   */
  validate(filter?: (target: ValidateTarget) => void | boolean): Promise<boolean>;

  /**
   * 滚动到第一个错误位置
   */
  scrollToError(): void;

  /**
   * 清除所有错误信息
   */
  clearErrors(): void;
}

export interface FormProps {
  /**
   * 表单数据
   */
  data: object;

  /**
   * 表单校验规则
   */
  rules: ValidateRules;

  /**
   * label 对齐方式
   */
  align?: 'left' | 'top' | 'right';

  /**
   * 标签宽度
   */
  labelWidth?: string;

  /**
   * 外部调用接口
   */
  api?: (api: FormApi) => void;
}

/**
 * 校验目标
 */
export interface ValidateTarget {
  /**
   * 表单数据
   */
  data: object;

  /**
   * 字段名
   */
  field: string;

  /**
   * 字段值
   */
  value: unknown;

  /**
   * 标签
   */
  label: string;

  /**
   * 表单项
   */
  item: FormItemProps;
}

/**
 * 校验规则接口
 */
export interface BaseValidateRule {
  /**
   * 数据类型
   */
  type: 'boolean' | 'number' | 'string' | 'date' | 'object' | 'array';

  /**
   * 自定义校验规则
   *
   * @param target 校验目标
   */
  onvalidate?(target: ValidateTarget, form: HTMLFormElement): string | Promise<string>;
}

export interface BooleanValidateRule extends BaseValidateRule {
  /**
   * 布尔值校验规则
   */
  type: 'boolean';
}

export interface NumberValidateRule extends BaseValidateRule {
  /**
   * 数字校验规则
   */
  type: 'number';

  /**
   * 最小值
   */
  min?: number;

  /**
   * 最大值
   */
  max?: number;
}

export interface ValidateRuleMatch {
  /**
   * 正则表达式
   */
  rule: RegExp;

  /**
   * 不匹配时的错误信息
   */
  error: string;
}

export interface StringValidateRule extends BaseValidateRule {
  /**
   * 字符串校验规则
   */
  type: 'string';

  /**
   * 最小值
   */
  min?: string;

  /**
   * 最大值
   */
  max?: string;

  /**
   * 正则表达式匹配
   */
  match?: ValidateRuleMatch | ValidateRuleMatch[];
}

export interface DateValidateRule extends BaseValidateRule {
  /**
   * 日期校验规则
   */
  type: 'date';

  /**
   * 最小值
   */
  min?: Date;

  /**
   * 最大值
   */
  max?: Date;
}

export interface ObjectValidateRule extends BaseValidateRule {
  /**
   * 对像值校验规则
   */
  type: 'object';

  /**
   * 子校验规则集合
   */
  subRules?: ValidateRules;
}

/**
 * 校验规则
 */
export type ValidateRule =
  | BooleanValidateRule
  | NumberValidateRule
  | StringValidateRule
  | DateValidateRule
  | ObjectValidateRule;

/**
 * 校验规则集合
 */
export interface ValidateRules {
  [key: string]: ValidateRule;
}

const replaceError = (item: FormItemProps, error: string, value?: unknown) => {
  let label = item.label;

  error = error
    .replace(/\$\{label\}/g, typeof label !== 'string' ? (label as HTMLElement).textContent : label)
    .replace(/\$\{field\}/g, item.field);

  if (value !== void 0) {
    error = error.replace(/\$\{value\}/g, value as string);
  }

  return error;
};

const validateRange = (item: FormItemProps, rule: { min?: unknown; max?: unknown }, value: unknown) => {
  let min = rule.min;
  let max = rule.max;

  if (min != null) {
    if (max != null) {
      if (value < min || value > max) {
        return replaceError(item, replaceTemplate(i18n.Between, { min, max }));
      }
    } else if (value < min) {
      return replaceError(item, i18n.NotLessThan, min);
    }
  } else if (max != null && value > max) {
    return replaceError(item, i18n.NotGreaterThan, max);
  }
};

/**
 * 校验规则集合
 */
export const validateRules = {
  number: (item: FormItemProps, rule: NumberValidateRule, value: unknown) => {
    if (value || (value = +value) === 0) {
      // 范围校验
      return validateRange(item, rule, value);
    }
  },

  string: (item: FormItemProps, rule: StringValidateRule, value: unknown) => {
    if (value) {
      let match, error;

      // 范围校验
      if ((error = validateRange(item, rule, (value = '' + value)))) {
        return error;
      }

      // 正则校验
      if ((match = rule.match)) {
        if (match instanceof Array) {
          for (let i = 0, l = match.length; i < l; i++) {
            if (!match[i].rule.test(value as string)) {
              if ((error = replaceError(item, match[i].error, value))) {
                return error;
              }
            }
          }
        } else if (!match.rule.test(value as string)) {
          if ((error = replaceError(item, match.error, value))) {
            return error;
          }
        }
      }
    }
  },

  date: (item: FormItemProps, rule: DateValidateRule, value: unknown) => {
    if (value) {
      // 不是一个日期
      if (!(value instanceof Date)) {
        switch (typeof value) {
          case 'number':
            value = new Date(value);
            break;

          case 'string':
            value = new Date(value.replace(/-/g, '/'));
            break;

          default:
            return replaceError(item, i18n.NotDate, value);
        }
      }

      return validateRange(item, rule, value);
    }
  },
};

/**
 * 查找指定字段的规则
 *
 * @param rules 规则集合
 * @param field 字段名
 */
const findRule = (rules: ValidateRules, fields: string[]) => {
  let rule = rules as any;

  for (let i = 0, l = fields.length; i < l; i++) {
    if ((rule = rule[fields[i]])) {
    } else {
      return;
    }
  }

  return rule;
};

const findValue = (data: any, fields: string[]) => {
  for (let i = 0, l = fields.length; i < l; i++) {
    if ((data = data[fields[i]])) {
    } else if (i + 1 === l) {
      return data;
    } else {
      return;
    }
  }

  return data;
};

const showError = (formItem: HTMLElement, error: string) => {
  let dom = formItem.querySelector('.form-error');

  if (dom) {
    dom.textContent = error;
  } else {
    dom = document.createElement('div');
    dom.className = 'form-error';
    dom.textContent = error;

    formItem.querySelector('.form-body').appendChild(dom);
  }
};

const removeError = (formItem: HTMLElement) => {
  let dom = formItem.querySelector('.form-error');

  if (dom) {
    dom.parentNode.removeChild(dom);
  }
};

/**
 * 校验规则
 *
 * @param rule 校验规则
 * @param target 校验目标
 * @param form 所属表单
 */
export const validateRule = async (rule: ValidateRule, target: ValidateTarget, form: HTMLFormElement) => {
  let type = rule && rule.type;
  let item = target.item;
  let value = target.value;
  let error;

  if (rule) {
    if (validateRules[type] && (error = validateRules[type](item, rule, value))) {
      return error;
    }

    if (rule.onvalidate && (error = await rule.onvalidate(target, form))) {
      return error;
    }
  }
};

/**
 * 校验
 */
const validate = async (
  form: HTMLFormElement,
  rules: ValidateRules,
  data: object,
  filter?: (target: ValidateTarget) => void | boolean,
) => {
  let result = true;
  let child = form.firstElementChild as any;
  let field, rule: ValidateRule, item: FormItemProps;

  while (child) {
    // 表单项
    if ((item = child.FORM_ITEM)) {
      let error;

      // 有设置了字段且未隐藏
      if (!item.hidden && (field = item.field)) {
        let fields = field.split('.');

        // 必填
        if (item.required) {
          // 当前值
          let value = findValue(data, fields);

          if (value == null || value === '') {
            error = replaceError(item, item.requiredError || i18n.Required, value);
          }
        } else if ((rule = findRule(rules, fields))) {
          // 当前值
          let value = findValue(data, fields);
          // 校验目标
          let target = {
            data,
            field,
            value,
            label: child.label,
            item: child,
            parent,
          } as ValidateTarget;

          // 没有过滤或符合过滤条件才校验
          if (!filter || filter(target)) {
            error = await validateRule(rule, target, form);
          }
        }
      }

      if (error) {
        showError(child, error);
      } else {
        removeError(child);
      }
    } else if (child instanceof HTMLFormElement) {
      // 子表单级联校验
      child.api.validate(filter);
    } else {
      // 不是表单则递归
      if (!(await validate(child, rules, data, filter))) {
        result = false;
      }
    }

    child = child.nextElementSibling;
  }

  return result;
};

function scrollToError(this: HTMLFormElement) {
  let error = this.querySelector('.form-error') as HTMLElement;

  if (error) {
    (error.parentNode as HTMLElement).scrollIntoView();
  }
}

function clearErrors(this: HTMLFormElement) {
  let errors = this.querySelectorAll('.form-error');

  for (let i = errors.length; i--; ) {
    errors[i].parentNode.removeChild(errors[i]);
  }
}

const setValue = (data: object, field: string, value: any) => {
  let fields = field.split('.');
  let last = fields.length - 1;

  for (let i = 0; i < last; i++) {
    if ((data = data[fields[i]])) {
    } else {
      return;
    }
  }

  data[fields[last]] = value;
};

/**
 * 表单上下文
 */
const FormContext = createContext<FormProps>();

const OMIT_ITEM_PROPS = [
  'class',
  'field',
  'label',
  'labelWidth',
  'align',
  'required',
  'hidden',
  'error',
  'requiredError',
  'children',
] as const;

/**
 * 表单项
 */
export const FormItem = (props?: JSX.HTMLAttributes<never> & FormItemProps) => {
  let domItem: HTMLElement;
  let domInput: HTMLElement;

  const form = useContext(FormContext);
  const provider = {
    getValue: () => findValue(form.data, props.field.split('.')),
    setValue: (value: any) => setValue(form.data, props.field, value),
    init: (input: HTMLElement) => {
      if (!domInput) {
        domInput = input;
        return true;
      }
    },
  };

  return (
    <div
      ref={(dom) => {
        domItem = dom;
        (domItem as any).FORM_ITEM = props;
      }}
      class={combineClass(
        'form-item',
        'form-align-' + (props.align || form.align || 'left'),
        props.required && 'required',
        props.hidden && 'hidden',
        props.class,
      )}
      {...omitProps(props, OMIT_ITEM_PROPS)}
    >
      <label style={{ width: props.labelWidth || form.labelWidth }} onclick={() => domInput && domInput.focus()}>
        {props.label}
      </label>
      <div class="form-body">
        <FormItemContext.Provider value={provider}>{props.children}</FormItemContext.Provider>
      </div>
    </div>
  );
};

const OMIT_FORM_PROPS = ['data', 'rules', 'align', 'labelWidth', 'api', 'children'] as const;

/**
 * 表单组件
 */
export const Form = (props?: JSX.HTMLAttributes<never> & FormProps) => {
  return (
    <form
      ref={(dom) => {
        // 初始化外部调用接口
        props.api &&
          props.api(
            (dom.api = {
              validate: (filter?: (target: ValidateTarget) => void | boolean) =>
                validate(dom, props.rules, props.data, filter),
              scrollToError: scrollToError.bind(dom),
              clearErrors: clearErrors.bind(dom),
            }),
          );
      }}
      {...omitProps(props, OMIT_FORM_PROPS)}
    >
      <FormContext.Provider value={props}>{props.children}</FormContext.Provider>
    </form>
  );
};
