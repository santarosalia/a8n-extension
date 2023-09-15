import { browserRecorder } from "@/ts/contents/BrowserRecorder";
import { browserSelector } from "@/ts/contents/BrowserSelector";
import { getItemFromLocalStorage } from "@CrxApi";
import { CrxMessage } from "@CrxInterface";
import { CRX_COMMAND, CRX_MSG_RECEIVER, CRX_STATE } from "@CrxConstants";

const contentScript = async (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.CONTENT_SCRIPT) return;
    switch (message.command) {
        case CRX_COMMAND.CMD_CREATE_ACTIVITY : {
            await getItemFromLocalStorage([CRX_STATE.CRX_RECORDS]).then(result => {
                localStorage.setItem(CRX_STATE.CRX_RECORDS,JSON.stringify(result[CRX_STATE.CRX_RECORDS]));
            });
            const createWebRecAct2 = document.querySelector('#createWebRecAct2') as HTMLElement;
            if (createWebRecAct2) createWebRecAct2.click();
            break;
        }
        case CRX_COMMAND.CMD_SEND_LOCATORS : {
            const browserSelectorModalButton = document.querySelector('#browserSelectorModalButton') as HTMLElement;
            const locators = message.payload;
            if (browserSelectorModalButton) {
                sessionStorage.setItem('ws-locators',JSON.stringify(locators));
                browserSelectorModalButton.click();
            }
            break;
        }
    }
}

chrome.runtime.onMessage.addListener(contentScript);
chrome.runtime.onMessage.addListener(browserRecorder);
chrome.runtime.onMessage.addListener(browserSelector);
