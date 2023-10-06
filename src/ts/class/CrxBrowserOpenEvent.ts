import { BrowserAction, EVENT } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxBrowserOpenEvent extends CrxCapturedEvent {
    constructor (url : string) {
        super(null);
        this.action = BrowserAction.CREATE;
        this.value = url;
        this.frameStack = [];
    }
    get object() {
        return {
            object : {
                action : BrowserAction.CREATE,
                parameter : {
                    url : this.value
                }
            }
        }
    }
}