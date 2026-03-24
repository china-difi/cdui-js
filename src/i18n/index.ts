import i18n from './languages/en.json';

/**
 * 日历
 */
export let Canleandar = i18n.Canlendar;

/**
 * 表单
 */
export let Form = i18n.Form;

/**
 * 切换语言
 *
 * @param data 当前语言数据
 */
export const switchLanguage = (data: typeof i18n) => {
  Canleandar = i18n.Canlendar;
  Form = i18n.Form;
};
