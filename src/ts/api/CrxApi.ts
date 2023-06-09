import { CRX_MSG_RECEIVER, CRX_NEW_RECORD } from "@CrxConstants";
import { EVENT } from "@CrxConstants";
import { CapturedEvent, CrxMoveTabEvent } from "@CrxClass";
import { CRX_COMMAND, CrxMessage } from '@CrxInterface'

/**
 * Chrome Local Storage 에서 주어진 키들에 해당하는 값을 불러옵니다.
 *
 * @param key Storage 에서 검색할 key
 * @category Chrome Api
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
 * @category Chrome Api
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
 * @category Chrome Api
 */
export const createViewTab = () => {
    return chrome.tabs.create({
        url: chrome.runtime.getURL('index.html'),
        active : true
    });
}

/**
 * Recording History Window 를 생성합니다.
 *
 * @param tab window 에 연결할 Tab
 * @category Chrome Api
 * @example
  ```
    async () => {
        const window = await openViewWindow(tab);
    }
  ```
 */
export const openViewWindow = (tab : chrome.tabs.Tab) => {
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
 * @category Chrome Api
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
 * @category Chrome Api
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
 * @category Chrome Api
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
                receiver : CRX_MSG_RECEIVER.WEB_RECORDER,
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
 * @category Chrome Api
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
 * @category Chrome Api
 */
export const onHighlightedTab = (windowId : number) => {
    setTimeout(() => {
        currentWindowTabs(windowId).then(tabs => {
            const activeTabIndex = tabs.find(tab => tab.active).index;
            const e = new CrxMoveTabEvent(activeTabIndex);
            setItemFromLocalStorage(CRX_NEW_RECORD, e);

        });
    }, 100);
}

export const resetFrame = () => {
    return {
        type : EVENT.RESETFRAME
    }
}

export const switchFrame = (e : CapturedEvent) => {
    return {
        type : EVENT.SWITCHFRAME,
        frameStack : e.frameStack.reverse()
    }
}

/**
 * Window 를 활성화 합니다
 *
 * @param windowId Window ID
 * @category Chrome Api
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
 * @category Chrome Api
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
 * @category Chrome Api
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
 * @category Chrome Api
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
 * @category Chrome Api
 * @example
  ```
    async () => {
        const response = await sendMessageToView(165123,'CMD_ANY_COMMAND', {data : 'a'});
    }
  ```
 */
export const sendMessageToView = async (windowId : number, command : CRX_COMMAND, payload? : any) => {
    return currentWindowTabs(windowId).then(tabs => {
        if (tabs.length === 0) throw new Error("Window is Closed");
        
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                receiver : CRX_MSG_RECEIVER.VIEW,
                command : command,
                payload : payload
            });
        });
    });
}

/**
 * Window ID 에 해당하는 Window를 종료합니다.
 *
 * @param windowId Window ID
 * @category Chrome Api
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
 * @category Chrome Api
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

export const sendMessageToSelector = async (command : CRX_COMMAND, payload? : any, launcherTabId? : number) => {
    return chrome.tabs.query({}).then(tabs => {
        tabs.filter(tab => tab.id !== launcherTabId).forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                receiver : CRX_MSG_RECEIVER.WEB_SELECTOR,
                command : command,
                payload : payload
            });
        });
    });
}

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

export const focusTab = (tabId : number) => {
    chrome.tabs.update(tabId, {active : true});
}

export const allTabReload = () => {
    chrome.tabs.query({}).then(tabs => {
        tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
        });
    });
}

export const createWindow = () => {
    return chrome.windows.create({
        type : 'normal',
        url : 'https://www.google.co.in',
        state : 'maximized'
    })
}


export const sendMessageByWindowIdToFocusedTab = async (windowId : number, command : CRX_COMMAND, payload? : any) => {
    return currentWindowTabs(windowId).then(tabs => {
        if (tabs.length === 0) throw new Error("Window is Closed");
        
        const activeTab = tabs.find(tab => tab.active);
        chrome.tabs.sendMessage(activeTab.id, {
            receiver : CRX_MSG_RECEIVER.WEB_CONTROLLER,
            command : command,
            payload : payload
        });

    });
}
/**
 * 모든 탭에서 주어진 title 에 해당하는 tab 배열을 반환합니다.
 *
 * @param title 찾을 title
 * @category Chrome Api
 * @example
  ```
    async () => {
        const [tab] = await findTabsByTitle('네이버');
    }
  ```
 */
export const findTabsByTitle = async (title : string) => {
    return await chrome.tabs.query({}).then(tabs => {
        return tabs.filter(tab => tab.title.includes(title));
    });
}

/**
 * windowId에 해당하는 window의 index 에 해당하는 tab 배열을 반환합니다.
 *
 * @param windowId 찾을 windowId
 * @param index 찾을 index
 * @category Chrome Api
 * @example
  ```
    async () => {
        const [tab] = await findTabsByIndx(237824,0);
    }
  ```
 */
export const findTabsByIndex = (windowId : number, index : number) => {
    return chrome.tabs.query({
        windowId : windowId,
        index : index
    });
}

/**
 * 모든 탭에서 주어진 url을 찾아 tab 배열을 반환합니다.
 *
 * @param url 찾을 url
 * @category Chrome Api
 * @example
  ```
    async () => {
        const [tab] = await findTabsByUrl('https://naver.com');   
    }
  ```
 */
export const findTabsByUrl = (url : string) => {
    return chrome.tabs.query({
        url : url
    });
}

export const maximizeWindow = (windowId : number) => {
    return chrome.windows.update(windowId, {
        state : 'maximized'
    });
}

export const minimizeWindow = (windowId : number) => {
    return chrome.windows.update(windowId, {
        state : 'minimized'
    });
}