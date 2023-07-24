import { getLocatorInfo } from "@CrxConstants";
import { EventInfo } from "@CrxInterface";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxClickEvent extends CrxCapturedEvent {
    info : EventInfo[]

    constructor (ev : Event) {
        super(ev);
        this.info = this.getInfo();
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
                    getLocatorInfo(this).linktextxpath
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