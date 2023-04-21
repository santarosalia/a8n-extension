import { CrxClickEvent, CrxInputEvent, CrxKeyEvent } from '@CrxClass';
import { EVENT, CRX_NEW_RECORD } from "@CrxConstants";
import { setItemFromLocalStorage} from '@CrxApi';
import CrxContextMenu from '@/ts/class/CrxContextMenu';

window.customElements.define('crx-contextmenu',CrxContextMenu);
let crxContextMenu = new CrxContextMenu(0,0);

const clickEventHandler = (ev : MouseEvent) => {
    const target = ev.target as Element;
    if (isContextMenu(target)) return;

    const e = new CrxClickEvent(ev);
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

const inputEventHandler = (ev : Event) => {
    const e = new CrxInputEvent(ev);
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
    if (e.key === 'Control') {
        
    }
    if (e.key !== 'Enter') return;
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

const contextmenuEventHandler = (ev : Event) => {
    ev.preventDefault();
    const e = new CrxClickEvent(ev);
    crxContextMenu.hide();
    crxContextMenu = new CrxContextMenu(e.pageX,e.pageY);
    document.head.after(crxContextMenu);

}
const isContextMenu = (target : Element) => {
    return target.closest('crx-contextmenu');
}
export const WebRecorderEventHandler =  (ev : Event) => {

    
    switch (ev.type) {
        case EVENT.INPUT || EVENT.SELECT : {
            console.log(ev)
            inputEventHandler(ev);
            break;
        }
        case EVENT.CLICK : {
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
    }
}

export const webRecorderStart = () => {
    window.addEventListener(EVENT.CLICK, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.CONTEXTMENU, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.SCROLL, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.INPUT, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.WHEEL, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEOVER, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.MOUSEOUT, WebRecorderEventHandler, true);
    window.addEventListener(EVENT.KEYDOWN, WebRecorderEventHandler, true);
}

export const webRecorderEnd = () => {
    window.removeEventListener(EVENT.CLICK, WebRecorderEventHandler);
    window.removeEventListener(EVENT.SCROLL, WebRecorderEventHandler);
    window.removeEventListener(EVENT.INPUT, WebRecorderEventHandler);
    window.removeEventListener(EVENT.SELECT, WebRecorderEventHandler);
    window.removeEventListener(EVENT.WHEEL, WebRecorderEventHandler);
}
