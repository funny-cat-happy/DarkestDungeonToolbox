import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@asset': resolve('resources')
      }
    },
    plugins: [
      vue(),
      UnoCSS({
        configFile: './uno.config.ts'
      }),
      VueI18nPlugin({ include: [path.resolve(__dirname, './src/locales/**')] })
    ]
  }
})
