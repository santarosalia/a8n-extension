import { createApp } from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import router from '@/router'
import store from '@/store'
import { setItemFromLocalStorage } from '@CrxApi'
import { CRX_ADD_SCRAPING_DATA, CRX_ACTION } from '@CrxConstants'

const storageChanged = (changes : any) => {
  if (changes.CRX_NEW_RECORD) {
    store.dispatch(CRX_ACTION.ADD_NEW_RECORD, changes.CRX_NEW_RECORD);
  }
  if (changes.CRX_ADD_SCRAPING_DATA && changes.CRX_ADD_SCRAPING_DATA.newValue !== null) {
    console.log(changes.CRX_ADD_SCRAPING_DATA)
    store.dispatch(CRX_ACTION.ADD_SCRAPING_DATA, changes.CRX_ADD_SCRAPING_DATA);
    setItemFromLocalStorage(CRX_ADD_SCRAPING_DATA, null);
  }

  
  store.dispatch(CRX_ACTION.DISPATCH_SCRAPING_DATAS);
  store.dispatch(CRX_ACTION.DISPATCH_RECORDS);
}

chrome.storage.local.onChanged.addListener(storageChanged);

createApp(App)
  .use(vuetify)
  .use(router)
  .use(store)
  .mount('#app')
