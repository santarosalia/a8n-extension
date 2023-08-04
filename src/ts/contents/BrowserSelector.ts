import CrxHilightCSS from '@/css/CrxHighlight.css?raw';
import CrxSelectorDisplayCSS from '@/css/CrxSelectorDisplay.css?raw';
import { CrxMessage } from '@CrxInterface';
import { CRX_COMMAND, CRX_MSG_RECEIVER, CRX_STATE, EVENT } from '@CrxConstants';
import { getItemFromLocalStorage, sendMessageToServiceWorker } from '@CrxApi';
import CrxSelectorDisplay from '@/ts/class/CrxSelectorDisplay';
import { CrxClickEvent } from '@CrxClass/CrxClickEvent';
import { CrxMousemoveEvent } from '@CrxClass/CrxMouseMoveEvent';

window.customElements.define('crx-selector-display', CrxSelectorDisplay);

let browserSelectorStatus : boolean;
let crxSelectorDisplay = new CrxSelectorDisplay(null);

const clickEventHandler = (ev : MouseEvent) => {
    const target = ev.target as Element;
    ev.preventDefault();
    ev.stopPropagation();
    const e = new CrxClickEvent(ev);
    const xpath = e.xpath;
    const fullXpath = e.fullXpath;
    const linkTextXpath = e.linkTextXpath;
    const cssSelector = e.cssSelector;

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
    },
    {
        type : 'CSSSELECTOR',
        value : cssSelector ? cssSelector : null
    }];

    target.classList.remove('crx-highlight');

    browserSelectorEnd();
    sendMessageToServiceWorker(CRX_COMMAND.CMD_SELECTOR_END, {
        locatorType : 'all',
        locators : locators
    });
}

const mousemoveEventHandler = (ev : MouseEvent) => {
    crxSelectorDisplay.remove();
    const target = ev.target as Element;
    target.classList.add('crx-highlight');
    const e = new CrxMousemoveEvent(ev);
    crxSelectorDisplay = new CrxSelectorDisplay(e);
    
    document.head.after(crxSelectorDisplay);
    crxSelectorDisplay.show();
}

const mouseoutEventHandler = (ev : Event) => {
    crxSelectorDisplay.remove();
    const target = ev.target as Element;
    target.classList.remove('crx-highlight');
}

const browserSelectorEventHandler = (ev : Event) => {
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

const browserSelectorStart = () => {
    window.addEventListener(EVENT.CLICK, browserSelectorEventHandler, true);
    window.addEventListener(EVENT.MOUSEMOVE, browserSelectorEventHandler, true);
    window.addEventListener(EVENT.MOUSEOUT, browserSelectorEventHandler, true);
}
const browserSelectorEnd = () => {
    crxSelectorDisplay.remove();
    window.removeEventListener(EVENT.CLICK, browserSelectorEventHandler, true);
    window.removeEventListener(EVENT.MOUSEMOVE, browserSelectorEventHandler, true);
    window.removeEventListener(EVENT.MOUSEOUT, browserSelectorEventHandler, true);
}
export const browserSelector = (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.BROWSER_SELECTOR) return;
    switch (message.command) {  

        case CRX_COMMAND.CMD_SELECTOR_START : {
            if (browserSelectorStatus) return;
            browserSelectorStart();
            const crxHighlightStyle = document.createElement('style');
            crxHighlightStyle.innerHTML = CrxHilightCSS;
            document.head.appendChild(crxHighlightStyle);

            const crxSelectorDisplayStyle = document.createElement('style');
            crxSelectorDisplayStyle.innerHTML = CrxSelectorDisplayCSS;
            document.head.appendChild(crxSelectorDisplayStyle);

            browserSelectorStatus = true;
            break;
        }
        case CRX_COMMAND.CMD_SELECTOR_END : {
            browserSelectorEnd();

            browserSelectorStatus = false;
            break;
        }
       
    }
}