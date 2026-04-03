import i18n from './languages/en.json';

/**
 * 年份面板
 */
export let YearWidget = i18n.YearWidget;

/**
 * 月份面板
 */
export let MonthWidget = i18n.MonthWidget;

/**
 * 日历
 */
export let Canlendar = i18n.Canlendar;

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
  YearWidget = i18n.YearWidget;
  MonthWidget = i18n.MonthWidget;
  Canlendar = i18n.Canlendar;
  Form = i18n.Form;
};
