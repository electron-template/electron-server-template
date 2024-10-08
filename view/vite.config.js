import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'node:path'
// import os from 'node:os'
// import { createRequire } from 'node:module'
// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
console.log('__dirname', __dirname)
// const basePath = path.resolve(__dirname, '../')
// const outDir= path.join(basePath, 'build', 'renderer')
// const root=path.join(basePath, 'view')
// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  base: './',
  publicDir: 'public',
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080
  },
  // build: {
  //   outDir,
  //   emptyOutDir: true
  // }
})
