import CapturedEvent from './js/CapturedEvent'


const captureEvent = (ev) => {
    const e = new CapturedEvent(ev.type,ev.target);
 
    if (e.type !== 'mousemove') {
        chrome.storage.local.get(['WD_CRX_RECORD']).then(result => {
            
            const WD_CRX_RECORD = result['WD_CRX_RECORD'];

            if (e.type === 'scroll' && WD_CRX_RECORD[WD_CRX_RECORD.length-1].type === 'scroll') WD_CRX_RECORD.pop();

            const list = [...result['WD_CRX_RECORD'], e];
            chrome.storage.local.set({'WD_CRX_RECORD' : list});
            console.log(list);
        });
    }
    
    
}
window.addEventListener('click', captureEvent);
window.addEventListener('scroll', captureEvent);
window.addEventListener('input', captureEvent);
window.addEventListener('mousemove', captureEvent);
window.addEventListener('select', captureEvent);
