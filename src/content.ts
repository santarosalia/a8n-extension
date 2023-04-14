import { CapturedEvent, CrxClickEvent, CrxInputEvent } from '@CrxClass';
import { CRX_RECORDS, EVENT, CRX_CMD } from "@CrxConstants";
import { getItemFromLocalStorage, setItemFromLocalStorage, switchFrame } from '@CrxApi';
import HilightCSS from '@/css/Highlight.css?raw'

let started : boolean;

const mouseEventHandler = async (ev : MouseEvent) => {
    
    const e = new CrxClickEvent(ev);

    
    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        const records = result[CRX_RECORDS];
        
        const isSameFrame : boolean = JSON.stringify(e.frameStack) === JSON.stringify(records[records.length-1].frameStack);
        if (!isSameFrame) records.push(switchFrame(e));
        
        records.push(e);
        setItemFromLocalStorage(CRX_RECORDS, records);
    });
}

const inputEventHandler = (ev : Event) => {
    const e = new CrxInputEvent(ev);
    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        const records = result[CRX_RECORDS];
        
        const isSameFrame : boolean = JSON.stringify(e.frameStack) === JSON.stringify(records[records.length-1].frameStack);
        if (!isSameFrame) records.push(switchFrame(e));

        if (e.type === records[records.length-1].type) records.pop();
        records.push(e);
        setItemFromLocalStorage(CRX_RECORDS, records);
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
        records.push(e);
        setItemFromLocalStorage(CRX_RECORDS, records);
    });
}
const eventHandler = (ev : Event) => {
    switch (ev.type) {
        case EVENT.INPUT || EVENT.SELECT : {
            inputEventHandler(ev);
            break;
        }
        case EVENT.CLICK : {
            mouseEventHandler(ev as MouseEvent);
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

            window.addEventListener(EVENT.CLICK, eventHandler, true);
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
