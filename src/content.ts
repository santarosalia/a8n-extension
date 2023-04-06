import { CapturedEvent } from '@CrxClass';
import { CRX_EVENT_INDEX, CRX_RECORDS, EVENT } from "@CrxConstants";
import { getItemFromLocalStorage, setItemFromLocalStorage } from '@CrxApi';

const mouseEventHandler = async (ev : MouseEvent, evIndex : number) => {
    chrome.runtime.sendMessage('asdf');
    

    const details = {
        index : evIndex,
        type : ev.type,
        target : ev.target ,
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
    return true;
}

const inputEventHandler = (ev : Event, evIndex :number) => {
    const details = {
        index : evIndex,
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

const eventHandler = (ev : Event) => {
    getItemFromLocalStorage([CRX_EVENT_INDEX]).then(async result=>{
        switch (ev.type) {
            case EVENT.CLICK : {
                mouseEventHandler(ev as MouseEvent, result.CRX_EVENT_INDEX);
                break;
            }
            case EVENT.INPUT : {
                inputEventHandler(ev, result.CRX_EVENT_INDEX);
                break;
            }
        }

        setItemFromLocalStorage(CRX_EVENT_INDEX, result.CRX_EVENT_INDEX + 1);
    });
}

window.addEventListener(EVENT.CLICK, eventHandler);

window.addEventListener(EVENT.SCROLL, eventHandler);
window.addEventListener(EVENT.INPUT, eventHandler);
window.addEventListener(EVENT.SELECT, eventHandler);
window.addEventListener(EVENT.WHEEL, eventHandler);