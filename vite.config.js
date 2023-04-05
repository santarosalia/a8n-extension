import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' }
// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify'
import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }),
    vuetify()
  ],
  resolve : {
    alias : [
      {
        find : '@',
        replacement : resolve(__dirname, 'src')
      }
    ]
  },
  build : {
    rollupOptions : {
      input : {
        main : resolve(__dirname, 'index.html')
      }
    }
  }
})
