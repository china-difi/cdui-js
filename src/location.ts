import { isBrowser } from './dom';
import { batch, reactive } from './reactive';

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
    // 更新历史
    history.pushState(null, '', url || '');
    // 不能立即取 window.location.pathname，在夸克等浏览取不到最新值
    updateURL(url || '');

    if (isBrowser && scrollTo) {
      window.scrollTo(scrollTo[0] | 0, scrollTo[1] | 0);
    }
  },
});

export const parseQuery = (search: string) => {
  let query: any = {};
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
 * @param url 当前 url
 */
export const updateURL = (url: string) => {
  if (location.url !== url || (url = '')) {
    let path = url;
    let search = '';
    let hash = '';
    let index;

    if ((index = path.indexOf('#')) >= 0) {
      hash = path.slice(index);
      path = path.slice(0, index);
    }

    if ((index = path.indexOf('?')) >= 0) {
      search = path.slice(index);
      path = path.slice(0, index);
    }

    batch(() => {
      location.url = url;
      location.hash = hash;
      location.path = path;
      location.paths = path.match(/\/[^/]*/g) || [];
      location.search = search;
      location.query = search ? parseQuery(search) : {};
    });
  }
};

// 浏览器环境
if (isBrowser) {
  (() => {
    // 更新地址方法
    const routeTo = () => {
      let system = window.location;
      updateURL(system.pathname + system.search + system.hash);
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
  })();
}
