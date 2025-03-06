import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [ vue() ],

  build: {
    minify: true,
    sourcemap: true,
    outDir: 'dist',
    copyPublicDir: false,
    lib: {
      formats: [ 'es' ],
      entry: 'lib/index.ts',
      name: 'JuitZ',
      fileName: 'index',
    },
    rollupOptions: {
      external: [ 'vue', 'quasar', 'vue-router', '@juit/vue-i18n', '@quasar/extras' ],
    },
  },
})
