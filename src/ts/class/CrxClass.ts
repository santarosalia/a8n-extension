import { EventInfo, FrameStack, Locator, LocatorType } from '@CrxInterface';
import { EVENT, getLocatorInfo } from '@CrxConstants';

export class CapturedEventDetails {
    AT_TARGET : number
    BUBBLING_PHASE : number
    CAPTURING_PHASE : number
    NONE : number
    bubbles : boolean
    cancelBubble : boolean
    cancelable : boolean
    composed : boolean
    currentTarget : Window
    data : string
    defaultPrevented: boolean
    detail: number
    eventPhase: number
    inputType: string
    isComposing: boolean
    isTrusted: boolean
    returnValue: boolean
    srcElement: Element
    target: Element
    timeStamp: number
    type: string
    which: number
    altKey: boolean
    altitudeAngle: number
    azimuthAngle: number
    button: number
    buttons: number
    clientX: number
    clientY: number
    ctrlKey: boolean
    height: number
    isPrimary: boolean
    layerX: number
    layerY: number
    metaKey: boolean
    movementX: number
    movementY: number
    offsetX: number
    offsetY: number
    pageX: number
    pageY: number
    pointerId: number
    pointerType: string
    pressure: number
    screenX: number
    screenY: number
    shiftKey: boolean
    tangentialPressure: number
    tiltX: number
    tiltY: number
    twist: number
    width: number
    x: number
    y: number
    charCode: number
    code: string
    key: string
    keyCode: number
    location: number
    repeat : boolean
    selectedIndex : number
    attribute : Locator
    constructor (ev : Event | CapturedEvent) {
        this.getDetails(ev);
    }

    getDetails(ev : Event | CapturedEvent) {
        for (let k in ev) {
          this[k] = ev[k];
        }
    }
}

export class CapturedEvent extends CapturedEventDetails {
    id : string;
    class : string[];
    name : string;
    value : string | number;
    locator : Locator
    xpath : string;
    fullXpath : string;
    linkTextXpath : string;
    cssSelector : string;
    frameStack : FrameStack[];
    localName : string;
    textContent : string;
    target : Element;
    info : EventInfo[]
    image : string
    rect : any
    view : Window

    constructor (ev : Event | CapturedEvent) {
        super(ev);
        if (ev !== null) {
            this.target = ev.target as Element;
            this.id = this.target.id;
            this.class = this.target.classList ? Array.from(this.target.classList).filter(item => item !== 'crx-highlight') : null;
            this.name = this.target.getAttribute('name');
            this.value = (ev.target as HTMLInputElement).value;
            this.localName = this.target.localName;
            this.textContent = this.target.textContent;
            this.rect = this.getBoundingClientRect();
            this.locator = {
                type : LocatorType.Xpath,
                value : this.getXPath(this.target)
            };
            this.xpath = this.getXPath(this.target);
            this.fullXpath = this.getFullXpath(this.target);
            this.linkTextXpath = this.getLinkText(this.target);
            this.cssSelector = this.getCssSelector(this.target);
            this.frameStack = this.getFrameStack();
        }
    }

    getXPath(el : Element) {
        try {
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
                
                nodeElem = nodeElem.parentElement;
            }
            return parts.length ? '/' + parts.reverse().join('/') : '';
        } catch (e) {

        }
    }

    getFullXpath(element : Element) {
        try {
            if (element.tagName === 'BODY') {
                return '/html/body'
            } else {
                if (element.parentNode === null) return;

                const sameTagSiblings = Array.from(element.parentNode.childNodes).filter(e => e.nodeName === element.nodeName);
                const idx = sameTagSiblings.indexOf(element);
            
                return this.getFullXpath(element.parentElement) +
                  '/' +
                  element.tagName.toLowerCase() +
                  (sameTagSiblings.length > 1 ? `[${idx + 1}]` : '');
            }
        } catch (e) {

        }
    }

    getLinkText(el : Element) {
        try {
            if (!el.hasChildNodes()) return '';
            let textContent;
            textContent = el.firstChild.textContent;
            // textContent 에 double quotes 있을 때 xpath 에서는 escape 가 안됨. concat으로 잘라줘야 함.
            if (textContent.includes('"')) {
                let concatText = 'concat(';
                textContent.split('"').forEach((text,i)=>{
                    concatText += `"${text}"`;
                    concatText += i == textContent.split('"').length - 1 ? ')' : `,'"',`;
                });
                textContent = concatText;
            } else {
                textContent = `"${el.firstChild.textContent}"`;
            }
            let result;
            result = document.evaluate(`//*[text()=${textContent}]`, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            for (var i = 0; i < result.snapshotLength; i++) {
                // if el is anchor element, result value is sometimes child of anchor node
                // if anchor node has multiple children with texts, getLinkText() can not return sussefully
                if (el == result.snapshotItem(i) || el.firstElementChild == result.snapshotItem(i))  // snapshotItem() starts from index 0
                    break;
            }

            if (i < result.snapshotLength)  // found matching element
                return result.snapshotItem(i).tagName == 'A' ? `(//*[text()=${textContent}])[${i + 1}]` : `(//*[text()=${textContent}])[${i + 1}]/..`;
            else                            // no matching element
                return '';
        } catch (e) {

        }
    }

    getCssSelector(elSrc : Element) {
        try {
            if (!(elSrc instanceof Element)) return '';

            let sSel = '',
                aAttr = ["name", "value", "title", "placeholder", "data-*"], // Common attributes
                aSel = [];

            // Derive selector from element
            const getSelector = function (el :Element) {
                // 1. Check ID first
                // NOTE: ID must be unique amongst all IDs in an HTML5 document.
                // https://www.w3.org/TR/html5/dom.html#the-id-attribute
                if (el.id) {
                    aSel.unshift(`#${el.id}`);
                    return true;
                }
                aSel.unshift((sSel = el.nodeName.toLowerCase()));
                // 2. Try to select by classes
                if (el.className) {
                    aSel[0] = sSel += "." + el.className.trim().replace(/ +/g, ".");
                    if (uniqueQuery()) return true;
                }
                // 3. Try to select by classes + attributes
                for (var i = 0; i < aAttr.length; ++i) {
                    if (aAttr[i] === "data-*") {
                        // Build array of data attributes
                        var aDataAttr = [].filter.call(el.attributes, (attr : any) => {
                            return attr.name.indexOf("data-") === 0;
                        });
                        for (var j = 0; j < aDataAttr.length; ++j) {
                            aSel[0] = sSel +=
                                "[" + aDataAttr[j].name + '="' + aDataAttr[j].value + '"]';
                            if (uniqueQuery()) return true;
                        }
                    } else if (el[aAttr[i]]) {
                        aSel[0] = sSel += "[" + aAttr[i] + '="' + el[aAttr[i]] + '"]';
                        if (uniqueQuery()) return true;
                    }
                }
                // 4. Try to select by nth-of-type() as a fallback for generic elements
                let elChild = el,
                    n = 1;
                while ((elChild = elChild.previousElementSibling)) {
                    if (elChild.nodeName === el.nodeName) ++n;
                }
                aSel[0] = sSel += ":nth-of-type(" + n + ")";
                if (uniqueQuery()) return true;
                // 5. Try to select by nth-child() as a last resort
                elChild = el;
                n = 1;
                while ((elChild = elChild.previousElementSibling)) ++n;
                aSel[0] = sSel = sSel.replace(
                    /:nth-of-type\(\d+\)/,
                    n > 1 ? ":nth-child(" + n + ")" : ":first-child"
                );
                if (uniqueQuery()) return true;
                return false;
            };

            // Test query to see if it returns one element
            const uniqueQuery = () => {
                try {
                    return (document.querySelectorAll(aSel.join(">") || null).length === 1);
                } catch {
                    return false;
                }

            };
            
            return getSelector(elSrc) ? aSel.join(" > ") : '';
        } catch (e) {

        }
    }

    getFrameStack() {
        try {
            const frameStack = [];
            let fe = window.frameElement as HTMLFrameElement;
            let frameInedx = 0;
            while (fe) {
                frameStack.push({
                    frameIndex : frameInedx++,
                    id : fe.getAttribute('id'),
                    name : fe.getAttribute('name'),
                    element : fe
                });
                fe = fe.contentWindow.parent.frameElement as HTMLFrameElement;
            }
            return frameStack;
        } catch (e) {

        }
    }
    getBoundingClientRect() {
        const rect = this.target.getBoundingClientRect();
        this.getFrameStack().forEach(frame => {
            const frameRect = frame.element.getBoundingClientRect();
            rect.x += frameRect.x
            rect.y += frameRect.y
        });

        return JSON.parse(JSON.stringify(rect));
    }

}


export class CrxInfo {
    VIEW_WINDOW_ID : number;
    TARGET_TAB : chrome.tabs.Tab;
    RECORDING_TARGET_WINDOW_ID : number;
    TARGET_TABS : chrome.tabs.Tab[];
    LAUNCHER_TAB_ID : number;
    LAUNCHER_WINDOW_ID : number;
    SELECTOR_INJECT_INTERVAL : number;
    CONTROLLER_WINDOW_ID : number
    constructor () {
        
    }
}

export class CrxBrowserOpenEvent extends CapturedEvent {
    constructor (url : string) {
        super(null);
        this.info = this.getInfo();
        this.type = EVENT.OPENBROWSER;
        this.value = url;
        this.frameStack = [];
    }
    getInfo() {
        return [
            {
                type : 'input',
                displayName : 'URL',
                value : 'value'
            }
        ]
    }
}


export class CrxClickEvent extends CapturedEvent {
    info : EventInfo[]

    constructor (ev : Event) {
        super(ev);
        this.info = this.getInfo();
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

export class CrxMousemoveEvent extends CapturedEvent {
    constructor (ev : Event) {
        super(ev);
    }
}

export class CrxInputEvent extends CapturedEvent {
    constructor (ev : Event) {
        super(ev);
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'input',
                displayName : '값',
                value : 'value'
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

export class CrxSelectEvent extends CapturedEvent {
    constructor (ev : Event) {
        super(ev);
        this.type = EVENT.SELECT;
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'input',
                displayName : '값',
                value : 'value'
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

export class CrxHoverEvent extends CapturedEvent {
    constructor (ev : Event) {
        super(ev);
        this.type = EVENT.HOVER;
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'input',
                displayName : '값',
                value : 'value'
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

export class CrxKeyEvent extends CapturedEvent {
    constructor (ev : Event) {
        super(ev);
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'readonly',
                displayName : '키',
                value : 'key'
            }
        ]
    }
}

export class CrxMoveTabEvent extends CapturedEvent {
    constructor (tabIndex : number) {
        super(null);
        this.type = EVENT.MOVETAB;
        this.value = tabIndex;
        this.frameStack = [];
        this.info = this.getInfo();
    }
    getInfo() {
        return [
            {
                type : 'readonly',
                displayName : '탭 인덱스',
                value : 'value'
            }
        ]
    }
}

export class CrxPopupEvent extends CapturedEvent {
    constructor () {
        super(null);
        this.type = EVENT.POPUP;
        this.frameStack = [];
        this.info = this.getInfo();
    }
    getInfo() {
        return [
        ]
    }
}

export class CrxContextMenuEvent extends CapturedEvent {
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

export class CrxReadAttributeEvent extends CapturedEvent {
    info : EventInfo[]

    constructor (ev : CrxClickEvent) {
        super(ev);
        this.info = this.getInfo();
        this.type = EVENT.HOVER;
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

export class CrxDataScrapingEvent extends CapturedEvent {

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

export class CrxWebController {
    browser : string
    locator : Locator
    value : string | number
    eventType : string

    constructor (payload : any) {
        this.browser = payload.browser;
        this.locator = payload.locator;
        this.value = payload.value;
        this.eventType = payload.eventType;
        
    }

    execute() {
        const el = this.getElement() as HTMLInputElement;
        el.value = '1ga'
    }

    getElement() {
        let el : Element;
        const timeout = 5000;
        const now = Date.now();
        
        while (now + timeout > Date.now()) {
            switch (this.locator.type) {
                case 'cssSelector' : {
                    el = document.querySelector(this.locator.value);
                    break;
                }
                case 'xpath' : {
                    el = document.evaluate(this.locator.value, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).singleNodeValue as Element;
                    break;
                }
            }
            console.log(`try ${this.locator.value}`)
            if (el) break;
        }

        if (!!!el) throw new Error('not found');
        
        return el;
    }
}