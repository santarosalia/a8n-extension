import { CrxCapturedEvent } from "@CrxClass/CrxCapturedEvent";

export class CrxDataScrapingEvent extends CrxCapturedEvent {

    constructor (ev : Event, data : any) {
        super(ev);
        this.info = this.getInfo();
        this.type = 'datascraping';
        this.data = data;
        this.frameStack = data.frameStack;
    }
    
    getInfo() {
        return [
        ]
    }
}