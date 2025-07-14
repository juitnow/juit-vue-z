import { fileURLToPath } from 'node:url'

import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  base: process.env.VITE_BASE_URL,
  build: {
    minify: true,
    sourcemap: true,
    outDir: 'demo',
    copyPublicDir: true,
  },
  resolve: {
    alias: [
      { find: '@', replacement: srcPath },
    ],
  },
  plugins: [
    vue({
      script: { defineModel: true },
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: '/src/quasar.sass',
    }),
  ],
})
