export type { SSRRenderPage } from '../reactive';

// 预先加载 window 补丁
import './window';

import path from 'path';
// fs/promises 不稳定，有时会出现异步错误无法捕获的异步
import fs, { PathLike, PathOrFileDescriptor, WriteFileOptions } from 'fs';

import { Component, createComponent } from 'solid-js';
import { generateHydrationScript, renderToString } from 'solid-js/web';

import { updateURL } from '../location';
import { SSRRenderPage, ServerContext, setServerContext } from '../reactive';

const exists = (path: PathLike): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const mkdir = (path: PathLike) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(void 0);
      }
    });
  });
};

const writeFile = (path: PathOrFileDescriptor, data: string | DataView, options: WriteFileOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(void 0);
      }
    });
  });
};

const renderToStringAsync = async <T>(context: ServerContext, fn: () => T) => {
  while (true) {
    setServerContext(context);

    let html = renderToString(fn);

    if (context.promises[0]) {
      await Promise.all(context.promises);
      context.promises.length = 0;
    } else {
      return html;
    }
  }
};

/**
 * 渲染单个页面
 */
const renderPage = async (
  App: Component<any>,
  languages: { [key: string]: any },
  language: string,
  root: string,
  template: string,
  page: SSRRenderPage,
) => {
  let context = { promises: [], cache: new Map(), ssr: {} };
  let title = page.title;
  let description = page.description;
  let scripts = [];

  // 设置当前路由路径
  updateURL(page.path, page.search);

  // 渲染html
  let html = await renderToStringAsync(context, () => createComponent(App, null));

  // 多语言
  if (language !== 'en') {
    template = template.replace('lang="en"', 'lang="' + language + '"');

    if (languages[language]) {
      scripts.push('<script type="text/javascript">window.I18N=' + JSON.stringify(languages[language]) + '</script>');
    }
  }

  if (Object.getOwnPropertyNames(context.ssr).length > 0) {
    scripts.push('<script type="text/javascript">window.SSR=' + JSON.stringify(context.ssr) + '</script>');
  }

  scripts.push(generateHydrationScript());

  // 插入内容
  html = template.replace('<!-- ssr-body -->', html);

  // 插入头部脚本
  html = html.replace('<!-- ssr-head -->', scripts.join(''));

  if (title) {
    html = html.replace(/\<title\>[^<]+/, '<title>' + title);
  }

  if (description) {
    html = html.replace(
      /\<meta\s+name\=\"description\"\s+content\=\"[^"]+/,
      '<meta name="description" content="' + description,
    );
  }

  let file = path.join(root, 'ssr', language, page.path);
  let dir = path.dirname(file);

  if (!(await exists(dir))) {
    await mkdir(dir);
  }

  await writeFile(file, html, 'utf8');
};

/**
 * 服务端渲染错误集合
 */
export const SSR_ERRORS = [];

/**
 * 渲染服务端页面集合
 */
export const renderSSRPages = async (
  App: Component<any>,
  languages: { [key: string]: any },
  language: string,
  root: string,
  template: string,
  pages: SSRRenderPage[],
) => {
  // @ts-ignore
  if (import.meta.env.SSR) {
    for (let i = 0, l = pages.length; i < l; i++) {
      let page = pages[i];

      try {
        let now = Date.now();

        console.log(`rendering：${language} ${page.path}`);

        await renderPage(App, languages, language, root, template, page);

        console.log(`rendered: ${language} ${page.path}  time: ${Date.now() - now}`);
      } catch (err) {
        console.error(err);
        SSR_ERRORS.push(err.message + ': ' + (err.cause || { message: '...' }).message);

        // 页面渲染失败终止渲染
        if (page.abort) {
          break;
        }
      }
    }

    if (SSR_ERRORS[0]) {
      return Promise.reject({
        language,
        errors: SSR_ERRORS,
      });
    }
  }
};
