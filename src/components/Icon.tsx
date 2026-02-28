import { splitProps } from 'solid-js';

import { JSX } from '../jsx';

/**
 * 图标组件
 */
export const Icon = (props?: JSX.SvgSVGAttributes<never> & { name: string }) => {
  let [thisProps, restProps] = splitProps(props, ['class', 'name']);

  return (
    <svg class={'icon' + (thisProps.class ? ' ' + thisProps.class : '')} aria-hidden={true} {...restProps}>
      <use href={'#icon-' + thisProps.name}></use>
    </svg>
  );
};

/**
 * 加载 svg 图标集
 *
 * @param svgSymbols svg symbol 内容（由 icons 构建工具生成）
 */
export const loadSvgIcons = (svgSymbols: string) => {
  let body = document.body;
  let svg = document.getElementById('ICONS');

  if (svg) {
    svg.insertAdjacentHTML('beforeend', svgSymbols);
  } else {
    svg = document.createElement('svg');
    svg.id = 'ICONS';
    svg.ariaHidden = 'true';
    svg.style.cssText = 'position:absolute;width:0px;height:0px;overflow:hidden;';
    svg.innerHTML = svgSymbols;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    body.insertBefore(svg, body.firstChild);
  }
};
