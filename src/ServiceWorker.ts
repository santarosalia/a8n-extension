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
    sendMessageToView
} from "@CrxApi";
import { CRX_ADD_SCRAPING_DATA, CRX_MSG_RECEIVER, CRX_STATE } from "@CrxConstants";
import { CrxMessage, CRX_COMMAND } from "@CrxInterface";

const crxInfo = new CrxInfo();

const init = () => {
    const e = new CrxBrowserOpenEvent('https://www.naver.com');

    setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, [e]);
    setItemFromLocalStorage(CRX_ADD_SCRAPING_DATA, null);
    setItemFromLocalStorage(CRX_STATE.CRX_SCRAPING_DATAS, {
        exceptRow : [],
        data : []
    });
    
    createRecordingTargetTab().then(result => {
        openRecordingTargetWindow(result).then(result => {
            crxInfo.TARGET_TAB = result.tabs[0];
            crxInfo.TARGET_WINDOW_ID = result.tabs[0].windowId;
        });
    });

    openView();
}

const onMessage = (message : CrxMessage, sender :chrome.runtime.MessageSender , sendResponse : any) => {
    if (message.receiver !== CRX_MSG_RECEIVER.SERVICE_WORKER) return;
    const COMMAND = message.command;
    switch (COMMAND) {
        case CRX_COMMAND.CMD_RECORDING_WINDOW_FOCUS : {
            windowFocus(crxInfo.TARGET_WINDOW_ID);
            break;
        }
        case CRX_COMMAND.CMD_CAPTURE_IMAGE : {
            captureImage(crxInfo.TARGET_WINDOW_ID).then(image => {
                sendResponse({image : image});
            }).catch(e => {
                console.log(e)
                sendResponse({error : e});
            });
            return true;
        }
        case CRX_COMMAND.CMD_OPEN_VIEW : {
            sendMessageByWindowId(crxInfo.VIEW_WINDOW_ID, CRX_COMMAND.NONE).then(() => {
                windowFocus(crxInfo.VIEW_WINDOW_ID);
            }).catch(() => {
                openView();
            });
            
            break;
        }
        case CRX_COMMAND.CMD_CONTEXT_MENU_CHANGE : {
            sendMessageByWindowId(crxInfo.TARGET_WINDOW_ID, CRX_COMMAND.CMD_CONTEXT_MENU_CHANGE, message.payload);
            break;
        }
        case CRX_COMMAND.CMD_SEND_NEXT_PAGE_BUTTON : {
            sendMessageToView(crxInfo.VIEW_WINDOW_ID,CRX_COMMAND.CMD_SEND_NEXT_PAGE_BUTTON, message.payload);
            break;
        }
        case CRX_COMMAND.CMD_SEND_NEXT_PAGE_NUMBER : {
            sendMessageToView(crxInfo.VIEW_WINDOW_ID,CRX_COMMAND.CMD_SEND_NEXT_PAGE_NUMBER, message.payload);
            break;
        }
    }
}
const openView = () => {
    createViewTab().then(result => {
        openViewWindow(result).then(result => {
            crxInfo.VIEW_WINDOW_ID = result.id;
        });
    });
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
        sendMessageByWindowId(crxInfo.TARGET_WINDOW_ID, CRX_COMMAND.CMD_RECORDING_START).catch((e) => {
            //레코딩 창 닫힌 경우!
            clearInterval(injectInterval);
        });
    },1000);
});