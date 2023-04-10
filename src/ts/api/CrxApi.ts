import { CRX_COMMAND } from "@CrxConstants";
import { CRX_RECORDS, EVENT } from "@CrxConstants";

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

export const openViewWindow = (tab : chrome.tabs.Tab) => {
    return chrome.windows.create({
        tabId : tab.id,
        type : "popup",
        width : 500,
        height : 700
    });
}

export const createRecordingTargetTab = () => {
    return chrome.tabs.create({
        url: 'https:www.naver.com',
        active : true
    });
}

export const openRecordingTargetWindow = (tab : chrome.tabs.Tab) => {
    return chrome.windows.create({
        tabId : tab.id,
        type : "normal"
    });
}

export const sendRecordingStartCommand = async (windowId : number) => {
    return chrome.tabs.query({windowId : windowId}).then(tabs => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                command : CRX_COMMAND.RECORDING_START
            });
        });
    });
}

export const currentWindowTabs = (windowId : number) => {
    return chrome.tabs.query({windowId : windowId});
}

export const onCreatedTab = (windowId : number) => {
    setTimeout(() => {
        currentWindowTabs(windowId).then(tabs => {
            getItemFromLocalStorage([CRX_RECORDS]).then(result => {
                result.CRX_RECORDS.push({
                    type : EVENT.MOVETAB,
                    value : tabs.length-1
                });
                setItemFromLocalStorage(CRX_RECORDS, result.CRX_RECORDS);
            });
        });
    }, 100);
}

export const onRemovedTab = (tabIndex : number) => {
    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        result.CRX_RECORDS.push({
            type : EVENT.MOVETAB,
            value : tabIndex
        });
        setItemFromLocalStorage(CRX_RECORDS, result.CRX_RECORDS);
    });
}

export const onActivatedTab = (tabIndex : number) => {

}

