export default class CapturedEvent {
    constructor (details) {
        this.type = details.type;
        this.id = details.target.id;
        this.class = details.target.classList ? Array.from(details.target.classList) : null;
        this.name = details.target.name;
        this.value = details.target.value;
        this.xpath = this.getXPath(details.target);
        this.fullXpath = this.getFullXpath(details.target);
        this.linkTextXpath = this.getLinkText(details.target);
        this.cssSelector = this.getCssSelector(details.target);
        this.frameStack = this.getFrameStack(details.target);
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
        this.index = details.index;
    }

    getXPath(el) {
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
    
                nodeElem = nodeElem.parentNode;
            }
            return parts.length ? '/' + parts.reverse().join('/') : '';
        } catch (e) {
            
        }
    }

    getFullXpath(element){
        try {
            if (element.tagName === 'BODY') {
                return '/html/body'
                } else {
                    if (element.parentNode === null) return;
                const sameTagSiblings = Array.from(element.parentNode.childNodes).filter(e => e.nodeName === element.nodeName);
                const idx = sameTagSiblings.indexOf(element);
            
                return this.getFullXpath(element.parentNode) +
                  '/' +
                  element.tagName.toLowerCase() +
                  (sameTagSiblings.length > 1 ? `[${idx + 1}]` : '');
            }
        } catch (e) {

        }
    }

    getLinkText(el) {
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

    getCssSelector(elSrc) {
        try {
            
            if (!(elSrc instanceof Element)) return '';
            var sSel,
                aAttr = ["name", "value", "title", "placeholder", "data-*"], // Common attributes
                aSel = [];

            // Derive selector from element
            var getSelector = function (el) {
                // 1. Check ID first
                // NOTE: ID must be unique amongst all IDs in an HTML5 document.
                // https://www.w3.org/TR/html5/dom.html#the-id-attribute
                if (el.id) {
                    aSel.unshift("#" + el.id);
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
                        var aDataAttr = [].filter.call(el.attributes, function (attr) {
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
                var elChild = el,
                    sChild,
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
            var uniqueQuery = function () {
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

    getFrameStack(el) {
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