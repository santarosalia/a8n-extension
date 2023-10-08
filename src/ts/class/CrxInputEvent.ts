import { ElementAction, LocatorType, getLocatorInfo } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";
import { ExecuteRequestMessage } from "../interface/CrxInterface";

export class CrxInputEvent extends CrxCapturedEvent {
    constructor (ev : Event) {
        super(ev);
    }
    
    get object(): ExecuteRequestMessage {
        return {
            object : {
                action : ElementAction.TYPE,
                parameter : {
                    locatorType : LocatorType.CSS_SELECTOR,
                    locator : this.cssSelector,
                    text : this.value as string
                }
            }
        }
    }
}