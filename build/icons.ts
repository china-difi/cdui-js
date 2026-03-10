import fs from 'fs';
import path from 'path';

/**
 * 从指定 svg 文件加载 symbol 内容
 *
 * @param svgFile 指定 svg 文件
 * @param removeColor 去色标记 fill: 去填充色  stroke：去描边色  both：都去
 */
export const loadIconFile = (svgFile: string, removeColor?: 'fill' | 'stroke' | 'both'): string => {
  let name = path.basename(svgFile).replace('.svg', '');
  let svg = fs.readFileSync(svgFile, 'utf8');
  let index = svg.indexOf('>', 0);
  let content = svg.slice(index + 1, svg.lastIndexOf('</svg>'));

  if (removeColor) {
    // 去填充色
    if (removeColor !== 'stroke') {
      content = content.replace(/ fill=\"[^"]+\"/g, '');
    }

    // 去描边色
    if (removeColor !== 'fill') {
      content = content.replace(/ stroke=\"[^"]+\"/g, '');
    }
  }

  let title = svg.slice(0, index);
  let viewBox = '';
  let fill = '';
  let stroke = '';

  if ((index = title.indexOf(' viewBox="')) > 0) {
    viewBox = title.slice(index, title.indexOf('"', index + 11) + 1);
  }

  if (removeColor !== 'both') {
    if (removeColor !== 'fill' && (index = title.indexOf(' fill="')) > 0) {
      fill = title.slice(index, title.indexOf('"', index + 8) + 1);
    }

    if (removeColor !== 'stroke' && (index = title.indexOf(' stroke="')) > 0) {
      stroke = title.slice(index, title.indexOf('"', index + 10) + 1);
    }
  }

  return `<symbol id="icon-${name}"${viewBox}${fill}${stroke}>${content}</symbol>`;
};

/**
 * 从指定图标目录读取 svg symbol 内容
 *
 * @param svgDirectory 指定 svg 目录
 * @param removeColor 去色标记 fill: 去填充色  stroke：去描边色  both：都去
 */
export const loadIconsDirectory = (svgDirectory: string, removeColor?: 'fill' | 'stroke' | 'both'): string => {
  const outputs = [];
  const files = fs.readdirSync(svgDirectory);

  for (let i = 0, l = files.length; i < l; i++) {
    let file = path.join(svgDirectory, files[i]);

    if (path.extname(file) === '.svg') {
      outputs.push(loadIconFile(file, removeColor));
    }
  }

  return outputs.join('\n');
};

/**
 * 把图标 symbol 内容保存到 html 文件中
 *
 * @param htmlFile html 文件路径
 * @param symbols 图标 symbol 集合
 */
export const saveIconsToHtml = (htmlFile: string, symbols: string) => {
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
 * 把 svg 图标保存到模块文件中
 *
 * @param moduleFile 模块文件名
 * @param symbols svg 图标内容
 */
export const saveIconsModule = (moduleFile: string, symbols: string) => {
  fs.writeFileSync(
    moduleFile,
    `import { loadSvgIcons } from 'cdui-js';

loadSvgIcons(\`${symbols}\`);
`,
    'utf8',
  );
};
