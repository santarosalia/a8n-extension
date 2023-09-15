import { EVENT, getLocatorInfo } from "@CrxConstants";
import { EventInfo } from "@CrxInterface";
import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";
import { CrxClickEvent } from "@CrxClass/CrxClickEvent";

export class CrxContextMenuEvent extends CrxCapturedEvent {
    info : EventInfo[]

    constructor (ev : Event | CrxClickEvent, type : string) {
        super(ev);
        this.info = this.getInfo();
        this.type = type;
        if (this.type === EVENT.READATTRIBUTE) {
            this.info.push({
                type : 'selectAttribute',
                displayName : '속성',
                values : Array.from(this.target.attributes).map(item => {
                  return {
                    displayName : item.name,
                    type : item.name,
                    val : item.nodeValue
                  }
                })
            });
        }
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