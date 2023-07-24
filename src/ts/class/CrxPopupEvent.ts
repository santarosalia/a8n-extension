import { EVENT } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxPopupEvent extends CrxCapturedEvent {
    constructor () {
        super(null);
        this.type = EVENT.POPUP;
        this.frameStack = [];
        this.info = this.getInfo();
    }
    getInfo() {
        return [
        ]
    }
}