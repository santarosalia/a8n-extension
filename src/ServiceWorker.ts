import { 
    setItemFromLocalStorage,
    createRecordingHistoryTab,
    openRecordingHistoryWindow,
    createRecordingTargetTab,
    openRecordingTargetWindow,
    sendMessageByWindowId,
    onHighlightedTab,
    windowFocus,
    captureImage,
    sendMessageToView,
    closeWindow,
    sendMessageToContentScript,
    sendMessageToSelector,
    showNotification,
    focusTab,
    allTabReload,
    checkTab,
    getItemFromLocalStorage
} from "@CrxApi";
import { BrowserType, CRX_ADD_SCRAPING_DATA, CRX_COMMAND, CRX_MSG_RECEIVER, CRX_NEW_RECORD, CRX_STATE } from "@CrxConstants";
import { CrxMessage, ExecuteRequestMessage, ExecuteResponseMessage } from "@CrxInterface";
import { BrowserController } from "@/ts/class/CrxBrowserController";
import { BrowserAction, ElementAction, Status } from "@CrxConstants";
import { CrxInfo } from "@CrxClass/CrxInfo";
import { CrxBrowserOpenEvent } from "@CrxClass/CrxBrowserOpenEvent";
import { test } from "./ts/api/CrxPuppeteerTest";
import { Executor } from "./ts/class/Executor";
import { fetchProcess, putProcess } from "./ts/api/Fetch";

const crxInfo = new CrxInfo();
console.log('%c ______'+'%c       ___'+'%c     _______'+'%c    ________  ','color:red','color:orange','color:yellow','color:green')
console.log("%c|_   _ `."+"%c   .'   `."+"%c  |_   __ \\"+"%c  |_   __  | ",'color:red','color:orange','color:yellow','color:green')
console.log('%c  | | `. \\'+'%c /  .-.  \\'+'%c   | |__) |   '+'%c| |_ \\_| ','color:red','color:orange','color:yellow','color:green')
console.log('%c  | |  | |'+'%c | |   | |'+'%c   |  ___/'+'%c    |  _| _  ','color:red','color:orange','color:yellow','color:green')
console.log("%c _| |_.' / "+"%c\\  `-'  /"+"%c  _| |_    "+"%c  _| |__/ | ",'color:red','color:orange','color:yellow','color:green')
console.log("%c|______.' "+"%c  `.___.' "+"%c |_____|   "+"%c |________| ",'color:red','color:orange','color:yellow','color:green')

const initBrowserRecorder = async (url : string) => {
    const e = new CrxBrowserOpenEvent(url);
    setItemFromLocalStorage(CRX_NEW_RECORD, null);
    setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, [e.object]);
    
    const recordingTargetTab = await createRecordingTargetTab(url);
    const recordingTargetWindow = await openRecordingTargetWindow(recordingTargetTab);
    [crxInfo.TARGET_TAB] = recordingTargetWindow.tabs;
    crxInfo.RECORDING_TARGET_WINDOW_ID = crxInfo.TARGET_TAB.windowId;
}

export const onMessage = async (message : CrxMessage, sender : chrome.runtime.MessageSender , sendResponse : any) => {
    if (message.receiver !== CRX_MSG_RECEIVER.SERVICE_WORKER) return;
    const COMMAND = message.command;
    switch (COMMAND) {
        case CRX_COMMAND.CMD_LAUNCH_BROWSER_RECORDER : {
            initBrowserRecorder(message.payload.url);
            const injectInterval = setInterval(() => {
                sendMessageByWindowId(crxInfo.RECORDING_TARGET_WINDOW_ID, CRX_COMMAND.CMD_RECORDING_START).catch((e) => {
                    //레코딩 창 닫힌 경우!
                    clearInterval(injectInterval);
                });
            },1000);
            break;
        }
        case CRX_COMMAND.CMD_RECORDING_WINDOW_FOCUS : {
            windowFocus(crxInfo.RECORDING_TARGET_WINDOW_ID);
            break;
        }
        case CRX_COMMAND.CMD_CAPTURE_IMAGE : {
            captureImage(crxInfo.RECORDING_TARGET_WINDOW_ID).then(image => {
                sendResponse({image : image});
            }).catch(e => {
                console.log(e)
                sendResponse({error : e});
            });
            return true;
        }
        case CRX_COMMAND.CMD_RECORDING_HISTORY : {
            sendMessageByWindowId(crxInfo.RECORDING_HISTORY_WINDOW_ID, CRX_COMMAND.NONE).then(() => {
                windowFocus(crxInfo.RECORDING_HISTORY_WINDOW_ID);
            }).catch(() => {
                openRecordingHistory();
            });
            
            break;
        }
        case CRX_COMMAND.CMD_RECORDING_END : {
            const { CRX_RECORDS } = await getItemFromLocalStorage([CRX_STATE.CRX_RECORDS]);
            const { user } = await chrome.storage.local.get('user');

            const result = await putProcess(JSON.stringify({
                name : message.payload.name,
                data : JSON.stringify(CRX_RECORDS),
                userId : user.id
            }));
            
            await closeWindow(crxInfo.RECORDING_TARGET_WINDOW_ID);
            break;
        }
        case CRX_COMMAND.CMD_SHOW_NOTIFICATION : {
            showNotification(message.payload.title,message.payload.message);
            break;
        }
        case CRX_COMMAND.CMD_START_PROCESS : {
            const processId = message.payload.id
            const result = await fetchProcess(processId);
            if (result) {
                new Executor(JSON.parse(result.data));
            } else {
                sendMessageToView(CRX_COMMAND.CMD_SET_SNACKBAR_MESSAGE, {message : '실행 오류'});
            }
        }
        
        
    }
}
chrome.storage.local.onChanged.addListener(async (changes) => {
    const { CRX_RECORDS }: { [key: string] : ExecuteRequestMessage[] } = await getItemFromLocalStorage([CRX_STATE.CRX_RECORDS]);
    const { CRX_NEW_RECORD } = changes;
    const oldValue = CRX_NEW_RECORD?.oldValue as ExecuteRequestMessage;
    const newValue = CRX_NEW_RECORD?.newValue as ExecuteRequestMessage;
    if (CRX_NEW_RECORD && newValue) {
        if (oldValue === null) return;
        if (oldValue?.object?.action === ElementAction.TYPE && newValue?.object?.action === ElementAction.TYPE) {
            CRX_RECORDS.pop();
        }
        console.log(CRX_RECORDS);
        setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, [...CRX_RECORDS, CRX_NEW_RECORD.newValue]);
    }
})

const onMessageExternal = (message : CrxMessage, sender :chrome.runtime.MessageSender, sendResponse : any) => {
    if (message.receiver !== CRX_MSG_RECEIVER.SERVICE_WORKER) return;
    switch (message.command) {
        case CRX_COMMAND.CMD_CHECK_LUNATIC_MONSTER : {
            return sendResponse(true);
        }
        case CRX_COMMAND.CMD_SIGN_IN_LUNATIC_MONSTER : {
            const payload = message.payload as string
            chrome.storage.local.set({
                SantaRosalia : JSON.parse(payload)
            });
            return sendResponse(true);
            
        }
    }
    return sendResponse();
}
const openRecordingHistory = async () => {
    const tab = await createRecordingHistoryTab();
    const window = await openRecordingHistoryWindow(tab);
    crxInfo.RECORDING_HISTORY_WINDOW_ID = window.id;
}
const storageChange = (d) => {
    // console.log(d)
}

const onHighlightedTabHandler = (highlightInfo : chrome.tabs.TabHighlightInfo) => {
    if (highlightInfo.windowId !== crxInfo.RECORDING_TARGET_WINDOW_ID) return;
    onHighlightedTab(highlightInfo.windowId);
}

const onInstalled = () => {
    allTabReload();
}

chrome.runtime.onMessage.addListener(onMessage);
chrome.storage.onChanged.addListener(storageChange);

chrome.tabs.onHighlighted.addListener(onHighlightedTabHandler);
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onMessageExternal.addListener(onMessageExternal);