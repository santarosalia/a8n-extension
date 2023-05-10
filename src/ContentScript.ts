import { webRecorder } from "@/ts/contents/WebRecorder";
import { getItemFromLocalStorage, sendMessageToServiceWorker } from "@CrxApi";
import { CRX_COMMAND, CrxMessage } from "@CrxInterface";
import { CRX_MSG_RECEIVER, CRX_STATE, EVENT } from "@CrxConstants";
import { ButtonHTMLAttributes } from "vue";

const contentScript = async (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.CONTENT_SCRIPT) return;
    switch (message.command) {
        case CRX_COMMAND.CMD_CREATE_ACTIVITY : {
            await getItemFromLocalStorage([CRX_STATE.CRX_RECORDS]).then(result => {
                localStorage.setItem(CRX_STATE.CRX_RECORDS,JSON.stringify(result[CRX_STATE.CRX_RECORDS]));
            });
            const createWebRecAct2 = document.querySelector('#createWebRecAct2') as HTMLElement;
            if (createWebRecAct2) createWebRecAct2.click();
        }
    }
}
chrome.runtime.onMessage.addListener(contentScript);
chrome.runtime.onMessage.addListener(webRecorder);