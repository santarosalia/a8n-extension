import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import { loadFonts } from './plugins/webfontloader'

const storageChanged = () => {
  store.dispatch('dispatchRecords');
  console.log(store.getters.getRecords[store.getters.getRecords.length-1])
}

chrome.storage.local.onChanged.addListener(storageChanged);
loadFonts()

createApp(App)
  .use(vuetify)
  .use(router)
  .use(store)
  .mount('#app')
