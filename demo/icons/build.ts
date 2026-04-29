import path from 'path';
import { fileURLToPath } from 'url';

import { loadIconFile, loadIconsDirectory, saveIconsModule, saveIconsToHtml } from '../../build/icons';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const icons = [
  loadIconFile(path.join(__dirname, '../../icons/backward.svg')),
  loadIconFile(path.join(__dirname, '../../icons/close.svg')),
  loadIconFile(path.join(__dirname, '../../icons/dropdown.svg')),
  loadIconFile(path.join(__dirname, '../../icons/forward.svg')),
  loadIconFile(path.join(__dirname, '../../icons/toggle.svg')),
];

saveIconsToHtml(path.join(__dirname, '../index.html'), icons.join('\n'));
// saveIconsModule(path.join(__dirname, '../icons.ts'), icons.join('\n'));
