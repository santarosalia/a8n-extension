export const getItemFromLocalStorage = (key : string[]) => {
    return chrome.storage.local.get(key);
}

export const setItemFromLocalStorage = (key :string , value : any) => {
    const obj = {};
    obj[key] = value;
    return chrome.storage.local.set(obj);
}

export const createViewTab = () => {
    return chrome.tabs.create({
        url: chrome.runtime.getURL('index.html'),
        active : true
    });
}

export const openWindow = (tab : chrome.tabs.Tab) => {
    return chrome.windows.create({
        tabId : tab.id,
        type : "popup",
        width : 500,
        height : 700
    });
}