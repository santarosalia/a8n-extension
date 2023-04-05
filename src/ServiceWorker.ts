

class Setting {
    EVENT_INDEX : number
    VIEW_WINDOW_ID : number
    constructor () {
        this.EVENT_INDEX = 0;
    }
}

const setting = new Setting();

const init = () => {
    chrome.storage.local.set({
    'WD_CRX_RECORD' : [],
    'EVENT_INDEX' : setting.EVENT_INDEX
    });
    
    chrome.tabs.create({
        url: chrome.runtime.getURL('index.html'),
        active : true
    }, openWindow);
}
  
const openWindow = (tab : chrome.tabs.Tab) => {
    chrome.windows.create({
        tabId : tab.id,
        type : "popup",
        width : 800,
        height : 900
    }).then(result=> {
        setting.VIEW_WINDOW_ID = result.id;
        console.log(setting.VIEW_WINDOW_ID)
    });
}

chrome.runtime.onInstalled.addListener(init);
  