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
        url: 'https://www.naver.com',
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

export const onHighlightedTab = (windowId : number) => {
    setTimeout(() => {
        currentWindowTabs(windowId).then(tabs => {
            const activeTabIndex = tabs.find(tab => tab.active).index;
            getItemFromLocalStorage([CRX_RECORDS]).then(result => {
                // 브라우저 오픈 시 탭 이동 인식해버려서 길이 1일 때 리턴함
                if (result.CRX_RECORDS.length === 1) return;
                result.CRX_RECORDS.push({
                    type : EVENT.MOVETAB,
                    value : activeTabIndex
                });
                setItemFromLocalStorage(CRX_RECORDS, result.CRX_RECORDS);
            });
        });
    }, 100);
}
