import { browserRecorder } from "@/ts/contents/BrowserRecorder";
import { getItemFromLocalStorage } from "@CrxApi";
import { CrxMessage } from "@CrxInterface";
import { CRX_COMMAND, CRX_MSG_RECEIVER, CRX_STATE } from "@CrxConstants";

const contentScript = async (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.CONTENT_SCRIPT) return;
    switch (message.command) {
    }
}

chrome.runtime.onMessage.addListener(contentScript);
chrome.runtime.onMessage.addListener(browserRecorder);
