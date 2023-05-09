import { webRecorder } from "@/ts/contents/WebRecorder";
import { getItemFromLocalStorage, sendMessageToServiceWorker } from "@CrxApi";
import { CRX_COMMAND, CrxMessage } from "@CrxInterface";
import { CRX_MSG_RECEIVER, CRX_STATE, EVENT } from "@CrxConstants";

const launcher = (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.LAUNCHER) return;
    getItemFromLocalStorage([CRX_STATE.CRX_RECORDS]).then(result => {
        localStorage.setItem(CRX_STATE.CRX_RECORDS,JSON.stringify(result[CRX_STATE.CRX_RECORDS]));
    });
}
chrome.runtime.onMessage.addListener(launcher);
chrome.runtime.onMessage.addListener(webRecorder);