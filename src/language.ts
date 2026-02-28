/**
 * 修复语言大小写问题（有些浏览器会把 zh-CN 写成 zh-cn）
 *
 * @param name 语言名称
 */
const fixLanguageName = (name: string) => {
  let index = name.indexOf('-');

  if (index < 0) {
    index = name.indexOf('_');
  }

  if (index > 0) {
    return name.slice(0, index) + '-' + name.slice(index + 1).toUpperCase();
  }

  return name;
};

/**
 * 获取当前语言名称
 */
export const getLanguage = (): string => {
  return localStorage.getItem('LANGUAGE') || fixLanguageName(navigator.language) || 'en';
};

/**
 * 保存当前语言名称
 *
 * @param name 语言名
 */
export const saveLanguage = (name: string) => {
  localStorage.setItem('LANGUAGE', name ? fixLanguageName(name) : 'en');
};
