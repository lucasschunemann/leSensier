import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        colecao: resolve(import.meta.dirname, 'colecao.html'),
        produto: resolve(import.meta.dirname, 'produto.html'),
        marca: resolve(import.meta.dirname, 'marca.html'),
      },
    },
  },
});
