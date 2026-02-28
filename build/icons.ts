import fs from 'fs';
import path from 'path';

/**
 * 从指定 svg 文件读取 symbol 内容
 *
 * @param svgFile 指定 svg 文件
 * @param removeColor 去色标记 fill: 去填充色  stroke：去描边色  both：都去
 */
export const readIconFile = (svgFile: string, removeColor?: 'fill' | 'stroke' | 'both'): string => {
  let name = path.basename(svgFile).replace('.svg', '');
  let svg = fs.readFileSync(svgFile, 'utf8');
  let index = svg.indexOf(' viewBox="');
  let viewBox = svg.slice(index, (index = svg.indexOf('"', index + 12) + 1));
  let content = svg.slice(svg.indexOf('>', index) + 1, svg.lastIndexOf('</svg>'));
  let hasStroke = content.indexOf(' stroke="') > 0;
  let hasFill = content.indexOf(' fill="') > 0;

  // 没有描边
  if (!hasStroke) {
    // 强制禁止外部修改描边
    viewBox += ' stroke="none"';
  } else if (!hasFill) {
    // 没有填充则强制禁止外部修改填充
    viewBox += ' fill="none"';
  }

  if (removeColor) {
    // 去填充色
    if (hasFill && removeColor !== 'stroke') {
      content = content.replace(/ fill=\"[^"]+\"/g, '');
    }

    // 去描边色
    if (hasStroke && removeColor !== 'fill') {
      content = content.replace(/ stroke=\"[^"]+\"/g, '');
    }
  }

  return `<symbol id="icon-${name}"${viewBox}>${content}</symbol>`;
};

/**
 * 从指定图标目录读取 svg symbol 内容
 *
 * @param svgDirectory 指定 svg 目录
 * @param removeColor 去色标记 fill: 去填充色  stroke：去描边色  both：都去
 */
export const readIconsDirectory = (svgDirectory: string, removeColor?: 'fill' | 'stroke' | 'both'): string => {
  const outputs = [];
  const files = fs.readdirSync(svgDirectory);

  for (let i = 0, l = files.length; i < l; i++) {
    let file = path.join(svgDirectory, files[i]);

    if (path.extname(file) === '.svg') {
      outputs.push(readIconFile(file, removeColor));
    }
  }

  return outputs.join('\n');
};

/**
 * 把图标 symbol 内容写入 html 文件
 *
 * @param htmlFile html 文件路径
 * @param symbols 图标 symbol 集合
 */
export const writeIconsToHtml = (htmlFile: string, symbols: string) => {
  let html = fs.readFileSync(htmlFile, 'utf8');
  let index = html.indexOf('<svg id="ICONS" ');

  if (index > 0) {
    let start = html.indexOf('>', index) + 1;
    let end = html.indexOf('</svg>', start);

    html = html.slice(0, start) + '\n' + symbols + '\n' + html.slice(end);
  } else {
    let start = html.indexOf('>', html.indexOf('<body')) + 1;

    html =
      html.slice(0, start) +
      '\n<svg id="ICONS" aria-hidden="true" style="position: absolute; width: 0px; height: 0px; overflow: hidden;" xmlns="http://www.w3.org/2000/svg">' +
      symbols +
      '\n</svg>' +
      html.slice(start);
  }

  fs.writeFileSync(htmlFile, html, 'utf8');
};

/**
 * 写 svg 图标到模块文件
 *
 * @param moduleFile 模块文件名
 * @param symbols svg 图标内容
 */
export const writeIconsModule = (moduleFile: string, symbols: string) => {
  fs.writeFileSync(
    moduleFile,
    `import { loadSvgIcons } from 'cdui-js';

loadSvgIcons(\`${symbols}\`);
`,
    'utf8',
  );
};
