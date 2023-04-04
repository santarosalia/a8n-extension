class CapturedEvent {
    constructor (type,target) {
        this.type = type;
        this.id = target.id;
        this.class = target.classList ? Array.from(target.classList) : null;
        this.name = target.name;


        

    }
}


const capture = (ev) => {
    console.log(ev)
    const e = new CapturedEvent(ev.type,ev.target);
 
    if (e.type !== 'mousemove') {
        chrome.storage.local.get(['WD_CRX_RECORD']).then(result => {
            console.log(result)
            const list = [...result['WD_CRX_RECORD'],e];
            chrome.storage.local.set({'WD_CRX_RECORD' : list});
            console.log(list);
        });
    }
    
    
}
window.addEventListener('click', capture);
window.addEventListener('scroll', capture);
window.addEventListener('input', capture);
window.addEventListener('mousemove', capture);
window.addEventListener('select', capture);
