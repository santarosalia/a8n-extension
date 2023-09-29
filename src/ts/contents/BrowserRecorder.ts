import { EVENT, CRX_NEW_RECORD, CRX_MSG_RECEIVER, CRX_STATE, CRX_COMMAND } from "@CrxConstants";
import { getItemFromLocalStorage, setItemFromLocalStorage} from '@CrxApi';
import { CRX_CONTEXT_MENU_TYPE, CrxMessage } from '@CrxInterface';
import CrxHilightCSS from '@/css/CrxHighlight.css?raw'
import CrxContexMenuCSS from '@/css/CrxContextMenu.css?raw'
import { CrxClickEvent } from "@CrxClass/CrxClickEvent";
import { CrxInputEvent } from "@CrxClass/CrxInputEvent";
import { CrxSelectEvent } from "@CrxClass/CrxSelectEvent";
import { CrxKeyEvent } from "@CrxClass/CrxKeyEvent";


let browserRecorderStatus : boolean = false;

const clickEventHandler = (ev : MouseEvent) => {
    const target = ev.target as Element;
    if (isContextMenu(target)) return;

    const e = new CrxClickEvent(ev);
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

const inputEventHandler = (ev : Event) => {
    const target = ev.target as Element;
    let e : CrxInputEvent | CrxSelectEvent;
    if (target.localName === EVENT.SELECT) {
        e = new CrxSelectEvent(ev);
    } else {
        e = new CrxInputEvent(ev);
    }
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

const mouseoverEventHandler = (ev : Event) => {
    const target = ev.target as Element;
    if (isContextMenu(target)) return;
    
    target.classList.add('crx-highlight');
}

const mouseoutEventHandler = (ev : Event) => {
    const target = ev.target as Element;
    target.classList.remove('crx-highlight');
}
const keydownEventHandler = (ev : Event)=> {
    const e = new CrxKeyEvent(ev);
    if (e.key !== 'Enter') return;
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

// const contextmenuEventHandler = (ev : Event) => {
//     ev.preventDefault();
//     crxContextMenu.remove();

//     const e = new CrxClickEvent(ev);
    
//     crxContextMenu = new CrxContextMenu(e.pageX,e.pageY, e, contextMenuType);
//     document.head.after(crxContextMenu);
//     crxContextMenu.show();
// }
const isContextMenu = (target : Element) => {
    return target.closest('crx-contextmenu');
}
const browserRecorderEventHandler =  (ev : Event) => {
    
    switch (ev.type) {
        case EVENT.INPUT : {
            inputEventHandler(ev);
            break;
        }
        case EVENT.CLICK : {
            // crxContextMenu.remove();
            clickEventHandler(ev as MouseEvent);
            break;
        }
        case EVENT.MOUSEOVER : {
            mouseoverEventHandler(ev);
            return;
        }
        case EVENT.MOUSEOUT : {
            mouseoutEventHandler(ev);
            return;
        }
        case EVENT.KEYDOWN : {
            keydownEventHandler(ev);
            break;
        }
        case EVENT.CONTEXTMENU : {
            // contextmenuEventHandler(ev);
            break;
        }
        // case EVENT.MOUSEUP : {
        //     const event = ev as MouseEvent;
        //     if (event.button === 2) {
        //         ev.preventDefault();
        //         ev.stopPropagation();
        //     }
        //     break
        // }
        // case EVENT.MOUSEDOWN : {
        //     const event = ev as MouseEvent;
        //     if (event.button === 2) {
        //         ev.preventDefault();
        //         ev.stopPropagation();
        //     }
        //     break
        // }
    }
}

const browserRecorderStart = () => {
    window.addEventListener(EVENT.CLICK, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.CONTEXTMENU, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.SCROLL, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.INPUT, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.WHEEL, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEOVER, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEOUT, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.KEYDOWN, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEUP, browserRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEDOWN, browserRecorderEventHandler, true);
}

const browserRecorderEnd = () => {
    window.removeEventListener(EVENT.CLICK, browserRecorderEventHandler);
    window.removeEventListener(EVENT.SCROLL, browserRecorderEventHandler);
    window.removeEventListener(EVENT.INPUT, browserRecorderEventHandler);
    window.removeEventListener(EVENT.SELECT, browserRecorderEventHandler);
    window.removeEventListener(EVENT.WHEEL, browserRecorderEventHandler);
    window.removeEventListener(EVENT.MOUSEUP, browserRecorderEventHandler);
    window.removeEventListener(EVENT.MOUSEDOWN, browserRecorderEventHandler);
}

export const browserRecorder = (request : CrxMessage) => {
    if (request.receiver !== CRX_MSG_RECEIVER.BROWSER_RECORDER) return;
    switch (request.command) {
        
        case CRX_COMMAND.CMD_RECORDING_START : {
            if (browserRecorderStatus) return;
            browserRecorderStart();
            const crxHighlightStyle = document.createElement('style');
            crxHighlightStyle.innerHTML = CrxHilightCSS;
            document.head.appendChild(crxHighlightStyle);
            
            const crxContextMenuStyle = document.createElement('style');
            crxContextMenuStyle.innerHTML = CrxContexMenuCSS;
            document.head.appendChild(crxContextMenuStyle);

            browserRecorderStatus = true;
            break;
        }
        case CRX_COMMAND.CMD_RECORDING_END : {
            browserRecorderEnd();
            break;
        }
    }
}