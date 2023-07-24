import { EVENT } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxMoveTabEvent extends CrxCapturedEvent {
    constructor (tabIndex : number) {
        super(null);
        this.type = EVENT.MOVETAB;
        this.value = tabIndex;
        this.frameStack = [];
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'readonly',
                displayName : '탭 인덱스',
                value : 'value'
            }
        ]
    }
}