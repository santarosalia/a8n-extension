import { EVENT, getLocatorInfo } from "@CrxConstants";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxHoverEvent extends CrxCapturedEvent {
    constructor (ev : Event) {
        super(ev);
        this.type = EVENT.HOVER;
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'input',
                displayName : '값',
                value : 'value'
            },
            {
                type : 'selectLocator',
                displayName : '로케이터',
                values : [
                    getLocatorInfo(this).xpath,
                    getLocatorInfo(this).fullxpath,
                    getLocatorInfo(this).linktextxpath,
                    getLocatorInfo(this).cssselector
                ]
            },
            {
                type : 'image',
                displayName : '이미지',
                value : this.image
            }
        ]
    }
}