import './css/all.css';

import { startAutoCloseEvent, render } from '../../src';
import { App } from './App';

// 客户端渲染
render(App, document.body);

// 开始侦听自动关闭事件
startAutoCloseEvent();
