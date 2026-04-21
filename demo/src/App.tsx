import { onMount, reactive } from '../../src/reactive';
import { For } from '../../src/components/For';
import { showPopup } from '../../src/popup';
import { CanlendarPage } from './pages/Canlendar';
import { CarouselPage } from './pages/Carousel';
import { ComboBoxPage } from './pages/ComboBox';
import { DatePickerPage } from './pages/DatePicker';
import { FormPage } from './pages/Form';

// 方法1: SolidJS 的直接引用
const getSolidStyle = (root) => {
  const a = root.firstChild.firstChild.nextSibling.nextSibling;
  const b = a.nextSibling.nextSibling.nextSibling;
  return [a, b];
};

const enter = (node, count) => {
  let child = node.firstChild;

  while (--count) {
    child = child.firstChild;
  }

  return child;
};

const next = (node, count) => {
  node = node.nextSibling;

  while (--count) {
    node = node.nextSibling;
  }

  return node;
};

(Node.prototype as any).ENTER = function (count) {
  let child = this.firstChild;

  while (--count) {
    child = child.firstChild;
  }

  return child;
};

const getChildren = (root) => {
  const a = next(enter(root, 2), 2);
  const b = next(a, 3);

  return [a, b];
};

// 方法2: querySelectorAll
const getQueryStyle = (root) => {
  return root.querySelectorAll('[dynamic]');
};

// 方法3: TreeWalker
const getWalkerStyle = (root) => {
  const walker = document.createNodeIterator(root, NodeFilter.SHOW_COMMENT);
  let node;

  while ((node = walker.nextNode())) {
    if (node.nodeType === 'dd') {
    }
  }
};

// 测试代码
const template = document.createElement('div');
template.innerHTML = `<div><span>Static</span><!><!-- dynamic1 --><span>Middle</span><!><!-- dynamic2 --></div>`;

console.log(template);
const printTime = (name: string, fn: Function) => {
  let now = performance.now();

  for (let i = 0; i < 1000000; i++) {
    fn();
  }

  console.log(name, performance.now() - now);
};

printTime('solid', () => getSolidStyle(template));
printTime('children', () => getChildren(template));
printTime('querySelectorAll', () => getQueryStyle(template));
printTime('TreeWalker', () => getWalkerStyle(template));

const openPopup = (align: HTMLElement) => {
  const popup = showPopup(<div style={{ padding: '100px 0', background: 'silver' }}>11111111111111111111</div>, {
    align,
    transition: true,
  });
};

export const App = () => {
  let refButton: HTMLElement;
  let ref;

  let state = reactive([]);

  onMount(() => {
    let now = performance.now();
    for (let i = 0; i < 10000; i++) {
      let child = ref;

      while ((child = child.nextSibling)) {}
    }
    console.log(performance.now() - now);
  });

  return (
    <div style={{ 'min-height': '100%' }}>
      <For each={state.value}>{(item) => <div>{item}</div>}</For>
      <button ref={refButton as any} onclick={() => state.value.push(Math.random())}>
        dropdown
      </button>
      <For each={state.value}>{(item) => <div>{item}</div>}</For>
      <button onclick={() => state.value.push(Math.random())}>dropdown</button>

      {/* <CarouselPage></CarouselPage> */}
      {/* <CanlendarPage></CanlendarPage>
      <DatePickerPage></DatePickerPage>
      <ComboBoxPage></ComboBoxPage>
      <FormPage></FormPage> */}
    </div>
  );
};
