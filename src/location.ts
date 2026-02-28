import { isBrowser } from './dom';
import { reactive } from './reactive';

export interface Location {
  /**
   * 完整 URL
   */
  url: string;

  /**
   * 路径
   */
  path: string;

  /**
   * 查询参数
   */
  search: string;

  /**
   * hash
   */
  hash: string;

  /**
   * 参数
   */
  query: { readonly [key: string]: any };

  /**
   * 路径集合
   */
  paths: string[];

  /**
   * 路由到指定地址
   *
   * @param url 指定地址
   * @param scrollTo 要滚动到的位置
   */
  routeTo(url: string, scrollTo?: [number, number]): void;
}

/**
 * 当前地址
 */
export const location: Location = reactive({
  url: '',
  path: '',
  search: '',
  hash: '',
  query: {},
  paths: [],
  routeTo(url: string, scrollTo?: [number, number]) {
    history.pushState(null, '', url || '');
    routeTo();

    if (isBrowser && scrollTo) {
      window.scrollTo(scrollTo[0] | 0, scrollTo[1] | 0);
    }
  },
});

export const parseQuery = (search: string) => {
  let query = {};
  let items = search.slice(1).split('&');
  let item;

  for (let i = 0, l = items.length; i < l; i++) {
    if ((item = items[i])) {
      let index = item.indexOf('=');
      let key = index > 0 ? item.slice(0, index) : item;
      let value = index > 0 ? decodeURIComponent(item.slice(index + 1) || '') : '';
      let oldValue = query[key];

      if (oldValue === void 0) {
        query[key] = value;
      } else if (typeof oldValue !== 'string') {
        oldValue.push(value);
      } else {
        query[key] = [oldValue, value];
      }
    }
  }

  return query;
};

/**
 * 更新地址
 *
 * @param path 路径
 * @param search 查询条件
 * @param hash hash
 */
export const updateURL = (path: string, search?: string, hash?: string) => {
  location.url = path + (search || '') + (hash || '');
  location.hash = hash;

  if (location.path !== path || location.search !== search) {
    location.path = path;
    location.paths = path.match(/\/[^/]*/g) || [];
    location.search = search;
    location.query = search ? parseQuery(search) : {};
  }
};

// 浏览器环境
const routeTo = isBrowser
  ? (() => {
      // 更新地址方法
      const routeTo = () => {
        let system = window.location;

        updateURL(system.pathname, system.search, system.hash);
      };

      // 立即更新
      routeTo();

      // 侦听地址变化
      window.addEventListener('popstate', () => routeTo(), true);
      // window.addEventListener(
      //   'hashchange',
      //   () => {
      //     location.hash = '';
      //   },
      //   true,
      // );

      return routeTo;
    })()
  : () => {};
