import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import { loadFonts } from './plugins/webfontloader'

const storageChanged = () => {
  store.dispatch('dispatchRecord');
}
chrome.storage.local.onChanged.addListener(storageChanged);
loadFonts()

createApp(App)
  .use(vuetify)
  .use(router)
  .use(store)
  .mount('#app')
