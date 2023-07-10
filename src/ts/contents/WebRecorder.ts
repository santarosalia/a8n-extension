import { EVENT, CRX_NEW_RECORD, CRX_MSG_RECEIVER, CRX_STATE, CRX_COMMAND } from "@CrxConstants";
import { setItemFromLocalStorage} from '@CrxApi';
import CrxContextMenu from '@CrxClass/CrxContextMenu';
import { CRX_CONTEXT_MENU_TYPE, CrxMessage } from '@CrxInterface';
import CrxHilightCSS from '@/css/CrxHighlight.css?raw'
import CrxContexMenuCSS from '@/css/CrxContextMenu.css?raw'
import { CrxClickEvent } from "@CrxClass/CrxClickEvent";
import { CrxInputEvent } from "@CrxClass/CrxInputEvent";
import { CrxSelectEvent } from "@CrxClass/CrxSelectEvent";
import { CrxKeyEvent } from "@CrxClass/CrxKeyEvent";

window.customElements.define('crx-contextmenu', CrxContextMenu);

let contextMenuType = CRX_CONTEXT_MENU_TYPE.NORMAL;
let crxContextMenu = new CrxContextMenu(0, 0, null, contextMenuType);
let webRecorderStatus : boolean = false;

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

const contextmenuEventHandler = (ev : Event) => {
    ev.preventDefault();
    crxContextMenu.remove();

    const e = new CrxClickEvent(ev);
    
    crxContextMenu = new CrxContextMenu(e.pageX,e.pageY, e, contextMenuType);
    document.head.after(crxContextMenu);
    crxContextMenu.show();
}
const isContextMenu = (target : Element) => {
    return target.closest('crx-contextmenu');
}
const WebRecorderEventHandler =  (ev : Event) => {
    
    switch (ev.type) {
        case EVENT.INPUT : {
            inputEventHandler(ev);
            break;
        }
        case EVENT.CLICK : {
            crxContextMenu.remove();
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
            contextmenuEventHandler(ev);
            break;
        }
        case EVENT.MOUSEUP : {
            const event = ev as MouseEvent;
            if (event.button === 2) {
                ev.preventDefault();
                ev.stopPropagation();
            }
            break
        }
        case EVENT.MOUSEDOWN : {
            const event = ev as MouseEvent;
            if (event.button === 2) {
                ev.preventDefault();
                ev.stopPropagation();
            }
            break
        }
    }
}

const webRecorderStart = () => {
    window.addEventListener(EVENT.CLICK, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.CONTEXTMENU, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.SCROLL, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.INPUT, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.WHEEL, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEOVER, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEOUT, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.KEYDOWN, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEUP, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEDOWN, WebRecorderEventHandler, true);
}

const webRecorderEnd = () => {
    window.removeEventListener(EVENT.CLICK, WebRecorderEventHandler);
    window.removeEventListener(EVENT.SCROLL, WebRecorderEventHandler);
    window.removeEventListener(EVENT.INPUT, WebRecorderEventHandler);
    window.removeEventListener(EVENT.SELECT, WebRecorderEventHandler);
    window.removeEventListener(EVENT.WHEEL, WebRecorderEventHandler);
    window.removeEventListener(EVENT.MOUSEUP, WebRecorderEventHandler);
    window.removeEventListener(EVENT.MOUSEDOWN, WebRecorderEventHandler);
}

export const webRecorder = (request : CrxMessage) => {
    if (request.receiver !== CRX_MSG_RECEIVER.WEB_RECORDER) return;
    switch (request.command) {
        
        case CRX_COMMAND.CMD_RECORDING_START : {
            if (webRecorderStatus) return;
            webRecorderStart();
            const crxHighlightStyle = document.createElement('style');
            crxHighlightStyle.innerHTML = CrxHilightCSS;
            document.head.appendChild(crxHighlightStyle);
            
            const crxContextMenuStyle = document.createElement('style');
            crxContextMenuStyle.innerHTML = CrxContexMenuCSS;
            document.head.appendChild(crxContextMenuStyle);

            webRecorderStatus = true;
            break;
        }
        case CRX_COMMAND.CMD_RECORDING_END : {
            webRecorderEnd();
            break;
        }
        case CRX_COMMAND.CMD_CONTEXT_MENU_CHANGE : {
            contextMenuType = request.payload as CRX_CONTEXT_MENU_TYPE;
        }
    }
}