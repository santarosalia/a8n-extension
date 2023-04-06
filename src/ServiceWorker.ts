import { Setting } from "@CrxClass";
import { setItemFromLocalStorage, createViewTab, openWindow } from "@CrxApi";
import { CRX_RECORDS, CRX_EVENT_INDEX } from "@CrxConstants";

const setting = new Setting();

const init = () => {
    setItemFromLocalStorage(CRX_RECORDS, []);
    setItemFromLocalStorage(CRX_EVENT_INDEX, setting.CRX_EVENT_INDEX);

    createViewTab().then(result => {
        openWindow(result).then(result => {
            setting.VIEW_WINDOW_ID = result.id;
        });
    })
}

const onMessage = (request : chrome.webRequest.WebRequestDetails, sender, response) => {
    console.log(request)
}
const storageChange = (d) => {
    // console.log(d)
}
chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onMessage.addListener(onMessage);
chrome.storage.onChanged.addListener(storageChange);