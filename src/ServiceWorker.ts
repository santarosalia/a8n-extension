import { CrxInfo, CrxBrowserOpenEvent } from "@CrxClass";
import { setItemFromLocalStorage,
    createViewTab,
    openViewWindow,
    createRecordingTargetTab,
    openRecordingTargetWindow,
    sendMessageByWindowId,
    onHighlightedTab,
    windowFocus,
    captureImage,
    getItemFromLocalStorage
} from "@CrxApi";
import { CRX_CMD, CRX_RECORDS } from "@CrxConstants";
import { EVENT } from "@CrxConstants";

const crxInfo = new CrxInfo();

const init = () => {
    const e = new CrxBrowserOpenEvent('https://www.naver.com');

    setItemFromLocalStorage(CRX_RECORDS, [e]);
    
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

const onMessage = (message : any,sender , sendResponse :any) => {
    switch (message.command) {
        case CRX_CMD.CMD_RECORDING_WINDOW_FOCUS : {
            windowFocus(crxInfo.TARGET_WINDOW_ID);
            break;
        }
        case CRX_CMD.CMD_CAPTURE_IMAGE : {
            captureImage(crxInfo.TARGET_WINDOW_ID).then(image => {
                // getItemFromLocalStorage([CRX_RECORDS]).then(result => {
                //     const records = result.CRX_RECORDS;
                //     records[message.payload].image = image;
                //     setItemFromLocalStorage(CRX_RECORDS, records);
                // });
                sendResponse(image)
            })
        }

    }
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
    const injectInterval = setInterval(()=>{
        sendMessageByWindowId(crxInfo.TARGET_WINDOW_ID, CRX_CMD.CMD_RECORDING_START).catch((e) => {
            //레코딩 창 닫힌 경우!
            clearInterval(injectInterval);
        });
    },1000);
});