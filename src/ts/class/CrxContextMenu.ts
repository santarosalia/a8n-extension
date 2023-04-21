const menu = [
    {
        title : 'title1',
        value : 'val1'
    },
    {
        title : 'title2',
        value : 'val2'
    }
]
class CrxContextMenu extends HTMLElement {
    x : number
    y : number
    constructor (x :number, y : number) {
        super();
        this.x = x;
        this.y = y;
    }
    connectedCallback() {
        const ul = document.createElement('ul');
        
        menu.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item.title;
            ul.appendChild(li);
        });
        this.appendChild(ul);
        
        this.show();
    }

    disconnectedCallback() {
        console.log('destroy')
    }

    show() {
        this.style.top = `${this.y}px`;
        this.style.left = `${this.x}px`;
        this.style.display = 'block';
    }

    hide() {
        this.remove();
    }
}

export default CrxContextMenu