const init = () => {
    chrome.storage.local.set({'WD_CRX_RECORD' : []});
    
    chrome.tabs.create({
        url: chrome.runtime.getURL('index.html'),
        active : true
      }, openWindow);
}

const openWindow = (tab) => {
    chrome.windows.create({
        tabId: tab.id,
        type: "popup",
        width: 800,
        height: 900
      },(window)=>{
        // recordingHistoryWindowId = window.id;
      });
}
// chrome.storage.local.get(['WD_CRX_RECORD']).then(result => {

// });
// const storageChanged = (changes, areaName) => {
//     console.log(changes['WD_CRX_RECORD'].newValue);
// }
// chrome.storage.local.onChanged.addListener(storageChanged);

chrome.runtime.onInstalled.addListener(init);
