import { CrxInfo } from "@CrxClass";
import { setItemFromLocalStorage,
    createViewTab,
    openViewWindow,
    createRecordingTargetTab,
    openRecordingTargetWindow,
    sendRecordingStartCommand,
    getItemFromLocalStorage,
    currentWindowTabs,
    onCreatedTab,
    onRemovedTab } from "@CrxApi";
import { CRX_RECORDS } from "@CrxConstants";
import { EVENT } from "@CrxConstants";

const crxInfo = new CrxInfo();

const init = () => {
    setItemFromLocalStorage(CRX_RECORDS, []);
    
    createRecordingTargetTab().then(result => {
        openRecordingTargetWindow(result).then(result => {
            crxInfo.TARGET_TAB = result.tabs[0];
            crxInfo.TARGET_WINDOW_ID = result.tabs[0].windowId;
        });
    });

    createViewTab().then(result => {
        openViewWindow(result).then(result => {
            crxInfo.VIEW_WINDOW_ID = result.id;
        });
    });
}

const onMessage = (request : chrome.webRequest.WebRequestDetails, sender, response) => {
    console.log(request)
}
const storageChange = (d) => {
    // console.log(d)
}

const onMovedTabHandler = (tabId : number, moveInfo : chrome.tabs.TabMoveInfo) => {
    // 추후 개발
}

const onCreatedTabHandler = (tab : chrome.tabs.Tab) => {
    if (tab.windowId !== crxInfo.TARGET_WINDOW_ID) return;
    onCreatedTab(crxInfo.TARGET_WINDOW_ID);
}
const onRemovedTabHandler = (tabId : number, removeInfo : chrome.tabs.TabRemoveInfo) => {
    if (removeInfo.windowId !== crxInfo.TARGET_WINDOW_ID) return;
    // const removeTabIndex = crxInfo.TARGET_TABS.find(tab => tab.id === tabId).index;
    currentWindowTabs(crxInfo.TARGET_WINDOW_ID).then(tabs => {
        const activeTabIndex = tabs.find(tab => tab.active).index;
        onRemovedTab(activeTabIndex)
    });
    
}
const onActivatedTabHandler = (activeInfo : chrome.tabs.TabActiveInfo) => {
    if (activeInfo.windowId !== crxInfo.TARGET_WINDOW_ID) return;

}
chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onMessage.addListener(onMessage);
chrome.storage.onChanged.addListener(storageChange);

chrome.webNavigation.onCompleted.addListener(details => {
    sendRecordingStartCommand(crxInfo.TARGET_WINDOW_ID);
    currentWindowTabs(crxInfo.TARGET_WINDOW_ID).then((tabs)=> {
        crxInfo.TARGET_TABS = tabs;
    });
});

chrome.tabs.onMoved.addListener(onMovedTabHandler);
chrome.tabs.onCreated.addListener(onCreatedTabHandler);
chrome.tabs.onRemoved.addListener(onRemovedTabHandler);
chrome.tabs.onActivated.addListener(onActivatedTabHandler)