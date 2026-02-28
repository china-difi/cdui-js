/**
 * 替换模板字符串
 *
 * @param template 模板
 * @param args 参数集合
 *
 * @example
 * // 按索引替换
 * replaceTemplate('...${0} ${1}...', 1, 2);  // '...1 2...'
 * // 按名称替换
 * replaceTemplate('...${name} ${value}...', { name: 1, value: 2 });  // '...1 2...'
 */
export const replaceTemplate = (template: string, ...args: unknown[]) => {
  return template.replace(/\$\{([^}]+)\}/g, (_, token: string) => {
    token = token.trim();

    if (token[0] >= '0' && token[0] <= '9') {
      return args[token];
    }

    return args[0] && args[0][token];
  });
};
