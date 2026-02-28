export * from './message';
export * from './language';
export * from './http';

export {
  type JSX,
  createComponent,
  createEffect,
  createMemo,
  createContext,
  useContext,
  splitProps,
  onMount,
  onCleanup,
  untrack,
  batch,
} from 'solid-js';

export { Show, For, hydrate, render } from 'solid-js/web';

export * from './dom';
export * from './animate-scroll-to';

export * from './reactive';
export * from './location';
export * from './layout';

export * from './components/If';
export * from './components/Switch';
export * from './components/For';
export * from './components/Icon';
export * from './components/CollapsiblePanel';
export * from './components/ComboBox';
export * from './components/Carousel';
export * from './components/KeepAlive';
export * from './components/Dialog';

declare global {
  export interface ImportMeta {
    // 配置环境变量类型
    env: {
      /**
       * 应用运行模式
       */
      MODE: string;

      /**
       * 是否服务端渲染
       */
      SSR: boolean;

      /**
       * 是否浏览器模式
       */
      VITE_BROWSER: boolean;

      /**
       * API基础路径
       */
      VITE_API_BASE_URL: string;

      /**
       * 是否开启 API Mock
       */
      VITE_API_MOCK: boolean;
    };
  }
}
