import fs from 'fs';

export interface Rule {
  match: string;
  build(outputs: string[], selector: string, value: string, before: string[]): void;
}

export const rules: Rule[] = [
  {
    match: '.margin',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { margin: ${value} }`);
      outputs.push(`${selector.replace('margin', 'margin-t')} { margin-top: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'margin-r')} { margin-right: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'margin-b')} { margin-bottom: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'margin-l')} { margin-left: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'margin-x')} { margin-left: ${value}; margin-right: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'margin-y')} { margin-top: ${value}; margin-bottom: ${value}; }\n`);

      outputs.push(`${selector.replace('margin', '-margin-t')} { margin-top: -${value}; }`);
      outputs.push(`${selector.replace('margin', '-margin-r')} { margin-right: -${value}; }`);
      outputs.push(`${selector.replace('margin', '-margin-b')} { margin-bottom: -${value}; }`);
      outputs.push(`${selector.replace('margin', '-margin-l')} { margin-left: -${value}; }`);

      outputs.push(`${selector.replace('margin', 'padding-m')} { padding: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'padding-m-t')} { padding-top: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'padding-m-r')} { padding-right: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'padding-m-b')} { padding-bottom: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'padding-m-l')} { padding-left: ${value}; }`);
      outputs.push(`${selector.replace('margin', 'padding-m-x')} { padding-left: ${value}; padding-right: ${value}; }`);
      outputs.push(
        `${selector.replace('margin', 'padding-m-y')} { padding-top: ${value}; padding-bottom: ${value}; }\n`,
      );
    },
  },
  {
    match: '.border-c',
    build: (outputs: string[], selector: string, value: string, before: string[]) => {
      if (selector === '.border-c') {
        before.push(`.border { border-color: ${value} }`);
        before.push(`.border-t { border-top-color: ${value} }`);
        before.push(`.border-r { border-right-color: ${value} }`);
        before.push(`.border-b { border-bottom-color: ${value} }`);
        before.push(`.border-l { border-left-color: ${value} }\n`);
      }

      outputs.push(`${selector} { border-color: ${value} }`);
      outputs.push(`${selector.replace('border-c', 'border-t-c')} { border-top-color: ${value}; }`);
      outputs.push(`${selector.replace('border-c', 'border-r-c')} { border-right-color: ${value}; }`);
      outputs.push(`${selector.replace('border-c', 'border-b-c')} { border-bottom-color: ${value}; }`);
      outputs.push(`${selector.replace('border-c', 'border-l-c')} { border-left-color: ${value}; }`);
      outputs.push(
        `${selector.replace('border-c', 'border-x-c')} { border-left-color: ${value}; border-right-color: ${value}; }`,
      );
      outputs.push(
        `${selector.replace('border-c', 'border-y-c')} { border-top-color: ${value}; border-bottom-color: ${value}; }`,
      );
    },
  },
  {
    match: '.border-s',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { border-style: ${value} }`);
      outputs.push(`${selector.replace('border-s', 'border-t-s')} { border-top-style: ${value}; }`);
      outputs.push(`${selector.replace('border-s', 'border-r-s')} { border-right-style: ${value}; }`);
      outputs.push(`${selector.replace('border-s', 'border-b-s')} { border-bottom-style: ${value}; }`);
      outputs.push(`${selector.replace('border-s', 'border-l-s')} { border-left-style: ${value}; }`);
      outputs.push(
        `${selector.replace('border-s', 'border-x-s')} { border-left-style: ${value}; border-right-style: ${value}; }`,
      );
      outputs.push(
        `${selector.replace('border-s', 'border-y-s')} { border-top-style: ${value}; border-bottom-style: ${value}; }`,
      );
    },
  },
  {
    match: '.border',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { border-width: ${value}; border-style: solid; }`);
      outputs.push(
        `${selector.replace('border', 'border-t')} { border-top-width: ${value}; border-top-style: solid; }`,
      );
      outputs.push(
        `${selector.replace('border', 'border-r')} { border-right-width: ${value}; border-right-style: solid; }`,
      );
      outputs.push(
        `${selector.replace('border', 'border-b')} { border-bottom-width: ${value}; border-bottom-style: solid; }`,
      );
      outputs.push(
        `${selector.replace('border', 'border-l')} { border-left-width: ${value}; border-left-style: solid; }`,
      );
      outputs.push(
        `${selector.replace('border', 'border-x')} { border-left-width: ${value}; border-right-width: ${value}; border-left-style: solid; border-right-style: solid; }`,
      );
      outputs.push(
        `${selector.replace('border', 'border-y')} { border-top-width: ${value}; border-bottom-width: ${value}; border-top-style: solid; border-bottom-style: solid; }`,
      );
    },
  },
  {
    match: '.round',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { border-radius: ${value} }`);
    },
  },
  {
    match: '.padding',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { padding: ${value} }`);
      outputs.push(`${selector.replace('padding', 'padding-t')} { padding-top: ${value}; }`);
      outputs.push(`${selector.replace('padding', 'padding-r')} { padding-right: ${value}; }`);
      outputs.push(`${selector.replace('padding', 'padding-b')} { padding-bottom: ${value}; }`);
      outputs.push(`${selector.replace('padding', 'padding-l')} { padding-left: ${value}; }`);
      outputs.push(`${selector.replace('padding', 'padding-x')} { padding-left: ${value}; padding-right: ${value}; }`);
      outputs.push(
        `${selector.replace('padding', 'padding-y')} { padding-top: ${value}; padding-bottom: ${value}; }\n`,
      );
    },
  },
  {
    match: '.bg-c',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { background-color: ${value} }`);
    },
  },
  {
    match: '.color',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { color: ${value} }`);
    },
  },
  {
    match: '.font-s',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { font-size: ${value} }`);
    },
  },
  {
    match: '.font',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { font-weight: ${value} }`);
    },
  },
  {
    match: '.icon-c',
    build: (outputs: string[], selector: string, value: string, before: string[]) => {
      if (selector === '.icon-c') {
        before.push(`body { stroke: ${value}; fill: ${value}; }\n.icon { stroke: inherit; fill: inherit; }`);
      }

      outputs.push(`${selector} { stroke: ${value}; fill: ${value}; }`);
    },
  },
  {
    match: '.icon-s',
    build: (outputs: string[], selector: string, value: string, before: string[]) => {
      if (selector === '.icon-s') {
        before.push(`.icon { width: ${value}; height: ${value}; }\n`);
      }

      outputs.push(`${selector} .icon { width: ${value}; height: ${value}; }`);
      outputs.push(`${selector}.icon { width: ${value}; height: ${value}; }`);
    },
  },
  {
    match: '.button',
    build: (outputs: string[], selector: string, value: string) => {
      outputs.push(`${selector} { ${value} }`);
    },
  },
  {
    match: '.link',
    build: (outputs: string[], selector: string, value: string) => {
      if (selector === '.link') {
        outputs.push(`a, .link { ${value} }`);
      } else {
        outputs.push(`${selector} { ${value} }`);
      }
    },
  },
];

const findRule = (name: string) => {
  for (let i = 0, l = rules.length; i < l; i++) {
    if (name.startsWith(rules[i].match)) {
      return rules[i];
    }
  }
};

const parse = (
  rule: Rule,
  outputs: string[],
  selectorPrefix: string,
  name: string,
  value: string,
  before: string[],
) => {
  if (name.endsWith('-hover')) {
    rule.build(outputs, selectorPrefix + name + ':hover', value, before);
    rule.build(outputs, selectorPrefix + '.hover:hover ' + name, value, before);
    return;
  }

  if (name.endsWith('-active')) {
    rule.build(outputs, selectorPrefix + name + ':active', value, before);
    rule.build(outputs, selectorPrefix + '.active:active ' + name, value, before);
    return;
  }

  if (name.endsWith('-focus')) {
    rule.build(outputs, selectorPrefix + name + ':focus', value, before);
    rule.build(outputs, selectorPrefix + '.focus:focus ' + name, value, before);
    return;
  }

  if (name.endsWith('-selected')) {
    rule.build(outputs, selectorPrefix + name + '.selected', value, before);
    rule.build(outputs, selectorPrefix + '.selected ' + name, value, before);
    return;
  }

  rule.build(outputs, selectorPrefix + name, value, before);
};

/**
 * 解析 CSS 规范生成原子样式
 *
 * @param cssRuleFile CSS 规范文件路径（markdown规范文档）
 * @param cssFile 写 css 文件路径
 */
export const buildCSS = (cssRuleFile: string, cssFile?: string) => {
  let css = fs.readFileSync(cssRuleFile, 'utf8');
  let lines = css.split(/\r?\n\s*/);
  let selectorPrefix = '';
  let outputs = [];
  let before = [];

  for (let i = 0, l = lines.length; i < l; i++) {
    let line = lines[i].trim();

    switch (line[0] || '') {
      case '.':
        let index = line.indexOf('{');
        let name, value, rule: Rule;

        // 样式组
        if (index > 0 && (name = line.slice(0, index).trim()) && (rule = findRule(name))) {
          value = line.slice(index + 1);

          if ((value = value.replace(/}\s*\;*\s*/, '').trim())) {
            rule.build(outputs, selectorPrefix + name, value, before);
          }

          continue;
        }

        // 单样式值
        if ((index = line.indexOf(':')) > 0 && (name = line.slice(0, index).trim()) && (rule = findRule(name))) {
          value = line
            .slice(index + 1)
            .replace(/;\s*/g, '')
            .trim();

          if (value && value !== '#') {
            parse(rule, outputs, selectorPrefix, name, value, before);
          }

          continue;
        }

        console.error('不合法的格式：' + lines[i]);
        break;

      case '+': // 上级选择器
        selectorPrefix = line.slice(1).trim() + ' ';
        outputs.push('\n');
        break;

      case '#': // 新的分组
        selectorPrefix = '';
        outputs.push('\n');
        break;

      case '>':
      case '':
        break;

      default:
        console.error('不合法的格式：' + lines[i]);
    }
  }

  outputs.unshift(...before);
  css = outputs.join('\n');

  if (cssFile) {
    fs.writeFileSync(cssFile, css, 'utf8');
  }

  return css;
};
