import { getItemFromLocalStorage, sendMessageToServiceWorker, setItemFromLocalStorage } from "@CrxApi";
import { CRX_COMMAND, CRX_NEW_RECORD, CRX_STATE, EVENT } from "@CrxConstants";
import { dataScraping } from "@/ts/contents/DataScraping";
import { CRX_CONTEXT_MENU_TYPE } from "@CrxInterface";
import { CrxClickEvent } from "@CrxClass/CrxClickEvent";
import { CrxReadAttributeEvent } from "@CrxClass/CrxReadAttributeEvent";
import { CrxContextMenuEvent } from "@CrxClass/CrxContextMenuEvent";
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
        title : '숫자 페이지 버튼',
        value : EVENT.NEXTPAGENUMBER
    }
]
class CrxContextMenu extends HTMLElement {
    x : number
    y : number
    e : CrxClickEvent
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
                sendMessageToServiceWorker(CRX_COMMAND.CMD_SEND_NEXT_PAGE_BUTTON, this.e.linkTextXpath);
                return;
            }
            case EVENT.NEXTPAGENUMBER : {
                sendMessageToServiceWorker(CRX_COMMAND.CMD_SEND_NEXT_PAGE_NUMBER, this.getXPath(this.e.target.closest('div')));
                return;
            }
            case EVENT.HOVER : {
                const e = new CrxReadAttributeEvent(this.e);
                setItemFromLocalStorage(CRX_NEW_RECORD, e);
                return;
            }
            
            default : break;
        }
        const e = new CrxContextMenuEvent(this.e, contextMenuValue);
        setItemFromLocalStorage(CRX_NEW_RECORD,e);
    }

    getXPath(el : Element) {
        let nodeElem = el;
        let isFlexibleXpath = /^-?\d+$/.test(nodeElem.id.slice(-1)); // 마지막 두자리가 숫자일경우 가변될 xpath라고 판단하기 위한 변수

        if (nodeElem.id && !isFlexibleXpath) {
            return `//*[@id="${nodeElem.id}"]`; //선택된 엘리먼트의 id가 있을 경우 id 형식의 xpath를 바로 리턴
        }

        const parts = [];
        while (nodeElem && nodeElem.nodeType === Node.ELEMENT_NODE) {
            let nbOfPreviousSiblings = 0;
            let hasNextSiblings = false;
            let sibling = nodeElem.previousSibling;

            while (sibling) {
                if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName === nodeElem.nodeName) {
                    nbOfPreviousSiblings++;
                }
                sibling = sibling.previousSibling;
            }
            sibling = nodeElem.nextSibling;

            while (sibling) {
                if (sibling.nodeName === nodeElem.nodeName) {
                    hasNextSiblings = true;
                    break;
                }
                sibling = sibling.nextSibling;
            }

            const prefix = nodeElem.prefix ? nodeElem.prefix + ':' : '';
            const nth = nbOfPreviousSiblings || hasNextSiblings ? `[${nbOfPreviousSiblings + 1}]` : '';
            isFlexibleXpath = /^-?\d+$/.test(nodeElem.id.slice(-1));

            if (nodeElem.id && !isFlexibleXpath) {
                var nodeCount = document.querySelectorAll(`#${nodeElem.id}`);
                if (nodeCount.length == 1) {
                    parts.push(`/*[@id="${nodeElem.id}"]`); //부모노드 중 id가 있을 경우 id를 담아준 후 노드검색을 멈춤
                    break;
                } else {
                    parts.push(prefix + nodeElem.localName + nth);
                }
            } else {
                parts.push(prefix + nodeElem.localName + nth);
            }

            nodeElem = nodeElem.parentNode as Element;
        }
        return parts.length ? '/' + parts.reverse().join('/') : '';
    }
}

export default CrxContextMenu