import { CrxClickEvent, CrxInputEvent, CrxKeyEvent } from '@CrxClass';
import { EVENT, CRX_NEW_RECORD } from "@CrxConstants";
import { setItemFromLocalStorage} from '@CrxApi';

const clickEventHandler = (ev : MouseEvent) => {
    const e = new CrxClickEvent(ev);
    setItemFromLocalStorage(CRX_NEW_RECORD, e);
}

const inputEventHandler = (ev : Event) => {
    const e = new CrxInputEvent(ev);
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

const contextmenuEventHandler = (ev : Event) => {
    console.log(ev)
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
