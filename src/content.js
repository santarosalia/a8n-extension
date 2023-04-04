class CapturedEvent {
    constructor (type,target) {
        this.type = type;
        this.id = target.id;
        this.class = target.classList ? Array.from(target.classList) : null;
        this.name = target.name;


        

    }
}


const capture = (ev) => {
    console.log(ev.type)
    const e = new CapturedEvent(ev.type,ev.target);
 
    if (e.type !== 'mousemove') {
        chrome.storage.local.get(['Record']).then(result => {
            const list = [...result.Record,e];
            chrome.storage.local.set({Record : list});
            console.log(list);
        });
    }
    
    
}
window.addEventListener('click', capture);
window.addEventListener('scroll', capture);
window.addEventListener('input', capture);
window.addEventListener('mousemove', capture);
window.addEventListener('select', capture);
