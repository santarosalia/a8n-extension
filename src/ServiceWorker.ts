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
import { CrxPopupEvent } from "@CrxClass/CrxPopupEvent";
import { test } from "./ts/api/CrxPuppeteerTest";
import { instanceUUIDBrowserControllerMap } from "@/ts/store/CrxStore";
import { Executor } from "./ts/class/Executor";
import { axios, getAccessToken } from "./ts/api/Axios";


const crxInfo = new CrxInfo();
console.log('%c ______'+'%c       ___'+'%c     _______'+'%c    ________  ','color:red','color:orange','color:yellow','color:green')
console.log("%c|_   _ `."+"%c   .'   `."+"%c  |_   __ \\"+"%c  |_   __  | ",'color:red','color:orange','color:yellow','color:green')
console.log('%c  | | `. \\'+'%c /  .-.  \\'+'%c   | |__) |   '+'%c| |_ \\_| ','color:red','color:orange','color:yellow','color:green')
console.log('%c  | |  | |'+'%c | |   | |'+'%c   |  ___/'+'%c    |  _| _  ','color:red','color:orange','color:yellow','color:green')
console.log("%c _| |_.' / "+"%c\\  `-'  /"+"%c  _| |_    "+"%c  _| |__/ | ",'color:red','color:orange','color:yellow','color:green')
console.log("%c|______.' "+"%c  `.___.' "+"%c |_____|   "+"%c |________| ",'color:red','color:orange','color:yellow','color:green')

const initBrowserRecorder = (url : string) => {
    const e = new CrxBrowserOpenEvent(url);
    setItemFromLocalStorage(CRX_NEW_RECORD, null);
    setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, [e]);
    setItemFromLocalStorage(CRX_ADD_SCRAPING_DATA, null);
    setItemFromLocalStorage(CRX_STATE.CRX_SCRAPING_DATAS, {
        exceptRow : [],
        data : []
    });
    
    createRecordingTargetTab(url).then(result => {
        openRecordingTargetWindow(result).then(result => {
            [crxInfo.TARGET_TAB] = result.tabs;
            crxInfo.RECORDING_TARGET_WINDOW_ID = crxInfo.TARGET_TAB.windowId;
        });
    });

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
            closeWindow(crxInfo.RECORDING_TARGET_WINDOW_ID);
            closeWindow(crxInfo.RECORDING_HISTORY_WINDOW_ID);
            break;
        }
        case CRX_COMMAND.CMD_SHOW_NOTIFICATION : {
            showNotification(message.payload.title,message.payload.message);
            break;
        }
        case CRX_COMMAND.CMD_START_PROCESS : {
            const { user } = await chrome.storage.local.get('user');
            const result = await fetch(import.meta.env.VITE_BACK_END + 'api/process', {
                method : 'POST',
                headers : {
                    Authorization : await getAccessToken()
                },
                body : JSON.stringify({
                    id : 'clmp4qmap0000r3weime3jbet',
                    userId : user.id
                })

            })
            const body = await result.json();
            const data = JSON.parse(body.data);
            new Executor(data);
            // new Executor([
            //     {
            //         object : {
            //             action : BrowserAction.CREATE,
            //             parameter : {
            //                 url : 'https://naver.com'
            //             }
                        
            //         }
            //     }, {
            //         object : {
            //             action : BrowserAction.GO_TO,
            //             parameter : {
            //                 url : 'https://daum.net'
            //             }
            //         }
            //     }
            // ]);
        }
        
        
    }
}

const onMessageExternal = (message : CrxMessage, sender :chrome.runtime.MessageSender, sendResponse : any) => {
    if (message.receiver !== CRX_MSG_RECEIVER.SERVICE_WORKER) return;
    switch (message.command) {
        case CRX_COMMAND.CMD_LAUNCH_BROWSER_RECORDER : {
            crxInfo.LAUNCHER_TAB_ID = sender.tab.id;
            crxInfo.LAUNCHER_WINDOW_ID = sender.tab.windowId;
            
            initBrowserRecorder(message.payload.url);
            const injectInterval = setInterval(() => {
                // if(crxInfo.RECORDING_TARGET_WINDOW_ID === undefined) clearInterval(injectInterval);
                sendMessageByWindowId(crxInfo.RECORDING_TARGET_WINDOW_ID, CRX_COMMAND.CMD_RECORDING_START).catch((e) => {
                    //레코딩 창 닫힌 경우!
                    clearInterval(injectInterval);
                });
            },1000);
            break;
        }
    }
    sendResponse({});
    return;
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

let browserController : BrowserController;

const execute = async (msg : ExecuteRequestMessage) => {
    let responseMessage : ExecuteResponseMessage;

    try {
        const isElement = Object.values(ElementAction).includes(msg.object.action as any);
        const isWait = msg.object.action === BrowserAction.WAIT;
        await pickBrowserControllerMap();
        // connect || else 나눠야할듯?
        if (msg.object.instanceUUID) {
            if (isElement) {
                browserController = Array.from(instanceUUIDBrowserControllerMap.values()).find(browserController => browserController.instanceUUIDElementControllerMap.has(msg.object.instanceUUID));
            } else {
                browserController = instanceUUIDBrowserControllerMap.get(msg.object.instanceUUID);
            }
            if (!browserController) throw new Error('Target Lost');
        } else {
            browserController = new BrowserController();
            instanceUUIDBrowserControllerMap.set(browserController.instanceUUID, browserController);
        }
        const result = await browserController.execute(msg);
        instanceUUIDBrowserControllerMap.set(browserController.instanceUUID, browserController);

        responseMessage = {
            responseInfo : {
                result : Status.SUCCESS,
            },
            object : {
                textContent : result ? result.textContent : null,
                propertyValue : result ? result.propertyValue : null,
                x : result ? result.x : null,
                y : result ? result.y : null,
                width : result ? result.width : null,
                height : result ? result.height : null,
                exists : result ? result.exists : null,
                tagName : result ? result.tagName : null,
                image : result ? result.image : null,
                scrapedData : result ? result.scrapedData : null,
                elements : result ? result.elements : null,
                instanceUUID : isWait ? result.instanceUUID : browserController.instanceUUID,
                evaluateResult : result ? result.evaluateResult : null,
                outerHTML : result ? result.outerHTML : null
            }
        }
    } catch (e : any) {
        responseMessage = {
            responseInfo : {
                result : Status.ERROR,
                errorMessage : e.message
            }
        }
    }
    return responseMessage;
}

/**
 * 브라우저 살아있는거만 솎아내서 반환
 * @param browserControllerArray 
 * @returns 
 */
const pickBrowserControllerMap = async () => {
    for (const [instanceUUID, browserController] of instanceUUIDBrowserControllerMap) {
        if (browserController.tab === undefined) {
            instanceUUIDBrowserControllerMap.delete(instanceUUID);
            continue;
        }
        const check = await checkTab(browserController.tab);
        if (!check) instanceUUIDBrowserControllerMap.delete(instanceUUID);
    }
}

// chrome.action.onClicked.addListener(test);