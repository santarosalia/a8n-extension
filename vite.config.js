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
      },
      {
        find : '@CrxApi',
        replacement : resolve(__dirname, 'src/ts/api/CrxApi.ts')
      },
      {
        find : '@CrxClass',
        replacement : resolve(__dirname, 'src/ts/class')
      },
      {
        find : '@CrxConstants',
        replacement : resolve(__dirname, 'src/ts/constants/CrxConstants.ts')
      },
      {
        find : '@CrxInterface',
        replacement : resolve(__dirname, 'src/ts/interface/CrxInterface.ts')
      },
    ]
  },
  build : {
    rollupOptions : {
      input : {
        main : resolve(__dirname, 'index.html')
      }
    },
    minify : true
  }
})
