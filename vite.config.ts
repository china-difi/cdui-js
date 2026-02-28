import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

import VitePlugin from 'vite-plugin-solid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * h5构建方法
 */
export default defineConfig({
  root: __dirname,
  base: '/',
  plugins: [
    VitePlugin({})
  ],
  build: {
    // target: 'es2015',
    modulePreload: false,
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(__dirname, 'index.html'),
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
    minify: false,
    sourcemap: true,
  }
});
