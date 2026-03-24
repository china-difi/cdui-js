import path from 'path';
import { fileURLToPath } from 'url';

import { buildCSS } from '../../build/css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ruleFile = path.join(__dirname, 'css.md');
const cssFile = path.join(__dirname, '../src/css/atomic.css');

buildCSS(ruleFile, cssFile);
