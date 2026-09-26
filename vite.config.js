import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      '@draft': resolve(__dirname, 'draft'),
      '@src_next': resolve(__dirname, 'src_next'),
      '@catalogue': resolve(__dirname, 'catalogue'),
      '@src': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalogue: resolve(__dirname, 'catalogue/index.html'),
        components: resolve(__dirname, 'showcase/components.html'),
        primitives: resolve(__dirname, 'showcase/primitives.html'),
        structural_patterns: resolve(__dirname, 'showcase/structural_patterns.html'),
        animations: resolve(__dirname, 'showcase/animations.html'),
        viewport_paradigms: resolve(__dirname, 'showcase/viewport_paradigms.html'),
        developer: resolve(__dirname, 'showcase/developer.html'),
        showcase_special: resolve(__dirname, 'showcase/showcase_special.html'),
        examples: resolve(__dirname, 'examples/index.html')
      }
    }
  }
});
