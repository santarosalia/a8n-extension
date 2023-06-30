import { CrxInfo, CrxBrowserOpenEvent, CrxPopupEvent } from "@CrxClass";
import { setItemFromLocalStorage,
    createViewTab,
    openViewWindow,
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
    sendMessageByWindowIdToFocusedTab,
    detachDebugger
} from "@CrxApi";
import { CRX_ADD_SCRAPING_DATA, CRX_MSG_RECEIVER, CRX_NEW_RECORD, CRX_STATE, EVENT} from "@CrxConstants";
import { CrxMessage, CRX_COMMAND } from "@CrxInterface";
import {BrowserAction, BrowserController, BrowserType, ElementAction, LocatorType, RequestMessage, ResponseMessage, Status } from "@/ts/class/CrxWebController";


const crxInfo = new CrxInfo();
console.log('%c ______'+'%c       ___'+'%c     _______'+'%c    ________  ','color:red','color:orange','color:yellow','color:green')
console.log("%c|_   _ `."+"%c   .'   `."+"%c  |_   __ \\"+"%c  |_   __  | ",'color:red','color:orange','color:yellow','color:green')
console.log('%c  | | `. \\'+'%c /  .-.  \\'+'%c   | |__) |   '+'%c| |_ \\_| ','color:red','color:orange','color:yellow','color:green')
console.log('%c  | |  | |'+'%c | |   | |'+'%c   |  ___/'+'%c    |  _| _  ','color:red','color:orange','color:yellow','color:green')
console.log("%c _| |_.' / "+"%c\\  `-'  /"+"%c  _| |_    "+"%c  _| |__/ | ",'color:red','color:orange','color:yellow','color:green')
console.log("%c|______.' "+"%c  `.___.' "+"%c |_____|   "+"%c |________| ",'color:red','color:orange','color:yellow','color:green')

const initWebRecorder = (url : string) => {
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
            crxInfo.TARGET_TAB = result.tabs[0];
            crxInfo.RECORDING_TARGET_WINDOW_ID = result.tabs[0].windowId;
        });
    });

    openView();
}

export const onMessage = (message : CrxMessage, sender : chrome.runtime.MessageSender , sendResponse : any) => {
    if (message.receiver !== CRX_MSG_RECEIVER.SERVICE_WORKER) return;
    const COMMAND = message.command;
    switch (COMMAND) {
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
        case CRX_COMMAND.CMD_OPEN_VIEW : {
            sendMessageByWindowId(crxInfo.VIEW_WINDOW_ID, CRX_COMMAND.NONE).then(() => {
                windowFocus(crxInfo.VIEW_WINDOW_ID);
            }).catch(() => {
                openView();
            });
            
            break;
        }
        case CRX_COMMAND.CMD_CONTEXT_MENU_CHANGE : {
            sendMessageByWindowId(crxInfo.RECORDING_TARGET_WINDOW_ID, CRX_COMMAND.CMD_CONTEXT_MENU_CHANGE, message.payload);
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
        case CRX_COMMAND.CMD_RECORDING_END : {
            sendMessageToContentScript(crxInfo.LAUNCHER_TAB_ID, CRX_COMMAND.CMD_CREATE_ACTIVITY);
            closeWindow(crxInfo.RECORDING_TARGET_WINDOW_ID);
            closeWindow(crxInfo.VIEW_WINDOW_ID);
            break;
        }
        case CRX_COMMAND.CMD_SELECTOR_END : {
            clearInterval(crxInfo.SELECTOR_INJECT_INTERVAL);
            sendMessageToContentScript(crxInfo.LAUNCHER_TAB_ID,CRX_COMMAND.CMD_SEND_LOCATORS, message.payload.locators);
            sendMessageToSelector(CRX_COMMAND.CMD_SELECTOR_END);
            focusTab(crxInfo.LAUNCHER_TAB_ID)
            break;
        }
        case CRX_COMMAND.CMD_SHOW_NOTIFICATION : {
            showNotification(message.payload.title,message.payload.message);
            break;
        }
        
        
    }
}

const onMessageExternal = (message : CrxMessage, sender :chrome.runtime.MessageSender, sendResponse : any) => {
    if (message.receiver !== CRX_MSG_RECEIVER.SERVICE_WORKER) return;
    switch (message.command) {
        case CRX_COMMAND.CMD_LAUNCH_WEB_RECORDER : {
            crxInfo.LAUNCHER_TAB_ID = sender.tab.id;
            crxInfo.LAUNCHER_WINDOW_ID = sender.tab.windowId;
            
            initWebRecorder(message.payload);
            const injectInterval = setInterval(() => {
                // if(crxInfo.RECORDING_TARGET_WINDOW_ID === undefined) clearInterval(injectInterval);
                sendMessageByWindowId(crxInfo.RECORDING_TARGET_WINDOW_ID, CRX_COMMAND.CMD_RECORDING_START).catch((e) => {
                    //레코딩 창 닫힌 경우!
                    clearInterval(injectInterval);
                });
            },1000);
            break;
        }
        case CRX_COMMAND.CMD_LAUNCH_WEB_SELECTOR : {
            crxInfo.LAUNCHER_TAB_ID = sender.tab.id;
            crxInfo.LAUNCHER_WINDOW_ID = sender.tab.windowId;
            
            const injectInterval = setInterval(() => {
                sendMessageToSelector(CRX_COMMAND.CMD_SELECTOR_START, null, crxInfo.LAUNCHER_TAB_ID);
            },1000);

            crxInfo.SELECTOR_INJECT_INTERVAL = injectInterval;
            sendResponse({started : true});
            break;
        }
        case CRX_COMMAND.CMD_KILL_WEB_SELECTOR : {
            clearInterval(crxInfo.SELECTOR_INJECT_INTERVAL);
            sendMessageToSelector(CRX_COMMAND.CMD_SELECTOR_END);
            break;
        }
        case CRX_COMMAND.CMD_WEB_CONTROL : {
            
        }
    }
    sendResponse({});
    return;
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
    if (highlightInfo.windowId !== crxInfo.RECORDING_TARGET_WINDOW_ID) return;
    onHighlightedTab(highlightInfo.windowId);
}

const onCreated = (window : chrome.windows.Window)=> {
    if (window.id === crxInfo.VIEW_WINDOW_ID || window.type !== 'popup') return;
    const e = new CrxPopupEvent();
    setTimeout(() => {
        setItemFromLocalStorage(CRX_NEW_RECORD, e);
        sendMessageByWindowId(window.id, CRX_COMMAND.CMD_RECORDING_START)
    }, 500);
}

const onInstalled = () => {
    allTabReload();
}

chrome.runtime.onMessage.addListener(onMessage);
chrome.storage.onChanged.addListener(storageChange);

chrome.tabs.onHighlighted.addListener(onHighlightedTabHandler);
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onMessageExternal.addListener(onMessageExternal);

// Native Messaging
var port = chrome.runtime.connectNative('worktronics.browser_automation.chrome');

port.onMessage.addListener(async (msg : RequestMessage) => {
    //console.log(msg);
    //const msg : RequestMessage = JSON.parse(message)
    console.log('^^^^^^^^^^^^^^^^Request^^^^^^^^^^^^^^^^')
    console.log(msg)
    console.log('vvvvvvvvvvvvvvvvRequestvvvvvvvvvvvvvvvv')
    const responseMessage = await execute(msg as RequestMessage);
    console.log('^^^^^^^^^^^^^^^^Response^^^^^^^^^^^^^^^^')
    console.log(responseMessage)
    console.log('vvvvvvvvvvvvvvvvResponsevvvvvvvvvvvvvvvv')
    port.postMessage(responseMessage);
});
port.onDisconnect.addListener(() => {
    console.log('Native Messaging Disconnected');
    // reConnect();
});

const reConnect = () => {
    port = chrome.runtime.connectNative('crx');
    console.log('Native Messaging Connected');
    port.onDisconnect.addListener(() => {
        console.log('Native Messaging Disconnected');
        reConnect();
    })
}

let browserControllerArray : BrowserController[] = [];
let browserController : BrowserController;

const execute = async (msg : RequestMessage) => {
    const isElement = Object.values(ElementAction).includes(msg.object.action as any);
    const isElementInstance = msg.object.action === BrowserAction.WAIT;

    if (msg.object.instanceUUID) {
        if (isElement) {
            browserController = browserControllerArray.find(browserController => browserController.elementControllerArray.find(elementController => elementController.instanceUUID === msg.object.instanceUUID));
        } else {
            browserController = browserControllerArray.find(browserController => browserController.instanceUUID === msg.object.instanceUUID);
        }
        if (!browserController) throw new Error('It is not browser instance');
    } else {
        browserController = new BrowserController();
        browserControllerArray.push(browserController);
    }

    // if (!!!msg.object.parameter.browserType) {
    //     console.log(browserController.getBrowserType);
    //     if (browserController.getBrowserType !== msg.object.parameter.browserType) return;
    // } else {
    //     const browserType = self.navigator.userAgent.indexOf('Edg') > -1 ? BrowserType.EDGE : BrowserType.CHROME;
    //     if (browserType !== msg.object.parameter.browserType) return;
    // }
        
    let responseMessage : ResponseMessage;
    try {
        const result = await browserController.execute(msg);
        
        responseMessage = {
            command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTIVITY,
            tranId : msg.tranId,
            result : Status.SUCCESS,
            object : {
                textContent : result ? result.textContent : null,
                propertyValue : result ? result.propertyValue : null,
                boundingBox : result ? result.boundingBox : null,
                exists : result ? result.exists : null,
                tagName : result ? result.tagName : null,
                instanceUUID : isElementInstance ? browserController.elementControllerArray[browserController.elementControllerArray.length - 1].instanceUUID : browserController.instanceUUID
            }
        }
    } catch (e : any) {
        responseMessage = {
            command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTIVITY,
            tranId : msg.tranId,
            result : Status.ERROR,
            errorMessage : e.message
        }
    }
    return responseMessage;
}
