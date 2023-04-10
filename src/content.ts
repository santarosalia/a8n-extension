import { CapturedEvent } from '@CrxClass';
import { CRX_RECORDS, EVENT } from "@CrxConstants";
import { getItemFromLocalStorage, setItemFromLocalStorage } from '@CrxApi';
import HilightCSS from '@/css/Highlight.css?raw'

let started : boolean;

const mouseEventHandler = async (ev : MouseEvent) => {
    chrome.runtime.sendMessage('asdf');
    
    
    const details = {
        type : ev.type,
        target : ev.target as Element,
        clientX : ev.clientX,
        clientY : ev.clientY,
        x : ev.x,
        y : ev.y,
        ctrlKey : ev.ctrlKey,
        pageX : ev.pageX,
        pageY : ev.pageY,
        shiftKey : ev.shiftKey,
        timestamp : ev.timeStamp
    }

    const e = new CapturedEvent(details);

    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        const records = result[CRX_RECORDS];
        if (e.type === EVENT.SCROLL || e.type === EVENT.INPUT) {
            if (e.type === records[records.length-1].type) records.pop();
        }
        
        const list = [...result[CRX_RECORDS], e];
        setItemFromLocalStorage(CRX_RECORDS, list);
        
    });
}

const inputEventHandler = (ev : Event) => {
    const details = {
        type : ev.type,
        target : ev.target,
        timestamp : ev.timeStamp
    }
    const e = new CapturedEvent(details);

    getItemFromLocalStorage([CRX_RECORDS]).then(result => {
        const records = result[CRX_RECORDS];
        if (e.type === records[records.length-1].type) records.pop();
        const list = [...result[CRX_RECORDS], e];
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
    }
}

chrome.runtime.onMessage.addListener(request => {
    switch (request.command) {
        case 'RECORDING_START' : {
            if (started) return;
            window.addEventListener(EVENT.CLICK, eventHandler);
            window.addEventListener(EVENT.SCROLL, eventHandler);
            window.addEventListener(EVENT.INPUT, eventHandler);
            window.addEventListener(EVENT.SELECT, eventHandler);
            window.addEventListener(EVENT.WHEEL, eventHandler);
            window.addEventListener(EVENT.MOUSEOVER, eventHandler);
            window.addEventListener(EVENT.MOUSEOUT, eventHandler);
            const style = window.document.createElement('style');
            style.innerHTML = HilightCSS;
            window.document.head.appendChild(style);
            started = true;
            break;
        }
        case 'RECORDING_END' : {
            window.removeEventListener(EVENT.CLICK, eventHandler);
            window.removeEventListener(EVENT.SCROLL, eventHandler);
            window.removeEventListener(EVENT.INPUT, eventHandler);
            window.removeEventListener(EVENT.SELECT, eventHandler);
            window.removeEventListener(EVENT.WHEEL, eventHandler);
            break;
        }
    }
});
