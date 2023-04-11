import { CapturedEvent, CapturedEventDetails } from '@CrxClass';
import { CRX_RECORDS, EVENT, CRX_CMD } from "@CrxConstants";
import { getItemFromLocalStorage, setItemFromLocalStorage } from '@CrxApi';
import HilightCSS from '@/css/Highlight.css?raw'

let started : boolean;

const mouseEventHandler = async (ev : MouseEvent) => {
    // chrome.runtime.sendMessage('asdf');
    const e = new CapturedEvent(ev);

    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        const records = result[CRX_RECORDS];
        const list = [...records, e];
        setItemFromLocalStorage(CRX_RECORDS, list);
    });
}

const inputEventHandler = (ev : Event) => {
    const e = new CapturedEvent(ev);
    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        const records = result[CRX_RECORDS];
        if (e.type === records[records.length-1].type) records.pop();
        const list = [...records, e];
        setItemFromLocalStorage(CRX_RECORDS, list);
    });
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
    const e = new CapturedEvent(ev);
    if (e.key !== 'Enter') return;
    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        const records = result[CRX_RECORDS];
        const list = [...records, e];
        setItemFromLocalStorage(CRX_RECORDS, list);
    });
}
const eventHandler = (ev : Event) => {
    switch (ev.type) {
        case EVENT.CLICK : {
            mouseEventHandler(ev as MouseEvent);
            break;
        }
        case EVENT.INPUT : {
            inputEventHandler(ev);
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
        }
    }
}

chrome.runtime.onMessage.addListener(request => {
    switch (request.command) {
        case CRX_CMD.CMD_RECORDING_START : {
            if (started) return;
            window.addEventListener(EVENT.CLICK, eventHandler);
            window.addEventListener(EVENT.SCROLL, eventHandler);
            window.addEventListener(EVENT.INPUT, eventHandler);
            window.addEventListener(EVENT.SELECT, eventHandler);
            window.addEventListener(EVENT.WHEEL, eventHandler);
            window.addEventListener(EVENT.MOUSEOVER, eventHandler);
            window.addEventListener(EVENT.MOUSEOUT, eventHandler);
            window.addEventListener(EVENT.KEYDOWN, eventHandler);
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
