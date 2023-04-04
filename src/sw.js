const init = () => {
    chrome.storage.local.set({Record : []});
}

chrome.storage.local.get(['Record']).then(result => {

});
const storageChanged = (changes, areaName) => {
    console.log(changes.Record.newValue);
}
chrome.storage.local.onChanged.addListener(storageChanged);