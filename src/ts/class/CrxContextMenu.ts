import { sendMessageToServiceWorker, setItemFromLocalStorage } from "@CrxApi";
import { CrxContextMenuEvent } from "@CrxClass";
import { CRX_NEW_RECORD, EVENT } from "@CrxConstants";
import { dataScraping } from "@/ts/contents/DataScraping";
import { CRX_COMMAND } from "@CrxInterface";
const menu = [
    {
        title : '텍스트 읽기',
        value : 'readtext'
    },
    {
        title : '데이터스크래핑',
        value : 'datascrapping'
    },
    {
        title : '속성값 읽기',
        value : 'readattribute'
    },
    {
        title : '마우스 Hover',
        value : 'hover'
    },
    {
        title : '레코딩 내역창 열기',
        value : 'openview'
    }
]
class CrxContextMenu extends HTMLElement {
    x : number
    y : number
    ev : any

    constructor (x :number, y : number, ev : any) {
        super();
        this.x = x;
        this.y = y;
        this.ev = ev;
    }
    connectedCallback() {
        const ul = document.createElement('ul');
        
        menu.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item.title;
            li.setAttribute('value', item.value);
            li.addEventListener('click',this.clickEventHandler);
            ul.appendChild(li);
        });
        this.appendChild(ul);
    }

    disconnectedCallback() {
        // console.log('destroy')
    }

    show() {
        this.style.left = `${this.x}px`;
        this.style.top = `${this.y}px`;
        this.style.display = 'block';
    }

    hide() {
        if (window.top.document.querySelector('crx-contextmenu')) {
            window.top.document.querySelector('crx-contextmenu').remove();
        }
        Array.from(window.top.frames).forEach(frame => {
            try {
                frame.document.querySelector('crx-contextmenu').remove();
            } catch {}
        })
    }
    
    clickEventHandler = (ev : Event) => {
        const target = ev.target as Element;
        const contextMenuType = target.getAttribute('value');
        
        switch (contextMenuType) {
            case EVENT.DATASCRAPING : {
                dataScraping(this.ev);
                return;
            }
            case EVENT.OPENVIEW : {
                sendMessageToServiceWorker(CRX_COMMAND.CMD_OPEN_VIEW)
                return;
            }

            default : break;
        }
        const e = new CrxContextMenuEvent(this.ev, contextMenuType);
        setItemFromLocalStorage(CRX_NEW_RECORD,e);
    }
}

export default CrxContextMenu