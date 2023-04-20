import { CRX_CMD } from "@CrxConstants";
import HilightCSS from '@/css/Highlight.css?raw'
import { webRecorderStart, webRecorderEnd } from "@/ts/contents/WebRecorder";
let WebRecorderStarted : boolean;

chrome.runtime.onMessage.addListener(request => {
    switch (request.command) {
        case CRX_CMD.CMD_RECORDING_START : {
            if (WebRecorderStarted) return;
            webRecorderStart();
            const style = window.document.createElement('style');
            style.innerHTML = HilightCSS;
            window.document.head.appendChild(style);

            WebRecorderStarted = true;
            break;
        }
        case CRX_CMD.CMD_RECORDING_END : {
            webRecorderEnd();
            break;
        }
    }
});
