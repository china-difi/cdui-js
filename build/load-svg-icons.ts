/**
 * 加载 svg 图标集
 *
 * @param svgSymbols svg symbol 内容（由 icons 构建工具生成）
 */
export default function loadSvgIcons(svgSymbols) {
  var body = document.body;
  var svg = document.getElementById('ICONS');

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
}
