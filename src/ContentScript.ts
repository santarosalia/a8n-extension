import { EVENT, CRX_CMD } from "@CrxConstants";
import HilightCSS from '@/css/Highlight.css?raw'
import { WebRecorderEventHandler } from "@/ts/contents/WebRecorder";
let WebRecorderStarted : boolean;

chrome.runtime.onMessage.addListener(request => {
    switch (request.command) {
        case CRX_CMD.CMD_RECORDING_START : {
            if (WebRecorderStarted) return;

            window.addEventListener(EVENT.CLICK, WebRecorderEventHandler, true);
            window.addEventListener(EVENT.CONTEXTMENU, WebRecorderEventHandler, true);
            window.addEventListener(EVENT.SCROLL, WebRecorderEventHandler, true);
            window.addEventListener(EVENT.INPUT, WebRecorderEventHandler, true);
            window.addEventListener(EVENT.WHEEL, WebRecorderEventHandler, true);
            window.addEventListener(EVENT.MOUSEOVER, WebRecorderEventHandler, true);
            window.addEventListener(EVENT.MOUSEOUT, WebRecorderEventHandler, true);
            window.addEventListener(EVENT.KEYDOWN, WebRecorderEventHandler, true);
            
            const style = window.document.createElement('style');
            style.innerHTML = HilightCSS;
            window.document.head.appendChild(style);

            WebRecorderStarted = true;
            break;
        }
        case CRX_CMD.CMD_RECORDING_END : {
            window.removeEventListener(EVENT.CLICK, WebRecorderEventHandler);
            window.removeEventListener(EVENT.SCROLL, WebRecorderEventHandler);
            window.removeEventListener(EVENT.INPUT, WebRecorderEventHandler);
            window.removeEventListener(EVENT.SELECT, WebRecorderEventHandler);
            window.removeEventListener(EVENT.WHEEL, WebRecorderEventHandler);
            break;
        }
    }
});
