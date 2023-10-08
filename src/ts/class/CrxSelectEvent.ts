import { EVENT, ElementAction, LocatorType, getLocatorInfo } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";
import { ExecuteRequestMessage } from "../interface/CrxInterface";

export class CrxSelectEvent extends CrxCapturedEvent {
    constructor (ev : Event) {
        super(ev);
    }
    get object() : ExecuteRequestMessage {
        return {
            object : {
                action : ElementAction.SET_SELECT_BOX_VALUE,
                parameter : {
                    locatorType : LocatorType.CSS_SELECTOR,
                    locator : this.cssSelector,
                    selectValue : this.value as string
                }
            }
        }
    }
}