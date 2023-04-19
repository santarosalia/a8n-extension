import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'

const storageChanged = (changes : any) => {
  if (changes.CRX_NEW_RECORD) {
    console.log(changes.CRX_NEW_RECORD.newValue.type)
    store.dispatch('addNewRecord',changes.CRX_NEW_RECORD);
  }

  store.dispatch('dispatchRecords');
  // console.log(store.getters.getRecords[store.getters.getRecords.length-1])
}

chrome.storage.local.onChanged.addListener(storageChanged);

createApp(App)
  .use(vuetify)
  .use(router)
  .use(store)
  .mount('#app')
