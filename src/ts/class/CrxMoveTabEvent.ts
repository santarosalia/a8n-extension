import { BrowserAction, EVENT } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";
import { ExecuteRequestMessage } from "../interface/CrxInterface";

export class CrxMoveTabEvent extends CrxCapturedEvent {
    constructor (tabIndex : number) {
        super(null);
        this.value = tabIndex;
    }
    get object() : ExecuteRequestMessage {
        return {
            object : {
                action : BrowserAction.SWITCH_TAB,
                parameter : {
                    tabIndex : this.value as number
                }
            }
        }
    }
}