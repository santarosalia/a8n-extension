import CrxHilightCSS from '@/css/CrxHighlight.css?raw';
import CrxSelectorDisplayCSS from '@/css/CrxSelectorDisplay.css?raw';
import { CRX_COMMAND, CrxMessage } from '@CrxInterface';
import { CRX_MSG_RECEIVER, EVENT } from '@CrxConstants';
import { CrxClickEvent, CrxMousemoveEvent } from '@CrxClass';
import { sendMessageToServiceWorker, showNotification } from '@CrxApi';
import CrxSelectorDisplay from '@/ts/class/CrxSelectorDisplay';

window.customElements.define('crx-selector-display', CrxSelectorDisplay);

let webSelectorStatus : boolean;
let crxSelectorDisplay = new CrxSelectorDisplay(null);

const clickEventHandler = (ev : MouseEvent) => {
    const target = ev.target as Element;
    ev.preventDefault();
    ev.stopPropagation();
    const e = new CrxClickEvent(ev);
    const xpath = e.xpath;
    const fullXpath = e.fullXpath;
    const linkTextXpath = e.linkTextXpath;

    const locators = [{
        type : 'XPATH',
        value : xpath === fullXpath ? null : xpath
    },
    {
        type : 'FULLXPATH',
        value : fullXpath
    },
    {
        type : 'LINKTEXTXPATH',
        value : linkTextXpath ? linkTextXpath : null
    }];

    target.classList.remove('crx-highlight');

    webSelectorEnd();
    sendMessageToServiceWorker(CRX_COMMAND.CMD_SELECTOR_END, {
        locatorType : 'all',
        locators : locators
    })
}

const mousemoveEventHandler = (ev : MouseEvent) => {
    crxSelectorDisplay.hide();
    const target = ev.target as Element;
    target.classList.add('crx-highlight');
    const e = new CrxMousemoveEvent(ev);
    crxSelectorDisplay = new CrxSelectorDisplay(e);
    document.head.after(crxSelectorDisplay);
    crxSelectorDisplay.show();
}

const mouseoutEventHandler = (ev : Event) => {
    const target = ev.target as Element;
    target.classList.remove('crx-highlight');
}

const WebSelectorEventHandler = (ev : Event) => {
    switch (ev.type) {
        case EVENT.CLICK : {
            clickEventHandler(ev as MouseEvent);
            break;
        }
        case EVENT.MOUSEMOVE : {
            mousemoveEventHandler(ev as MouseEvent);
            return;
        }
        case EVENT.MOUSEOUT : {
            mouseoutEventHandler(ev);
            return;
        }
    }
}

const webSelectorStart = () => {
    window.addEventListener(EVENT.CLICK, WebSelectorEventHandler, true);
    window.addEventListener(EVENT.MOUSEMOVE, WebSelectorEventHandler, true);
    window.addEventListener(EVENT.MOUSEOUT, WebSelectorEventHandler, true);
}
const webSelectorEnd = () => {
    crxSelectorDisplay.hide();
    window.removeEventListener(EVENT.CLICK, WebSelectorEventHandler, true);
    window.removeEventListener(EVENT.MOUSEMOVE, WebSelectorEventHandler, true);
    window.removeEventListener(EVENT.MOUSEOUT, WebSelectorEventHandler, true);
}
export const webSelector = (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.WEB_SELECTOR) return;
    switch (message.command) {  

        case CRX_COMMAND.CMD_SELECTOR_START : {
            if (webSelectorStatus) return;
            webSelectorStart();
            const crxHighlightStyle = document.createElement('style');
            crxHighlightStyle.innerHTML = CrxHilightCSS;
            document.head.appendChild(crxHighlightStyle);

            const crxSelectorDisplayStyle = document.createElement('style');
            crxSelectorDisplayStyle.innerHTML = CrxSelectorDisplayCSS;
            document.head.appendChild(crxSelectorDisplayStyle);

            webSelectorStatus = true;
            break;
        }
        case CRX_COMMAND.CMD_SELECTOR_END : {
            webSelectorEnd();

            webSelectorStatus = false;
            break;
        }
       
    }
}