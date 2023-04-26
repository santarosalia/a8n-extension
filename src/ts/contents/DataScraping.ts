import { setItemFromLocalStorage } from "@CrxApi";
import { CRX_ADD_SCRAPING_DATA } from "@CrxConstants";

export const dataScraping = (ev : Event) => {
    const pattern = findPatternByNextSiblings(ev) ?? findPatternByPreviousSiblings(ev);

    let tList = [];
    let result = [];
    
    Array.from(document.querySelectorAll(pattern)).reduce((prev,curr,i)=>{
        const text = prev.textContent.replace(/[\t\n]/g,'').replace(/\s+/g,' ');
        tList.push(text);

        // a 태그 찾기
        if (prev.closest('a')) {
            const a = prev.closest('a');
            const href = a.getAttribute('href') ? a.getAttribute('href') : null;
            href ? tList.push(href) : null;
        } else if (prev.querySelector('a')) {
            const a = prev.querySelector('a');
            const href = a.getAttribute('href') ? a.getAttribute('href') : null;
            href ? tList.push(href) : null;
        }

        // img 태그 찾기
        if (prev.closest('img')) {
            const img = prev.closest('img');
            const src = img.getAttribute('src') ? img.getAttribute('src') : null;
            const alt = img.getAttribute('alt') ? img.getAttribute('alt') : null;
            src ? tList.push(src) : null;
            alt ? tList.push(alt) : null;
        } else if (prev.querySelector('img')) {
            const img = prev.querySelector('img');
            const src = img.getAttribute('src') ? img.getAttribute('src') : null;
            const alt = img.getAttribute('alt') ? img.getAttribute('alt') : null;
            src ? tList.push(src) : null;
            alt ? tList.push(alt) : null;
        }

        if (curr.parentElement != prev.parentElement) {
            result.push(tList);
            tList = [];
        }

        if (i == document.querySelectorAll(pattern).length - 1) {
            const text = curr.textContent.replace(/[\t\n]/g,'').replace(/\s+/g,' ');
            tList.push(text);
            
            // a 태그 찾기
            if (curr.closest('a')) {
                const a = curr.closest('a');
                const href = a.getAttribute('href') ? a.getAttribute('href') : null;
                href ? tList.push(href) : null;
            } else if (curr.querySelector('a')) {
                const a = curr.querySelector('a');
                const href = a.getAttribute('href') ? a.getAttribute('href') : null;
                href ? tList.push(href) : null;
            }

            // img 태그 찾기
            if (curr.closest('img')) {
                const img = curr.closest('img');
                const src = img.getAttribute('src') ? img.getAttribute('src') : null;
                const alt = img.getAttribute('alt') ? img.getAttribute('alt') : null;
                src ? tList.push(src) : null;
                alt ? tList.push(alt) : null;
            } else if (curr.querySelector('img')) {
                const img = curr.querySelector('img');
                const src = img.getAttribute('src') ? img.getAttribute('src') : null;
                const alt = img.getAttribute('alt') ? img.getAttribute('alt') : null;
                src ? tList.push(src) : null;
                alt ? tList.push(alt) : null;
            }
        }
        return curr;
    });

    result.push(tList);

    let colSize = 0;

    result.forEach((item)=>{
        if (item.length > colSize) colSize = item.length;
    });

    // column size 보다 작은 배열 빈칸 채우기
    result.forEach((item,j)=>{
        for (let i = 0; i< colSize - item.length; i++) {
            result[j].push('');
        }
        
    });
    if (result.reduce((acc,cur)=>acc+=cur.length).length === 0) {
        alert('스크래핑 데이터가 없습니다.');
        return;
    }
    const data = {
        textData: result,
        pattern : pattern,
        columnSize: colSize
    };

    setItemFromLocalStorage(CRX_ADD_SCRAPING_DATA,{
        data : data
    });
    console.log(1)
}

const findPatternByNextSiblings = (ev : Event) => {
    const standards = getPath(ev).map((el : Element, i : number, arr : Element[]) => {
        if (el.nextElementSibling) {
            
            const tempSelector = arr.slice(0,i).reverse().map((el : Element) => {
                const sameLocalNameElementArray = Array.from(el.parentElement.children).filter(childElement => childElement.localName === el.localName);
                for (let i in sameLocalNameElementArray ) {
                    if (sameLocalNameElementArray[i] === el) {
                        return el.classList.length > 0 ? `${el.localName}.${Array.from(el.classList).join('.')}:nth-of-type(${Number(i)+1})` : `${el.localName}:nth-of-type(${Number(i)+1})`;
                    }
                }
            }).join('>');
            
            if (tempSelector && el.nextElementSibling.querySelector(tempSelector)) {

                const similarElement = el.nextElementSibling.querySelector(tempSelector);
                return `${el.localName} > ${tempSelector}`;
            }
        }
    }).filter(item => item !== undefined);
    return standards[standards.length-1];
}
const findPatternByPreviousSiblings = (ev : Event) => {
    const standards = getPath(ev).map((el : Element, i : number, arr : Element[]) => {
        if (el.previousElementSibling) {
            
            const tempSelector = arr.slice(0,i).reverse().map((el : Element) => {
                const sameLocalNameElementArray = Array.from(el.parentElement.children).filter(childElement => childElement.localName === el.localName);
                for (let i in sameLocalNameElementArray ) {
                    if (sameLocalNameElementArray[i] === el) {
                        return el.classList.length > 0 ? `${el.localName}.${Array.from(el.classList).join('.')}:nth-of-type(${Number(i)+1})` : `${el.localName}:nth-of-type(${Number(i)+1})`;
                    }
                }
            }).join('>');
            
            if (tempSelector && el.previousElementSibling.querySelector(tempSelector)) {

                const similarElement = el.previousElementSibling.querySelector(tempSelector);
                return `${el.localName} > ${tempSelector}`;
            }
        }
    }).filter(item => item !== undefined);
    
    return standards[standards.length-1];
}

const tableScrapping = (ev : Event) => {

    const path = [];
    const fullPath = [];

    for (let i = 0; i<getPath(ev).length; i++){
        const el = getPath(ev)[i];
        if (!el.localName) break;
        if (el.id) fullPath.push(`${el.localName}#${el.id}`);
        else if (el.className) fullPath.push(`${el.localName}.${Array.from(el.classList).join('.')}`);
        else fullPath.push(el.localName);
    }

    for (let i = 0; i<getPath(ev).length; i++){
        const el = getPath(ev)[i];
        if (!el.localName) break;
        path.push(el.localName);
    }
    let pattern = path.reverse().join('>');
    return pattern;
}

const getPath = (ev : Event) => {
    const arr = [];
    let el = ev.target as Element;
    while (el) {
        arr.push(el);
        el = el.parentElement;
    }
    return arr;
}