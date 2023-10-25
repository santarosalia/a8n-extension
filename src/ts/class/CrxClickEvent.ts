import { BrowserAction, ElementAction, LocatorType, getLocatorInfo } from "@CrxConstants";
import { EventInfo, ExecuteRequestMessage } from "@CrxInterface";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxClickEvent extends CrxCapturedEvent {
    info : EventInfo[]

    constructor (ev : Event) {
        super(ev);
    }
    
    get object(): ExecuteRequestMessage {
        return {
            object : {
                action : ElementAction.LEFT_CLICK,
                parameter : {
                    locatorType : LocatorType.XPATH,
                    locator : this.xpath
                }
            }
        }
    }
}