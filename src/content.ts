import { CrxClickEvent, CrxInputEvent, CrxKeyEvent } from '@CrxClass';
import { EVENT, CRX_CMD, CRX_NEW_RECORD } from "@CrxConstants";
import { setItemFromLocalStorage} from '@CrxApi';
import HilightCSS from '@/css/Highlight.css?raw'
let started : boolean;

const clickEventHandler = (ev : MouseEvent) => {
    const e = new CrxClickEvent(ev);
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

const inputEventHandler = (ev : Event) => {
    const e = new CrxInputEvent(ev);
    // console.log(e)
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

const mouseoverEventHandler = (ev : Event) => {
    const target = ev.target as Element;
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
    console.log(e)
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}
const eventHandler = (ev : Event) => {
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
        case 'contextmenu' : {

            break;
        }
    }
}

chrome.runtime.onMessage.addListener(request => {
    switch (request.command) {
        case CRX_CMD.CMD_RECORDING_START : {
            if (started) return;

            window.addEventListener(EVENT.CLICK, eventHandler, true);
            window.addEventListener('contextmenu', eventHandler, true);
            window.addEventListener(EVENT.SCROLL, eventHandler, true);
            window.addEventListener(EVENT.INPUT, eventHandler, true);
            window.addEventListener(EVENT.WHEEL, eventHandler, true);
            window.addEventListener(EVENT.MOUSEOVER, eventHandler, true);
            window.addEventListener(EVENT.MOUSEOUT, eventHandler, true);
            window.addEventListener(EVENT.KEYDOWN, eventHandler, true);
            
            const style = window.document.createElement('style');
            style.innerHTML = HilightCSS;
            window.document.head.appendChild(style);
            // new KeyboardEvent('keydown', {
            //     code: 'Enter',
            //     key: 'Enter',
            //     charCode: 13,
            //     keyCode: 13,
            //     view: window,
            //     bubbles: true
            // });
            started = true;
            break;
        }
        case CRX_CMD.CMD_RECORDING_END : {
            window.removeEventListener(EVENT.CLICK, eventHandler);
            window.removeEventListener(EVENT.SCROLL, eventHandler);
            window.removeEventListener(EVENT.INPUT, eventHandler);
            window.removeEventListener(EVENT.SELECT, eventHandler);
            window.removeEventListener(EVENT.WHEEL, eventHandler);
            break;
        }
    }
});
