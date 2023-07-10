import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxMousemoveEvent extends CrxCapturedEvent {
    constructor (ev : Event) {
        super(ev);
    }
}