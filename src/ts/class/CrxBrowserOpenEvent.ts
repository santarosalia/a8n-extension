import { EVENT } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxBrowserOpenEvent extends CrxCapturedEvent {
    constructor (url : string) {
        super(null);
        this.info = this.getInfo();
        this.type = EVENT.OPENBROWSER;
        this.value = url;
        this.frameStack = [];
    }
    getInfo() {
        return [
            {
                type : 'input',
                displayName : 'URL',
                value : 'value'
            }
        ]
    }
}