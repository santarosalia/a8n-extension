import { CrxMousemoveEvent } from "@CrxClass";

class CrxSelectorDisplay extends HTMLElement {
    x : number
    y : number
    e : CrxMousemoveEvent
    textContent: string;
    
    constructor (e : CrxMousemoveEvent) {
        super();
        this.e = e;
    }
    connectedCallback() {
        let x = this.e.clientX + window.scrollX;
        let y = this.e.clientY - 50 + window.scrollY;

        if (this.e.view.frameElement) {
            const frameStack = [];
            let frameElement = this.e.view.frameElement as HTMLFrameElement;
            while (frameElement) {
                let text : string;

                if (frameElement.id) {
                    text = `ID : ${frameElement.id}`;
                } else if (frameElement.name) {
                    text = `Name : ${frameElement.name}`;
                } else {
                    text = 'Frame 을 확인해주세요.';
                }

                frameStack.push(text);

                const frameRect = frameElement.getBoundingClientRect();

                // x += frameRect.left;
                // y += frameRect.top - 20;
                y -=20;

                frameElement = frameElement.contentWindow.parent.frameElement as HTMLFrameElement;
            }

            frameStack.reverse();

            frameStack.forEach((text,idx) => {
                const span = document.createElement('span');
                const br = document.createElement('br');
                span.textContent = `Frame ${idx+1} ${text}`;
                this.appendChild(span);
                this.appendChild(br);
            });
        }

        const xpath = this.e.xpath;
        const span = document.createElement('span');
        span.textContent = xpath;
        this.appendChild(span);

        if (y < window.scrollY ) {
            y = this.e.clientY + 20 + window.scrollY;
        }

        this.x = x;
        this.y = y;
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
        if (window.top.document.querySelector('crx-selector-display')) {
            window.top.document.querySelector('crx-selector-display').remove();
        }
        Array.from(window.top.frames).forEach(frame => {
            try {
                frame.document.querySelector('crx-selector-display').remove();
            } catch {}
        })
    }
}

export default CrxSelectorDisplay