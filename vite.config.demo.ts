import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_BASE_URL,
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: '/src/quasar.sass' }),
  ],
  build: {
    minify: true,
    sourcemap: true,
    outDir: 'demo',
    copyPublicDir: true,
  },
})
