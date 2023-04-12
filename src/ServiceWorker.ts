import { CrxInfo } from "@CrxClass";
import { setItemFromLocalStorage,
    createViewTab,
    openViewWindow,
    createRecordingTargetTab,
    openRecordingTargetWindow,
    sendMessageByWindowId,
    onHighlightedTab
} from "@CrxApi";
import { CRX_CMD, CRX_RECORDS } from "@CrxConstants";
import { getItemFromLocalStorage } from "@CrxApi";
import { EVENT } from "@CrxConstants";

const crxInfo = new CrxInfo();

const init = () => {
    setItemFromLocalStorage(CRX_RECORDS, [{
        type : EVENT.OPENBROWSER,
        value : 'https://www.naver.com',
        frameStack : []
    }]);
    
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

const onHighlightedTabHandler = (highlightInfo : chrome.tabs.TabHighlightInfo) => {
    if (highlightInfo.windowId !== crxInfo.TARGET_WINDOW_ID) return;
    onHighlightedTab(highlightInfo.windowId);
}
chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onMessage.addListener(onMessage);
chrome.storage.onChanged.addListener(storageChange);

// chrome.webNavigation.onCompleted.addListener(details => {
//     sendRecordingStartCommand(crxInfo.TARGET_WINDOW_ID);
// });

chrome.tabs.onHighlighted.addListener(onHighlightedTabHandler);
chrome.runtime.onInstalled.addListener(()=> {
    setInterval(()=>{
        sendMessageByWindowId(crxInfo.TARGET_WINDOW_ID, CRX_CMD.CMD_RECORDING_START);
    },1000);
});