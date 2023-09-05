import { EVENT, getLocatorInfo } from "@CrxConstants";
import { EventInfo } from "@CrxInterface";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";
import { CrxClickEvent } from "@CrxClass/CrxClickEvent";

export class CrxReadAttributeEvent extends CrxCapturedEvent {
    info : EventInfo[]

    constructor (ev : CrxClickEvent) {
        super(ev);
        this.info = this.getInfo();
        this.type = EVENT.HOVER;
    }
    
    getInfo() {
        return [
            {
                type : 'readonly',
                displayName : '텍스트',
                value : 'textContent'
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