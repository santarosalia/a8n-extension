import { CapturedEventDetails } from "@/ts/interface/CrxInterface";

export default class CapturedEvent {
    index : number;
    type : string;
    id : string;
    class : string[];
    name : string;
    value : string;
    xpath : string;
    fullXpath : string;
    linkTextXpath : string;
    cssSelector : string;
    frameStack : string[];
    x : number;
    y : number;
    pageX : number;
    pageY : number;
    clientX : number;
    clientY : number;
    ctrlKey : boolean;
    shiftKey : boolean;
    scrollX : number;
    scrollY : number;

    constructor (details : CapturedEventDetails) {
        this.index = details.index;
        this.type = details.type;
        this.id = details.target.id;
        this.class = details.target.classList ? Array.from(details.target.classList) : null;
        this.name = details.target.getAttribute('name');
        this.value = details.target.getAttribute('value');
        this.xpath = this.getXPath(details.target);
        this.fullXpath = this.getFullXpath(details.target);
        this.linkTextXpath = this.getLinkText(details.target);
        this.cssSelector = this.getCssSelector(details.target);
        this.frameStack = this.getFrameStack();
        this.x = details.x;
        this.y = details.y;
        this.pageX = details.pageX;
        this.pageY = details.pageY;
        this.clientX = details.clientX;
        this.clientY = details.clientY;
        this.ctrlKey = details.ctrlKey;
        this.shiftKey = details.shiftKey;
        this.scrollX = window.scrollX;
        this.scrollY = window.scrollY;
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
                if (typeof nodeElem.parentNode == "string") {
                    nodeElem = nodeElem.parentNode;
                } else {
                    nodeElem = null;
                }
                nodeElem = nodeElem.parentElement;
            }
            return parts.length ? '/' + parts.reverse().join('/') : '';
        } catch (e) {
            
        }
    }

    getFullXpath(element : HTMLElement) {
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

    getLinkText(el : HTMLElement) {
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

    getCssSelector(elSrc : HTMLElement) {
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

            // // Walk up the DOM tree to compile a unique selector
            // while (elSrc.parentNode) {
            //   if (getSelector(elSrc)) return aSel.join(" > ");
            //   elSrc = elSrc.parentNode;
            // }

            return getSelector(elSrc) ? aSel.join(" > ") : '';
        } catch (e) {

        }
    }

    getFrameStack() {
        try {
            const frameStack = [];
            let fe = window.frameElement;
            while (fe) {
                frameStack.push(fe.getAttribute('id') ? fe.getAttribute('id') : fe.getAttribute('name'));
                fe = fe.contentWindow.parent.frameElement;
            }
            return frameStack;
        } catch (e) {

        }
    }
}