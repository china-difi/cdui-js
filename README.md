



# MVVM响应式编程

响应式`（Reactivity）`增强了应用程序的交互性。这种编程范式是指系统自动响应数据或状态变化的能力，确保用户界面 (UI) 和状态保持同步，从而减少手动更新的需要。


## 响应式原理

### 响应式数据

响应式对象是响应式体系的核心元素，在数据管理和系统响应中发挥着重要作用。其负责存储和管理数据，以及触发整个系统的更新。响应式对象的每-个属性都绑定了`getter`和`setter`方法。

读取响应式对象的属性时，会自动调用其相应的`getter`方法，此时系统会自动收集依赖并返回其存储的值。
修改响应式对象的属性时，会自动调用其相应的`setter`方法，会修改其存储的值且自动更新相应依赖。

```tsx
import { reactive } from 'cdui-js';

// 创建响应式数据
const state = reactive({ count: 0 });

// 读取响应式属性值
let count = state.count;

// 修改响应式属性值
state.count++;
```

### 订阅者

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

可以使用`as const`断言同时观测多个响应式数据。

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

`watch`方法只有在依赖发生变化时才执行相关依赖，而`createEffect`创建时立即执行追踪函数并自动收集相应的依赖。

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

`createMemo`用于缓存响应式计算结果，只有当依赖的响应式数据发生变化时才会重新计算，注意，`createMemo`同样存在短路的问题。

```tsx
import { reactive, createMemo } from 'cdui-js';

const state = reactive({ value: 0 });

// 创建响应式缓存表示式（注意返回值是一个 function，只有 state.value 发生变化时才会重新计算）
const getValue = createMemo(() => state.value + 100);
```

## `TSX`组件

本项目使用`tsx`作为模板，但是没有虚拟`DOM`，也更轻量高效。

```tsx
import { reactive } from 'cdui-js';

function Counter() {
  // 创建响应式状态
  const state = reactive({ count: 0 });

  return (
    <div>
      <span>Count: {state.count}</span>{" "}
      {/* 当按钮点击的时候，会自动更新相关绑定 */}
      <button type="button" onClick={() => state.count++}>
        Increment
      </button>
    </div>
  );
}
```

在这段代码中，当点击`Counter`组件内的按钮时，响应式数据`state.count`自增`1`，绑定了响应式属性`state.count`的部分会自动更新，但不会重新渲染整个组件。也就是说，在`return`语句之前的代码，只在函数调用时执行一次。

### ref



### 组件生命周期

1. onMount

`onMount`在组件挂载后运行，只会执行一次，且在服务端渲染时不会执行，也不跟踪任何依赖项，此时可以访问相应的`DOM`对象。

```tsx
import { onMount } from 'cdui-js';

function Component() {
  onMount(async () => {
    
  });

  return <div>...</div>;
}
```

2. onCleanup

`onCleanup`用于在组件卸载时执行一些清理任务，以避免避免内存泄漏及一些不必要的操作。

```tsx
import { onCleanup } from 'cdui-js';

function Component() {
  const [count, setCount] = createSignal(0);

  const timer = setInterval(() => {
    setCount((prev) => prev + 1);
  }, 1000);

  // 组件卸载时清理定时器
  onCleanup(() => {
    clearInterval(timer);
  });

  return <div>Count: {count()}</div>;
}
```

### class


### style


### 事件



# `TSX`模板


# 路由


# 服务端渲染
