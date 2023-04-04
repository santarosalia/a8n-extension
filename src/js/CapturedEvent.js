export default class CapturedEvent {
    constructor (type,target) {
        this.type = type;
        this.id = target.id;
        this.class = target.classList ? Array.from(target.classList) : null;
        this.name = target.name;


        

    }
}