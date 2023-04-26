import { createApp } from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import router from '@/router'
import store from '@/store'
import { setItemFromLocalStorage } from '@CrxApi'
import { CRX_ADD_SCRAPING_DATA } from '@CrxConstants'

const storageChanged = (changes : any) => {
  if (changes.CRX_NEW_RECORD) {
    store.dispatch('addNewRecord', changes.CRX_NEW_RECORD);
  }
  if (changes.CRX_ADD_SCRAPING_DATA && changes.CRX_ADD_SCRAPING_DATA.newValue !== null) {
    console.log(changes.CRX_ADD_SCRAPING_DATA)
    store.dispatch('addScrapingData', changes.CRX_ADD_SCRAPING_DATA);
    setItemFromLocalStorage(CRX_ADD_SCRAPING_DATA, null);
  }

  
  store.dispatch('dispatchScrapingDatas');
  store.dispatch('dispatchRecords');
}

chrome.storage.local.onChanged.addListener(storageChanged);

createApp(App)
  .use(vuetify)
  .use(router)
  .use(store)
  .mount('#app')
