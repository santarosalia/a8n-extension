import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxKeyEvent extends CrxCapturedEvent {
    constructor (ev : Event) {
        super(ev);
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'readonly',
                displayName : '키',
                value : 'key'
            }
        ]
    }
}