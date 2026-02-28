// import { onCleanup, onMount, splitProps } from 'solid-js';

// import { JSX } from '../jsx';
// import { addEventListener, removeEventListener } from '../dom';

// /**
//  * 下拉状态
//  */
// const state = {
//   /**
//    * 订阅数量
//    */
//   count: 0,
//   /**
//    * 按下时位置
//    */
//   y: 0,

//   /**
//    * 按下时的时间
//    */
//   time: 0,

//   /**
//    * 下拉组件节点
//    */
//   pulldown: null as HTMLElement,
//   drag: null as HTMLElement,
//   ready: null as HTMLElement,
// };

// const ontouchstart = (event: TouchEvent) => {
//   let pulldown = (state.pulldown = document.querySelector('.pulldown'));

//   state.y = (event.changedTouches[0] || event.touches[0]).screenY;

//   if (pulldown) {
//     let drag = (state.drag = pulldown.querySelector('.pulldown-drag'));
//     let ready = (state.ready = pulldown.querySelector('.pulldown-ready'));

//     if (drag || ready) {
//       state.time = Date.now();

//       // 有滚动则停止下拉
//       addEventListener('scroll', removeListener, true);

//       addEventListener('touchmove', ontouchmove, true);
//       addEventListener('touchend', ontouchend, true);
//     } else {
//       console.error('Pulldown no pulldown-drag and pulldown-ready class child node');
//     }
//   }
// };

// const ontouchmove = (event: TouchEvent) => {
//   let screenY = (event.changedTouches[0] || event.touches[0]).screenY;
//   let distance = screenY - state.y;
//   let pulldown = state.pulldown;
//   let style = pulldown.style;

//   if (distance <= 40 || Date.now() - state.time < 200) {
//     style.display = 'none';
//     return;
//   }

//   // 已经开始下拉
//   if (style.display !== 'none') {
//   } else {
//     // 最小移动 20 像素的距离才显示
//     style.display = 'flex';
//     style.justifyContent = style.alignItems = 'center';
//   }

//   state.drag.style.display = distance <= 60 ? '' : 'none';
//   state.ready.style.display = distance > 60 ? '' : 'none';

//   style.height = distance + 'px';
// };

// const removeListener = () => {
//   let pulldown = state.pulldown;
//   let ready = state.ready;

//   removeEventListener('scroll', removeListener, true);

//   removeEventListener('touchmove', ontouchmove, true);
//   removeEventListener('touchend', ontouchend, true);

//   state.pulldown = state.drag = state.ready = null;

//   if (pulldown && pulldown.style.display !== 'none') {
//     pulldown.style.display = 'none';

//     if (ready && ready.style.display !== 'none') {
//       return pulldown;
//     }
//   }
// };

// const ontouchend = (event: TouchEvent) => {
//   let pulldown = removeListener();

//   if (pulldown) {
//     pulldown.dispatchEvent(new Event('refresh'));
//   }
// };

// /**
//  * 默认子控件
//  */
// let pulldownChildren;

// /**
//  * 设置下拉刷新默认子组件
//  *
//  * @param children 子组件集合（需包含 class 分别为 pulldown-drag 及 pulldown-ready 的两个元素）
//  */
// export const setPulldownChildren = (children: JSX.Element | JSX.Element[]) => {
//   pulldownChildren = children;
// };

// /**
//  * 下拉刷新
//  *
//  * @param props 属性集
//  */
// export const Pulldown = (props: JSX.HTMLAttributes<never> & { onrefresh: Function }) => {
//   const [thisProps, restProps] = splitProps(props, ['class', 'onrefresh', 'children']);
//   let ref;

//   onMount(() => {
//     if (state.count++) {
//     } else {
//       addEventListener('touchstart', ontouchstart);
//     }
//   });

//   onCleanup(() => {
//     if (--state.count) {
//     } else {
//       removeEventListener('touchstart', ontouchstart);
//     }
//   });

//   return (
//     <div ref={ref} class={'pulldown' + (thisProps.class ? ' ' + thisProps.class : '')} {...restProps}>
//       {props.children ||
//         pulldownChildren ||
//         (pulldownChildren = (
//           <>
//             <div class="pulldown-drag">下拉刷新</div>
//             <div class="pulldown-ready">释放立即刷新</div>
//           </>
//         ))}
//     </div>
//   );
// };
