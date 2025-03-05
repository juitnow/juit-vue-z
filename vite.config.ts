import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [ vue(), dts({
    tsconfigPath: './tsconfig.app.json',
    // root: './lib',
    // entryRoot: './lib/index.ts',
    rollupTypes: true,
  }) ],

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
