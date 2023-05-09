import { getItemFromLocalStorage, sendMessageToServiceWorker, setItemFromLocalStorage } from "@CrxApi";
import { CrxClickEvent, CrxContextMenuEvent } from "@CrxClass";
import { CRX_NEW_RECORD, CRX_STATE, EVENT } from "@CrxConstants";
import { dataScraping } from "@/ts/contents/DataScraping";
import { CRX_COMMAND, CRX_CONTEXT_MENU_TYPE } from "@CrxInterface";
const normalMenu = [
    {
        title : '텍스트 읽기',
        value : EVENT.READTEXT
    },
    {
        title : '데이터스크래핑',
        value : EVENT.DATASCRAPING
    },
    {
        title : '속성값 읽기',
        value : EVENT.READATTRIBUTE
    },
    {
        title : '마우스 Hover',
        value : EVENT.HOVER
    },
    {
        title : '레코딩 내역창 열기',
        value : EVENT.OPENVIEW
    }
]
const multiPageMenu = [
    {
        title : '다음 페이지 버튼',
        value : EVENT.NEXTPAGEBUTTON
    },
    {
        title : '다음 페이지 숫자',
        value : EVENT.NEXTPAGENUMBER
    }
]
class CrxContextMenu extends HTMLElement {
    x : number
    y : number
    e : any
    contextMenuType : CRX_CONTEXT_MENU_TYPE

    constructor (x :number, y : number, e : CrxClickEvent, contextMenuType : CRX_CONTEXT_MENU_TYPE) {
        super();
        this.x = x;
        this.y = y;
        this.e = e;
        this.contextMenuType = contextMenuType;
    }
    connectedCallback() {
        const ul = document.createElement('ul');
        let menu : any[];
        switch (this.contextMenuType) {
            case CRX_CONTEXT_MENU_TYPE.NORMAL : {
                menu = normalMenu;
                break;
            }
            case CRX_CONTEXT_MENU_TYPE.MULTIPAGE : {
                menu = multiPageMenu;
                break;
            }
        }
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
        const contextMenuValue = target.getAttribute('value');
        switch (contextMenuValue) {
            case EVENT.DATASCRAPING : {
                dataScraping(this.e);
                return;
            }
            case EVENT.OPENVIEW : {
                sendMessageToServiceWorker(CRX_COMMAND.CMD_OPEN_VIEW);
                return;
            }
            case EVENT.NEXTPAGEBUTTON : {
                sendMessageToServiceWorker(CRX_COMMAND.CMD_SEND_NEXT_PAGE_BUTTON, this.e.xpath);
                return;
            }
            case EVENT.NEXTPAGENUMBER : {
                sendMessageToServiceWorker(CRX_COMMAND.CMD_SEND_NEXT_PAGE_NUMBER, this.e.xpath);
                return;
            }

            default : break;
        }
        const e = new CrxContextMenuEvent(this.e, contextMenuValue);
        setItemFromLocalStorage(CRX_NEW_RECORD,e);
    }
}

export default CrxContextMenu