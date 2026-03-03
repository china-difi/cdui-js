> 不建议直接使用此库，而是基于 [cdui-template](https://github.com/china-difi/cdui-template) 项目模板构建项目，更简单功能也更强大。


# 响应式原理

响应式`（Reactivity）`增强了应用程序的交互性。这种编程范式是指系统自动响应数据或状态变化的能力，确保用户界面 (UI) 和状态保持同步，从而减少手动更新的需要。

## 响应式对象

响应式对象是响应式体系的核心元素，在数据管理和系统响应中发挥着重要作用。其负责存储和管理数据，收集相关的依赖，以及在属性值发生变化时自动同步更新相应的依赖。响应式对象的每-个属性都绑定了`getter`和`setter`方法，响应式对象的每一个属性都是一个响应式数据。

读取响应式对象的属性时，会自动调用其相应的`getter`方法，此时系统会自动收集依赖并返回其存储的值。
修改响应式对象的属性时，会自动调用其相应的`setter`方法，此时系统会修改其存储的值且自动更新相应依赖。

```tsx
import { reactive } from 'cdui-js';

// 创建响应式数据
const state = reactive({
  count: 0,
  items: [] 
});

// 读取响应式属性值
console.log(state.count);

// 修改响应式属性值
state.count++;

// 数组也是响应式的，子项发生变化时也会自动同步相应的依赖
state.items.push({});
```

## 订阅者

订阅者负责追踪响应式数据的变化并在变化时自动执行相应函数，以保持系统与最新的数据变化同步。

有三种订阅变化并同步的方式:

1. watch

```tsx
import { reactive, watch } from 'cdui-js';

// 创建响应式数据
const state = reactive({ count: 0 });

// 观测响应式数据的变化，当观测的响应式数据发生变化时，会自动执行观测函数
watch(() => state.count, (count) => {
  console.log(count);
});
```

可以同时观测多个响应式数据，对于`typescript`，可以使用`as const`断言标观测到的数据类型。

```tsx
import { reactive, watch } from 'cdui-js';

const state1 = reactive({ value: 0 });
const state2 = reactive({ value: 1 });

// 注意，as const 把返回值类型标记为元组
watch(() => [state1.value, state2.value] as const, ([value1, value2]) => {
  console.log(value1, value1);
});
```

2. createEffect

`watch`方法只有在依赖发生变化时才执行相应函数，而`createEffect`创建时立即执行相应函数并自动收集相应的依赖。

```tsx
import { reactive, createEffect } from 'cdui-js';

const state1 = reactive({ value: 0 });
const state2 = reactive({ value: 1 });

createEffect(() => {
  console.log(state1.value);

  // 注意短路问题（state1.value 发生变化时并不会执行回调函数）
  console.log(state2.value || state1.value);
});
```

3. createMemo

`createMemo`用于缓存响应式计算结果，只有当依赖的响应式数据发生变化时才会重新计算，适用于依赖响应式数据的昂贵计算（简单计算性能返而更低），注意，`createMemo`同样存在短路的问题。

```tsx
import { reactive, createMemo } from 'cdui-js';

const state = reactive({ value: 0 });

// 创建响应式缓存表示式（注意返回值是一个 function，只有 state.value 发生变化时才会重新计算）
const getValue = createMemo(() => state.value + 100);

// 读取缓存的响应式结果
console.log(getValue());
```


# 响应式组件

任意一个函数，如果返回了`JSX.Element`，则这个函数就是一个响应式组件。建议使用`tsx`作为组件模板，本响应式框架没有虚拟`DOM`，也更轻量高效。

```tsx
import { reactive } from 'cdui-js';

function Counter() {
  // 创建响应式状态
  const state = reactive({ count: 0 });

  return (
    <div>
      <span>Count: {state.count}</span>{" "}
      {/* 当按钮点击的时候，会自动更新页面 */}
      <button type="button" onclick={() => state.count++}>
        Increment
      </button>
    </div>
  );
}
```

在这段代码中，当点击`Counter`组件内的按钮时，响应式数据`state.count`自增`1`，绑定了响应式数据`state.count`的部分会自动更新，但不会重新渲染整个组件。也就是说，在`return`语句之前的代码，只在函数调用时执行一次。


## 组件生命周期

1. onMount 与 ref

`onMount`在组件挂载后运行，只会执行一次，且在服务端渲染时不会执行，也不跟踪任何依赖项，`onMount`函数内可以访问相应的`DOM`对象。

```tsx
import { onMount } from 'cdui-js';

function Component() {
  onMount(async () => {
    // 此处可通过选择器获取相应的DOM对象
    let dom = document.getElementById('dom-id');
  });

  return <div id="dom-id">...</div>;
}
```

但是，不建议通过选择器获取`DOM`对象，因为选择器可能会冲突，最好声明一个变量并将其绑定到`ref`属性：

```tsx
import { onMount } from 'cdui-js';

function Component() {
  // 声明绑定到`ref`属性的变量
  let dom;

  onMount(async () => {
    // 此处即可访问声明的变量 dom 来操控 div 对象
  });

  // 通过 ref 属性绑定变量
  return <div ref={dom}>...</div>;
}
```

> 注意，必须在`onMount`内访问`ref`绑定的变量，此时才能保证声明的变量成功绑定到`ref`属性，同时，也不会影响服务端渲染，因为服务端渲染不会执行`onMount`函数。


1. onCleanup

`onCleanup`用于在组件卸载时执行一些清理任务，以避免内存泄漏及一些不必要的操作。

```tsx
import { reactive, onMount, onCleanup } from 'cdui-js';

function Component() {
  let dom;
  const state = reactive({ count: 1 });

  const timer = setInterval(() => {
    state.count += 1;
  }, 1000);

  onMount(() => {
    const onclick = () => console.log('clicked');

    dom.addEventListener('click', onclick);
    // 组件卸载时移除事件
    onCleanup(() => {
      dom.removeEventListener('click', onclick);
    });
  });

  // 组件卸载时清理定时器
  onCleanup(() => {
    clearInterval(timer);
  });

  return <div ref={dom}>Count: {state.count}</div>;
}
```

## class

可以通过`class`属性设置`DOM`元素的样式。

```tsx
// 值为字符串常
<div class="bg-c"></div>
// 值为表示式
<div class={window.innerWidth > 480 ? 'pc' : 'mobile'}></div>
```

当您想将多个类名应用于一个元素时，可以使用`classList`属性。可以传递一个对象，其中键代表类名，值代表布尔表达式。当值为`true`时，应用该类名；当值为`false`时，删除该类名。

```tsx
import { reactive } from 'cdui-js';

const state = reactive({ hidden: false });

<div>
  <span classList={{ hidden: state.hidden }}>classList</span>
  <button onclick={() => state.hidden = !state.hidden}>toggle</button>
</div>
```

> 注意不要混合使用 `class`和`classlist`，这可能会产生不可意料的结果


## style

`style`属性允许您设置单个元素的样式。可以值字符串的形式，也可以使用对象的形式，在`typescript`使用对象形式可以得到更好的提示。

```tsx
// 字符串值
<div style="color:red">Red</div>

// 对象值
<div style={{ color: 'red' }}>Red</div>
```

## 自定义属性（props）

`props`是一种将状态从父组件传递到子组件的方法。在子组件中可定义`props`对象参数：

```tsx
function ChildComponent(props: { name: string }) {
  return <div>Hello {props.name}</div>;
}
```

父组件可通过`JSX`属性传入：

```tsx
function ParentComponent() {
  return <MyComponent name="Your Name" />
}
```

有时候，需要把不同的属性值应用到不同的`DOM`节点，可以使用`splitProps`方法对`props`进行切分。切分后的任一部分都具有响应式特性。

```tsx
import { splitProps } from 'cdui-js';

function Component(props: { title: string, children: JSX.Element[] }) {
  // restProps 为拆分后剩余的部分
  const [titleProps, childrenProps, restProps] = splitProps(props, ['title'], ['children']);

  return (
    <div {...restProps}>
      <div>{titleProps.title}</div>
      <div>{childrenProps.children}</div>
    </div>
  );
}
```

> 注意，解构`props`对象会丧失响应性，除非你确定要这样，否则不要随意解构任意`props`或响应式对象。

```tsx
function Component(props: { name: string }) {
  let name = props.name;
  // 注意：name 不再具备响应式能力
  return <div>{name}</div>
}
```

## 事件

可以通过`onxxx`属性像`HTML`那样绑定事件：

```tsx
<div onclick={() => console.log('clicked')}>click</div>
```

事件处理方法与标准事件一致，可通过`event`参数获取事件信息或控制事件：

```tsx
<div onclick={event => event.stopPropagation()}>click</div>
```


# 条件渲染（If）

`If`组件可实现按需渲染。

```tsx
import { If } from 'cdui-js';

<If when={...}>when 值为真时才会显示这段文字</If>
```

可以指定`when`为假时显示其它组件。

```tsx
import { If } from 'cdui-js';

<If when={...} else={<span>when 值为假时显示这段文字</span>}>when 值为真时显示这段文字</If>
```


# 保活（KeepAlive）

`If`组件的条件发生变化时，原来的内容会被销毁，有时我们希望条件切换后不要销毁相应内容，而是缓存起来，再下次条件切换回来的时候直接复用缓存的内容，可以使用`KeepAlive`组件。

```tsx
import { KeepAlive } from 'cdui-js';

<KeepAlive show={...}>这一段内容在 show 属性为假时会缓存起来</KeepAlive>
```


# 循环渲染（For）

`For`组件可以根据数组内容循环渲染。

```tsx
import { For } from 'cdui-js';

<For each={[...]}>{
  (item, index) => <div>{`index: ${index()} item: ${item}`}</div>
}</For>
```


## 响应式布局（layout）

`layout`是一全局响应式数据对象，由 [cdui-template](https://github.com/china-difi/cdui-template) 模板项目的`index.html`中会自动设置此对象相应属性值，样式相关响应式布局规范可参考模板项目的`README.md`文档，此处不展开。

代码中可使用相应的布局临界值属性实现按需渲染，比如有一个移动端的页面和一个`PC`端的页面，在页面宽度小于等于`480`像素时渲染移动端页面，否则渲染`PC端页面`。

```tsx
import { KeepAlive, layout } from 'cdui-js';

<>
  <KeepAlive when={layout['le-480']}>
    <PC></PC>
  </KeepAlive>
  <KeepAlive when={layout['gt-480']}>
    <Mobile></Mobile>
  </KeepAlive>
</>
```


# 路由（Switch + location）

`Switch`组件可根据`case`条件动态渲染内容。

```tsx
import { Switch } from 'cdui-js';

const routes = [
  {
    id: 'component1',
    component: ...
  },
  {
    id: 'component2',
    component: ...
  }
];

<Switch case={xxx ? routes[0] : routes[1]}></Switch>
```

`case`对象的`id`属性控制缓存，不设置则不会缓存相应内容，设置后，如果存在相应`id`的缓存内容，则直接复用缓存伯内容。

配合全局响应式对象`location`，可根据当前页面灵活控制渲染内容。

```tsx
import { Switch } from 'cdui-js';

const routes = [
  {
    id: 'component1',
    path: 'p1',
    component: ...
  },
  {
    id: 'component2',
    path: 'p2',
    component: ...
  }
];

// 404
const NotFound = {
  id: '404',
  component: () => {
    return <div>Not Found</div>;
  }
};

<Switch case={routes.find(item => item.path === location.path) || NotFound}></Switch>
```

> 实际业务场景还可使用`location`的`paths、query、hash`属性值进行匹配


# 异步加载数据（createFetcher）

使用`createFetcher`方法可以创建一个异步数据加载器，返回的对象也是一个响应式对象。

```tsx
import { If, createFetcher } from 'cdui-js';

// 加载异步数据的方法
const loadAsyncData = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([...]), 1000);
  });
};

export const LoadAsyncDataComponent = () => {
  // 创建异步数据加载器
  const fetcher = createFetcher(loadAsyncData);

  return (
    <div>
      {/* 成功返回时渲染 */}
      <If when={fetcher.result}>
        <For each={fetcher.result}>
        </For>
      </If>
      {/* 加载时渲染 */}
      <If when={fetcher.status === 'loading'}>
        loading ...
      </If>
    </div>
  );
};
```

可以配合`watch`实现当依赖数据发生变化时自动加载数据并渲染。


```tsx
import { If, createFetcher, reactive } from 'cdui-js';

export const LoadAsyncDataComponent = () => {
  // 创建加载条件响应式数据
  const state = reactive({ filter: '' });
  // 创建异步数据加载器
  const fetcher = createFetcher(() => { // 此处根据 state.filter 返回不同的结果 });

  // 观测加载条件
  watch(() => state.fitler, filter => {
    // 此处根据 state.filter 重新加载数据
    let ... = ...;

    // 设置新数据到 fetcher，系统自动更新相应绑定
    fetcher.result = ...;
  }); 

  return (
    <div>
      {/* 成功返回时渲染 */}
      <If when={fetcher.result}>
        <For each={fetcher.result}>
        </For>
      </If>
      {/* 加载时渲染 */}
      <If when={fetcher.status === 'loading'}>
        loading ...
      </If>
    </div>
  );
};
```
