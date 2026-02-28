import { isBrowser } from './dom';
import { reactive } from './reactive';

/**
 * 当前布局
 */
// export const layout = reactive({
//   pc: true,
//   tablet: false,
//   mobile: false,
//   landscape: true,
//   'gt-1920': false,
//   'gt-1280': false,
//   'gt-1024': true,
//   'gt-800': true,
//   'gt-640': true,
//   'gt-480': true,

//   'ge-1920': false,
//   'ge-1280': true,
//   'ge-1024': true,
//   'ge-800': true,
//   'ge-640': true,
//   'ge-480': true,

//   'le-1920': true,
//   'le-1280': true,
//   'le-1024': false,
//   'le-800': false,
//   'le-640': false,
//   'le-480': false,

//   'lt-1920': true,
//   'lt-1280': false,
//   'lt-1024': false,
//   'lt-800': false,
//   'lt-640': false,
//   'lt-480': false,
// });
// 默认按手机端展示
export const layout = reactive({
  pc: true,
  tablet: false,
  mobile: false,
  landscape: true,
  'gt-1920': false,
  'gt-1280': false,
  'gt-1024': false,
  'gt-800': false,
  'gt-640': false,
  'gt-480': false,

  'ge-1920': false,
  'ge-1280': false,
  'ge-1024': false,
  'ge-800': false,
  'ge-640': false,
  'ge-480': true,

  'le-1920': true,
  'le-1280': true,
  'le-1024': true,
  'le-800': true,
  'le-640': true,
  'le-480': true,

  'lt-1920': true,
  'lt-1280': true,
  'lt-1024': true,
  'lt-800': true,
  'lt-640': true,
  'lt-480': false,
});

const update = () => {
  let classList = document.body.classList;
  let names = Object.getOwnPropertyNames(layout);

  for (let i = 0, l = names.length; i < l; i++) {
    layout[names[i]] = classList.contains(names[i]);
  }
};

if (isBrowser) {
  // 更新布局
  update();
  // 订阅布局发生变化事件(由 index.html 发出)
  (window as any).onlayoutchange = update;
}
