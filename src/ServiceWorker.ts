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
    sendMessageByWindowIdToFocusedTab
} from "@CrxApi";
import { CRX_ADD_SCRAPING_DATA, CRX_MSG_RECEIVER, CRX_NEW_RECORD, CRX_STATE, EVENT} from "@CrxConstants";
import { CrxMessage, CRX_COMMAND } from "@CrxInterface";
import {BrowserAction, BrowserController, ElementAction, LocatorType, RequestMessage, Type } from "@/ts/class/CrxWebController";


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
// var port = chrome.runtime.connectNative('crx');

// port.onMessage.addListener((message : CrxMessage) => {
//     const window = this as Window;
//     if (window.navigator.userAgent.indexOf('Edg') > -1) {
//         //edge 일 때 브라우저 edge 아니면 리턴
//         if (message.payload.browser !== 'Edge') return;
//     } else {
//         // chrome 일 때 크롬 아니면 리턴
//         if (message.payload.browser !== 'Chrome') return;
//     }

//     switch (message.command) {
//         case CRX_COMMAND.CMD_OPEN_BROWSER : {
            

//             createWindow().then(window => {
//                 crxInfo.CONTROLLER_WINDOW_ID = window.id;
//             });

//             break;
//         }
//         case CRX_COMMAND.CMD_WEB_CONTROL : {
//             sendMessageByWindowIdToFocusedTab(crxInfo.CONTROLLER_WINDOW_ID, CRX_COMMAND.CMD_WEB_CONTROL, message.payload);
//             break;
//         }
//     }
// });

// port.onDisconnect.addListener(()=>{
//     console.log('discon')
//     // port = chrome.runtime.connectNative('crx');
// })

// chrome.action.onClicked.addListener(()=>{
//     console.log("Sending:  start");

//     port.postMessage("start");
// })

// chrome.tabs.create(
//     {
//         active: true,
//         url: 'https://www.google.co.in',
//     },
//     tab => (tab.id ? run(tab.id) : null)
// )
const browserControllerArray : BrowserController[] = [];
let browserController : BrowserController;
chrome.action.onClicked.addListener(async () => {
    console.log("Sending:  start");
    //     const msgarr : RequestMessage[] = [
    //     {
    //         type : Type.BROWSER,
    //         action : BrowserAction.OPEN,
    //         parameter : {
    //             timeout : 1000,
    //             url : 'https://naver.com'
    //         },
    //         returnVariable : 'browser1'
    //     },
    //     {
    //         targetVariable : 'browser1',
    //         type : Type.ELEMENT,
    //         action : ElementAction.TYPE,
    //         parameter : {
    //             timeout : 1000,
    //             locatorType : LocatorType.CSSSELECTOR,
    //             locator : '#query',
    //             value : 'abcde'
    //         },
    //     },
    //     {
    //         targetVariable : 'browser1',
    //         type : Type.ELEMENT,
    //         action : ElementAction.WAIT,
    //         parameter : {
    //             timeout : 1000,
    //             locatorType : LocatorType.CSSSELECTOR,
    //             locator : '#special-input-logo > a.link_naver.type_motion_n.is_fadein > span.blind'
    //         },
    //         returnVariable : 'element31'
    //     },
    //     {
    //         targetVariable : 'element31',
    //         type : Type.ELEMENT,
    //         action : ElementAction.READ,
    //         parameter : {
    //             timeout : 1000,
    //             locatorType : LocatorType.CSSSELECTOR,
    //             locator : '#special-input-logo > a.link_naver.type_motion_n.is_fadein > span.blind'
    //         },
    //         returnVariable : 'element31'
    //     },
    //     {
    //         targetVariable : 'browser1',
    //         type : Type.ELEMENT,
    //         action : ElementAction.READ,
    //         parameter : {
    //             timeout : 1000,
    //             locatorType : LocatorType.XPATH,
    //             locator : '//*[@id="shortcutArea"]/ul/li[1]/a/span[2]'
    //         },
    //         returnVariable : 'element20'
    //     },
    //     {
    //         targetVariable : 'browser1',
    //         type : Type.BROWSER,
    //         action : BrowserAction.CLOSE,
    //         parameter : {
    //             timeout : 1000,
    //         }
    //     }
    // ]

    const msgarr : RequestMessage[] = [
        {
            type : Type.BROWSER,
            action : BrowserAction.OPEN,
            parameter : {
                timeout : 1000,
                url : 'https://www.11st.co.kr/'
            },
            returnVariable : 'browser1'
        },
        {
            targetVariable : 'browser1',
            type : Type.ELEMENT,
            action : ElementAction.CLICK,
            parameter : {
                timeout : 1000,
                locatorType : LocatorType.CSS_SELECTOR,
                locator : '#gnb > div > div.b_header_gnb.b_header_gnb_logoday > div > div.c_gnb_button_category > button',
            },
        },
        {
            targetVariable : 'browser1',
            type : Type.ELEMENT,
            action : ElementAction.GET_PROPERTY,
            parameter : {
                timeout : 1000,
                locatorType : LocatorType.CSS_SELECTOR,
                locator : '#gnbCategory > div > div.inner > div:nth-child(3) > nav > ul > li.brand > a',
                value : 'href'
            },
        },
    ]

    // const msgarr : RequestMessage[] = [
    //     {
    //         type : Type.BROWSER,
    //         action : BrowserAction.OPEN,
    //         parameter : {
    //             timeout : 1000,
    //             url : 'https://www.g2b.go.kr/pt/menu/selectSubFrame.do?framesrc=/pt/menu/frameTgong.do?url=https://www.g2b.go.kr:8101/ep/tbid/tbidList.do?taskClCds=&bidNm=&searchDtType=1&fromBidDt=2023/04/22&toBidDt=2023/05/22&fromOpenBidDt=&toOpenBidDt=&radOrgan=1&instNm=&area=&regYn=Y&bidSearchType=1&searchType=1'
    //         },
    //         returnVariable : 'browser1'
    //     },
    //     {
    //         targetVariable : 'browser1',
    //         type : Type.BROWSER,
    //         action : BrowserAction.FRAME,
    //         parameter : {
    //             timeout : 1000,
    //             frameName : 'sub'
    //         }
    //     },
    //     {
    //         targetVariable : 'browser1',
    //         type : Type.BROWSER,
    //         action : BrowserAction.FRAME,
    //         parameter : {
    //             timeout : 1000,
    //             frameName : 'main'
    //         }
    //     }
    // ]


    for (let msg of msgarr) {
        const result = await run(msg).then();
        await sleep(2000);
        console.log(result)
    }
});

const run = async (msg : RequestMessage) => {
        if (msg.targetVariable) {
            browserController = browserControllerArray.find(browserController => browserController.getVariable === msg.targetVariable);
        } else {
            browserController = new BrowserController();
            browserControllerArray.push(browserController);
        }

        if (!browserController) {
            browserController = browserControllerArray.find(browserController => browserController.getElementControllerArray.find(elementController => elementController.variable === msg.targetVariable));
        }
        //message receive
        const result = await browserController.execute(msg);
        return result;
}

const sleep = (ms : number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
