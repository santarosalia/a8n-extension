import { CRX_COMMAND, CRX_MSG_RECEIVER, CRX_NEW_RECORD } from "@CrxConstants";
import { EVENT } from "@CrxConstants";
import { CrxMoveTabEvent } from "@CrxClass/CrxMoveTabEvent";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

/**
 * Chrome Local Storage 에서 주어진 키들에 해당하는 값을 불러옵니다.
 *
 * @param key Storage 에서 검색할 key
 * @category Recorder
 * @example
  ```
    async () => {
        const result : any = await getItemFromLocalStorage(['key']);
    }
  ```
 */
export const getItemFromLocalStorage = (key : string[]) => {
    return chrome.storage.local.get(key);
}

/**
 * Chrome Local Storage 에서 주어진 키에 값을 저장합니다.
 *
 * @param key Storage 에 저장 할 key
 * @param value Storage 에 저장 할 value
 * @category Recorder
 * @example
  ```
    async () => {
        await setItemFromLocalStorage('key', 'value');
    }
  ```
 */
export const setItemFromLocalStorage = (key : string , value : any) => {
    const obj = {};
    obj[key] = value;
    return chrome.storage.local.set(obj);
}

/**
 * Recording History Tab 을 생성합니다
 *
 * @category Recorder
 */
export const createRecordingHistoryTab = () => {
    return chrome.tabs.create({
        url: chrome.runtime.getURL('index.html'),
        active : true
    });
}

/**
 * Recording History Window 를 생성합니다.
 *
 * @param tab window 에 연결할 Tab
 * @category Recorder
 * @example
  ```
    async () => {
        const window = await openRecordingHistoryWindow(tab);
    }
  ```
 */
export const openRecordingHistoryWindow = (tab : chrome.tabs.Tab) => {
    return chrome.windows.create({
        tabId : tab.id,
        type : "popup",
        width : 400,
        height : 600
    });
}

/**
 * Recording Target Tab 을 생성합니다.
 *
 * @param url 생성할 탭의 url
 * @category Recorder
 * @example
  ```
    async () => {
        const tab = await createRecordingTargetTab('https://naver.com');
    }
  ```
 */
export const createRecordingTargetTab = (url : string) => {
    return chrome.tabs.create({
        url: url,
        active : true
    });
}

/**
 * Recording Target Window 를 생성합니다.
 *
 * @param tab 생성 할 window 의 tab
 * @category Recorder
 * @example
  ```
    async () => {
        const window = await openRecordingTargetWindow(tab);
    }
  ```
 */
export const openRecordingTargetWindow = (tab : chrome.tabs.Tab) => {
    return chrome.windows.create({
        tabId : tab.id,
        type : 'normal',
        state : 'maximized'
    });
}

/**
 * Recording Target Window 에 메시지를 전달합니다.
 *
 * @param windowId Recording Target Window ID
 * @param command 메시지 커맨드
 * @param payload payload
 * @category Recorder
 * @example
  ```
    async () => {
        const response = await sendMessageByWindowId(16123, 'CMD_ANY_COMMAND',{data : 'a'});
    }
  ```
 */
export const sendMessageByWindowId = async (windowId : number, command : CRX_COMMAND, payload? : any) => {
    return currentWindowTabs(windowId).then(tabs => {
        if (tabs.length === 0) throw new Error("Window is Closed");
        
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                receiver : CRX_MSG_RECEIVER.BROWSER_RECORDER,
                command : command,
                payload : payload
            });
        });
    });
}

/**
 * Window 에 존재하는 Tab 배열을 반환합니다.
 *
 * @param windowId Window ID
 * @category Recorder
 * @category Controller
 * @example
  ```
    async () => {
        const tabs = await currentWindowTabs(165123);
    }
  ```
 */
export const currentWindowTabs = (windowId : number) => {
    return chrome.tabs.query({windowId : windowId});
}

/**
 * Tab 활성화를 감지하여 Move Tab 액션을 Record 합니다.
 *
 * @param windowId Window ID
 * @category Recorder
 */
export const onHighlightedTab = (windowId : number) => {
    setTimeout(() => {
        currentWindowTabs(windowId).then(tabs => {
            const activeTabIndex = tabs.find(tab => tab.active).index;
            const e = new CrxMoveTabEvent(activeTabIndex);
            setItemFromLocalStorage(CRX_NEW_RECORD, e.object);

        });
    }, 100);
}

/**
 * 프레임 초기화 액션을 반환합니다.
 * @category Recorder
 * @returns 
 */
export const resetFrame = () => {
    return {
        type : EVENT.RESETFRAME
    }
}

/**
 * frameStack 을 포함한 프레임 이동 액션을 반환합니다.
 * @param e CapturedEvent
 * @returns 
 */
export const switchFrame = (e : CrxCapturedEvent) => {
    return {
        type : EVENT.SWITCHFRAME,
        frameStack : e.frameStack.reverse()
    }
}

/**
 * Window 를 활성화 합니다
 *
 * @param windowId Window ID
 * @category Recorder
 * @example
  ```
    async () => {
        await windowFocus(165123);
    }
  ```
 */
export const windowFocus = (windowId : number) => {
    return chrome.windows.update(windowId, {focused : true});
}

/**
 * Service Worker 에 메시지를 전달합니다.
 *
 * @param cmd 메시지 커맨드
 * @param payload payload
 * @param callback callback function
 * @category Recorder
 * @example
  ```
    async () => {
        const response = await sendMessageToServicoWorker('CMD_ANY_COMMAND', {data : 'a'}, ()=>{});
    }
  ```
 */
export const sendMessageToServiceWorker = (cmd : CRX_COMMAND, payload? : any, callback? : (result : any) => any ) => {
    return chrome.runtime.sendMessage({
        receiver : CRX_MSG_RECEIVER.SERVICE_WORKER,
        command : cmd,
        payload : payload
    }).then(callback);
}

/**
 * 주어진 Window ID 에 해당하는 Window 의 활성화 된 Tab 을 이미지 캡쳐 합니다.
 *
 * @param windowId Window ID
 * @returns 이미지 data string
 * @category Recorder
 * @example
  ```
    async () => {
        const image = await captureImage(165123);
    }
  ```
 */
export const captureImage = (windowId : number) => {
    return chrome.tabs.captureVisibleTab(windowId, {format : 'png'})
}

/**
 * 이미지를 엘리먼트 크기에 맞춰 여백을 두고 편집하여 반환합니다.
 *
 * @param image 이미지
 * @param rect 엘리먼트 크기 정보
 * @category Recorder
 * @example
  ```
    async () => {
        const image = await editImage('data:example', {... left : 10, right : 50});
    }
  ```
 */
export const editImage = (image : string, rect : DOMRect) => {
    return new Promise<string>((res, rej) => {
        const img = new Image();
        img.src = image;
        img.onload = () => {
            const canvas = document.createElement('canvas');

            canvas.width = rect.width + 200;
            canvas.height = rect.height + 200;
            
            const ctx = canvas.getContext('2d'); 
            ctx.drawImage(img, rect.x - 100, rect.y - 100, rect.width + 200, rect.height + 200, 0, 0, rect.width + 200, rect.height + 200);
            res(canvas.toDataURL());
        }
    });
}

/**
 * Recording History 에 메시지를 전달합니다.
 *
 * @param windowId Recording History Window ID
 * @param command 메시지 커맨드
 * @param paylaod payload
 * @category Recorder
 * @example
  ```
    async () => {
        const response = await sendMessageToView(165123,'CMD_ANY_COMMAND', {data : 'a'});
    }
  ```
 */
export const sendMessageToView = async (command : CRX_COMMAND, payload? : any) => {
    return chrome.runtime.sendMessage({
        receiver : CRX_MSG_RECEIVER.REACT,
        command : command,
        payload : payload
    });
}

/**
 * Window ID 에 해당하는 Window를 종료합니다.
 *
 * @param windowId Window ID
 * @category Recorder
 * @example
  ```
    async () => {
        await closeWindow(165123);
    }
  ```
 */
export const closeWindow = (windowId : number) => {
    return chrome.windows.remove(windowId);
}

/**
 * Content Script 에 메시지를 전달합니다.
 *
 * @param tabId Tab ID
 * @param command 메시지 커맨드
 * @param payload payload
 * @returns response
 * @category Recorder
 * @example
  ```
    async () => {
        const response = await sendMessageToContentScript(165123, 'CMD_ANY_COMMAND', {data : 'a'});
    }
  ```
 */
export const sendMessageToContentScript = (tabId : number, command : CRX_COMMAND, payload? : any) => {
    return chrome.tabs.sendMessage(tabId, {
        receiver : CRX_MSG_RECEIVER.CONTENT_SCRIPT,
        command : command,
        payload : payload
    });
}

/**
 * Selector 에 메시지를 전달합니다.
 * 
 * @category Selector
 * @param command CRX_COMMAND
 * @param payload payload
 * @param launcherTabId WorkDesigner Tab ID
 * @returns 
 */
export const sendMessageToSelector = async (command : CRX_COMMAND, payload? : any, launcherTabId? : number) => {
    return chrome.tabs.query({}).then(tabs => {
        tabs.filter(tab => tab.id !== launcherTabId).forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                receiver : CRX_MSG_RECEIVER.BROWSER_SELECTOR,
                command : command,
                payload : payload
            });
        });
    });
}

/**
 * Toast Message Notification 을 출력합니다.
 * @param title 제목
 * @param message 메시지
 * @returns 
 */
export const showNotification = (title :string, message : string) => {
    if (!chrome.notifications) {
        return sendMessageToServiceWorker(CRX_COMMAND.CMD_SHOW_NOTIFICATION, {
            title : title,
            message : message
        });
    }
    // clear alert
    chrome.notifications.getAll(notifications => {
      Object.keys(notifications).forEach(notification => chrome.notifications.clear(notification));
    });
  
    // create alert
    chrome.notifications.create('', {
      iconUrl : 'recIcon_default64.png',
      type : 'basic',
      title : title,
      message : message
    });
  }

/**
 * 주어진 Tab ID 를 가진 탭을 활성화 합니다.
 * @category Selector
 * @param tabId 
 */
export const focusTab = (tabId : number) => {
    return chrome.tabs.update(tabId, {active : true});
}

/**
 * 모든 탭을 새로고침합니다.
 */
export const allTabReload = () => {
    chrome.tabs.query({}).then(tabs => {
        tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
        });
    });
}

/**
 * 자동화 할 윈도우를 생성합니다.
 * @category Controller
 * @returns 
 */
export const createWindow = () => {
    return chrome.windows.create({
        type : 'normal',
        url : 'https://www.google.co.in',
        state : 'maximized'
    })
}

export const openWindow = (url: string) => {
    return chrome.windows.create({
        type : 'normal',
        url : url,
        state : 'maximized'
    });
}

/**
 * 주어진 Window ID 를 가진 Window 에 메시지를 전달합니다.
 * @category Recorder
 * @param windowId 
 * @param command 
 * @param payload 
 * @returns 
 */
export const sendMessageByWindowIdToFocusedTab = async (windowId : number, command : CRX_COMMAND, payload? : any) => {
    return currentWindowTabs(windowId).then(tabs => {
        if (tabs.length === 0) throw new Error("Window is Closed");
        
        const activeTab = tabs.find(tab => tab.active);
        chrome.tabs.sendMessage(activeTab.id, {
            receiver : CRX_MSG_RECEIVER.BROWSER_CONTROLLER,
            command : command,
            payload : payload
        });

    });
}

/**
 * windowId에 해당하는 window의 index 에 해당하는 tab 배열을 반환합니다.
 *
 * @param windowId 찾을 windowId
 * @param index 찾을 index
 * @category Recorder
 * @category Controller
 * @example
  ```
    async () => {
        const [tab] = await findTabsByIndx(237824,0);
    }
  ```
 */
export const findTabsByIndex = async (windowId : number, index : number) => {
    return await chrome.tabs.query({
        windowId : windowId,
        index : index
    });
}

/**
 * Window 최대화
 * @category Controller
 * @param windowId 
 * @returns 
 */
export const maximizeWindow = (windowId : number) => {
    return chrome.windows.update(windowId, {
        state : 'maximized'
    });
}

/**
 * Window 최소화
 * @category Controller
 * @param windowId 
 * @returns 
 */
export const minimizeWindow = (windowId : number) => {
    return chrome.windows.update(windowId, {
        state : 'minimized'
    });
}

/**
 * 주어진 밀리 세컨드 만큼 대기합니다.
 * @category Controller
 * @param ms 
 * @returns 
 */
export const sleep = (ms : number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// /**
//  * 주어진 탭에 디버거가 연결 된 브라우저 인스턴스가 있는지 확인 후 인스턴스를 반환합니다.
//  * @param tab 
//  * @returns 
//  */
// export const checkDebugger = async (tab: chrome.tabs.Tab) => {
//     const [target] = (await chrome.debugger.getTargets()).filter(target => target.tabId === tab.id);

//     if (target.attached) {
//         for (const [instanceUUID, browserController] of instanceUUIDBrowserControllerMap) {
//             if (browserController.tab.id === tab.id) {
//                 return browserController.instance;
//             }
//         }
//     }
// }

/**
 * 주어진 탭의 디버거를 분리합니다.
 * @cause 디버거 기 연결 시 오류
 * @category Controller
 * @returns 
 */
export const detachDebugger = async (tab: chrome.tabs.Tab) => {
    const [target] = (await chrome.debugger.getTargets()).filter(target => target.tabId === tab.id);
    return await chrome.debugger.detach({targetId : target.id}).catch(() => {});
}
/**
 * 랜덤 UUID 를 생성하여 반환합니다. 각각의 Browser Instance | Element Instance 구별에 사용
 * @category Controller
 * @returns 
 */
export const generateUUID = () => {
    return self.crypto.randomUUID();
}

/**
 * 브라우저 살아있는지 체크
 * @param checkTab 
 * @category Controller
 * @returns 
 */
export const checkTab = async (checkTab : chrome.tabs.Tab) => {
    return (await chrome.tabs.query({})).find(tab => tab.id === checkTab.id);
}

/**
 * 윈도우 아이디로 윈도우 가져오기
 * @param windowId
 * @category Controller
 * @returns 
 */
export const getWindow = async (windowId : number) => {
    return await chrome.windows.get(windowId);
}

/**
 * 모든 탭 가져오기
 * @category Controller
 * @returns 
 */
export const getAllTabs = async () => {
    return await chrome.tabs.query({});
}

/**
 * 탭 닫기
 * @category Controller
 * @param tab 
 * @returns 
 */
export const closeTab = async (tab : chrome.tabs.Tab) => {
    return await chrome.tabs.remove(tab.id);
}

/**
 * 페이지 로딩 기다리기
 * @category Controller
 * @param tab 
 */
export const waitPageLoading = async (tab : chrome.tabs.Tab) => {
    let getTab = await chrome.tabs.get(tab.id);
    while (getTab.status === 'loading') {
        getTab = await chrome.tabs.get(tab.id);
    }
}

export const tabFocusCheck = async (windowId: number, tabId: number) => {
    const [tab] = await chrome.tabs.query({windowId : windowId, active : true});
    if (tab.id !== tabId) chrome.tabs.update(tabId, {active : true});
}