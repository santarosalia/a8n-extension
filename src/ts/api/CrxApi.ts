import { CRX_MSG_RECEIVER, CRX_NEW_RECORD } from "@CrxConstants";
import { CRX_RECORDS, EVENT } from "@CrxConstants";
import { CapturedEvent, CrxMoveTabEvent } from "@CrxClass";
import { CRX_COMMAND } from '@CrxInterface'

export const getItemFromLocalStorage = (key : string[]) => {
    return chrome.storage.local.get(key);
}

export const setItemFromLocalStorage = (key :string , value : any) => {
    const obj = {};
    obj[key] = value;
    return chrome.storage.local.set(obj);
}

export const createViewTab = () => {
    return chrome.tabs.create({
        url: chrome.runtime.getURL('index.html'),
        active : true
    });
}

export const openViewWindow = (tab : chrome.tabs.Tab) => {
    return chrome.windows.create({
        tabId : tab.id,
        type : "popup",
        width : 400,
        height : 600
    });
}

export const createRecordingTargetTab = () => {
    return chrome.tabs.create({
        url: 'https://www.naver.com',
        active : true
    });
}

export const openRecordingTargetWindow = (tab : chrome.tabs.Tab) => {
    return chrome.windows.create({
        tabId : tab.id,
        type : 'normal',
        state : 'maximized'
    });
}

export const sendMessageByWindowId = async (windowId : number, command :string) => {
    return chrome.tabs.query({windowId : windowId}).then(tabs => {
        if (tabs.length === 0) throw new Error("Window is Closed");
        
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                receiver : CRX_MSG_RECEIVER.WEB_RECORDER,
                command : command
            });
        });
    });
}

export const currentWindowTabs = (windowId : number) => {
    return chrome.tabs.query({windowId : windowId});
}

export const onHighlightedTab = (windowId : number) => {
    setTimeout(() => {
        currentWindowTabs(windowId).then(tabs => {
            const activeTabIndex = tabs.find(tab => tab.active).index;
            const e = new CrxMoveTabEvent(activeTabIndex);
            setItemFromLocalStorage(CRX_NEW_RECORD, e);

        });
    }, 100);
}

export const switchFrame = (e : CapturedEvent) => {
    return {
        type : EVENT.SWITCHFRAME,
        frameStack : e.frameStack
    }
}

export const windowFocus = (windowId : number) => {
    return chrome.windows.update(windowId, {focused : true});
}

export const sendMessageToServiceWorker = (cmd : CRX_COMMAND, payload? : any, callback? : (result : any) => any ) => {
    console.log(CRX_COMMAND.CMD_RECORDING_END)
    return chrome.runtime.sendMessage({
        receiver : CRX_MSG_RECEIVER.SERVICE_WORKER,
        command : cmd,
        payload : payload
    }).then(callback);
}

export const captureImage = (windowId : number) => {
    return chrome.tabs.captureVisibleTab(windowId, {format : 'png'})
}

export const editImage = (image : string, rect : DOMRect) => {
    return new Promise<string>((res, rej) => {
        const img = new Image();
        img.src = image;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');

            canvas.width = rect.width+40;
            canvas.height = rect.height+40;
            
            const ctx = canvas.getContext('2d'); 
            ctx.drawImage(img,rect.x-20,rect.y-20,rect.width+40,rect.height+40,0,0,rect.width+40,rect.height+40);
            res(canvas.toDataURL());

        }
        
    });

        




}
