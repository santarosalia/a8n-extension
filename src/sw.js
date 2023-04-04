const init = () => {
    chrome.storage.local.set({'WD_CRX_RECORD' : []});
}

chrome.storage.local.get(['WD_CRX_RECORD']).then(result => {

});
const storageChanged = (changes, areaName) => {
    console.log(changes['WD_CRX_RECORD'].newValue);
}
chrome.storage.local.onChanged.addListener(storageChanged);

chrome.runtime.onInstalled.addListener(init);
