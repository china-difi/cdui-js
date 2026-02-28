import { createEffect, createMemo, createSignal, For, onCleanup, onMount, splitProps } from 'solid-js';

import { JSX } from '../jsx';
import { isBrowser } from '../dom';
import { animateScrollIntoView } from '../animate-scroll-to';
import { defineProperty } from '../reactive';
import { Icon } from './Icon';

const CLASS_NAME = 'carousel-vertical';

const EVENT_OPTIONS = { passive: true, capture: true };

const DOTS = new Array(100).join('0').split('');

/**
 * 填充数据项
 */
const fillItems = <T extends unknown>(items: readonly T[]) => {
  return [...items, ...items.slice(0, -1)];
};

/**
 * 是否正在调整大小
 */
let resizing = false;

if (isBrowser) {
  let resizeTimer: any;

  window.addEventListener(
    'resize',
    () => {
      resizing = true;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => (resizing = false), 500);
    },
    true,
  );
}

/**
 * 轮播组件外部调用接口
 */
export interface CarouselApi {
  /**
   * 当前索引
   */
  get index(): number;
  /**
   * 后退方法
   */
  backward: () => void;
  /**
   * 前进方法
   */
  forward: () => void;
}

/**
 * 轮播组件
 */
export const Carousel = <T, U extends JSX.Element>(
  props?: Omit<JSX.HTMLAttributes<never>, 'children'> & {
    /**
     * 要循环的数据集合
     */
    each: readonly T[];
    /**
     * 子节点
     *
     * @param item 数据项
     * @param index 索引
     * @returns JSX.Element
     */
    children: (item: T, index: () => number) => U;
    /**
     * 是否自动播放
     */
    autoplay?: boolean;
    /**
     * 间隔时间
     */
    interval?: number;
    /**
     * 是否竖直滚动
     */
    vertical?: boolean;
    /**
     * 外部调用接口
     */
    api?: (api: CarouselApi) => void;
  },
) => {
  let [thisProps, restProps] = splitProps(props, [
    'class',
    'each',
    'children',
    'autoplay',
    'interval',
    'vertical',
    'api',
  ]);
  let [currentIndex, setCurrentIndex] = createSignal(0);

  let ref: HTMLElement;
  // 开始按下位置
  let pressdown = -1;
  // 按下时的滚动位置
  let pressdownScroll: number;
  // 自动滚动计时器
  let autoplayTimer: any;

  // 获取滚动方向
  const scrollType = createMemo(() => (thisProps.vertical ? 'scrollTop' : 'scrollLeft'));
  const offsetType = createMemo(() => (thisProps.vertical ? 'offsetTop' : 'offsetLeft'));
  const screenType = createMemo(() => (thisProps.vertical ? 'screenY' : 'screenX'));

  // 滚动到指定索引
  const scrollTo = (index: number) => {
    let children = ref.children;
    let length = children.length;
    let count = thisProps.each.length; // 真实的子项数量

    if (index < 0) {
      index += count;
    }

    // 重新开启自动播放
    autoplay();

    // 滚动到指定子节点
    animateScrollIntoView(ref, children[index % length] as HTMLElement).then(() => {
      if (index >= count) {
        // 滚动到对应节点
        ref[scrollType()] = (children[index - count] as HTMLElement)[offsetType()];
        // 调整到指定节点
        index -= count;
      }

      setCurrentIndex(index);
    });
  };

  const checkFirstIndex = () => {
    let index = currentIndex();

    if (index <= 0) {
      // 真实的子项数量
      let count = thisProps.each.length;

      // 先滚动到对应节点的填充节点
      ref[scrollType()] = (ref.children[index + count] as HTMLElement)[offsetType()];
      // 调整到指定节点
      index += count;
    }

    return index;
  };

  // 后退
  const backward = () => {
    scrollTo(checkFirstIndex() - 1);
  };

  // 前进
  const forward = () => {
    scrollTo(currentIndex() + 1);
  };

  const ontouchstart = (event: TouchEvent) => {
    checkFirstIndex();

    // 记录按下时状态
    pressdown = (event.changedTouches[0] || event.touches[0])[screenType()];
    pressdownScroll = ref[scrollType()];

    // 取消自动播放
    clearTimeout(autoplayTimer);
  };

  const ontouchmove = (event: TouchEvent) => {
    if (pressdown >= 0) {
      ref[scrollType()] = pressdownScroll - ((event.changedTouches[0] || event.touches[0])[screenType()] - pressdown);
    }
  };

  const ontouchend = (event: TouchEvent) => {
    let distance = (event.changedTouches[0] || event.touches[0])[screenType()] - pressdown;
    let index = currentIndex();

    // 清除按下状态
    pressdown = -1;

    // 往前滚
    if (distance > 20) {
      scrollTo(index - 1);
    } else if (distance < -20) {
      // 如果是第一个位置,则恢复滚动位置
      if (index === 0) {
        ref[scrollType()] = ref.children[offsetType()];
      }

      scrollTo(index + 1);
    } else {
      animateScrollIntoView(ref, ref.children[index % ref.children.length] as HTMLElement);
    }
  };

  const autoplay = () => {
    clearTimeout(autoplayTimer);

    if (thisProps.autoplay !== false) {
      autoplayTimer = setTimeout(
        () => {
          if (!resizing) {
            let rect = ref.getBoundingClientRect();
            let top = rect.top;

            if (top + rect.height > 10 && top - 10 < window.innerHeight) {
              forward();
            }
          }

          autoplay();
        },
        thisProps.interval > 3000 ? thisProps.interval : 3000,
      );
    }
  };

  // 初始化外部访问接口
  thisProps.api &&
    thisProps.api(
      defineProperty(
        {
          backward,
          forward,
        },
        'index',
        { get: currentIndex },
      ) as CarouselApi,
    );

  createEffect(() => {
    let classList = ref.classList;

    if (props.vertical) {
      if (!classList.contains(CLASS_NAME)) {
        classList.add();
      }
    } else {
      classList.remove(CLASS_NAME);
    }
  });

  createEffect(autoplay);

  onMount(() => {
    ref.addEventListener('touchstart', ontouchstart, EVENT_OPTIONS);
    ref.addEventListener('touchmove', ontouchmove, EVENT_OPTIONS);
    ref.addEventListener('touchend', ontouchend, EVENT_OPTIONS);

    onCleanup(() => {
      ref.removeEventListener('touchstart', ontouchstart, EVENT_OPTIONS);
      ref.removeEventListener('touchmove', ontouchmove, EVENT_OPTIONS);
      ref.removeEventListener('touchend', ontouchend, EVENT_OPTIONS);
    });
  });

  return (
    <div ref={ref as any} class={'carousel scrollbar-hidden ' + (thisProps.class || '')} {...restProps}>
      <For each={fillItems(thisProps.each)}>{thisProps.children}</For>
    </div>
  );
};

/**
 * 轮播按钮
 */
export const CarouselButtons = (props: { carousel: CarouselApi }) => {
  return (
    <>
      <Icon class="carousel-backward" name="backward" onclick={() => props.carousel.backward()}></Icon>
      <Icon class="carousel-forward" name="forward" onclick={() => props.carousel.forward()}></Icon>
    </>
  );
};

/**
 * 轮播页码点
 */
export const CarouselDots = <T extends unknown>(props: { each: readonly T[]; carousel: CarouselApi }) => {
  return (
    <For each={DOTS.slice(0, props.each.length)}>
      {(_, index) => <span class={'carousel-dot' + (props.carousel.index === index() ? ' selected' : '')}></span>}
    </For>
  );
};
