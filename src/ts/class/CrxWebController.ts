import { createWindow, currentWindowTabs, findTabsByTitle, findTabsByIndex, findTabsByUrl } from "@CrxApi";
import { Browser, Page, ElementHandle } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'

export class BrowserController {
    private window : chrome.windows.Window
    private tab : chrome.tabs.Tab
    private instance : Browser
    private browser : string
    private variable : string
    private page : Page
    private elementControllerArray : ElementController[]

    constructor() {
        this.elementControllerArray = [];
    }

    get getVariable() {
        return this.variable;
    }
    get getElementControllerArray() {
        return this.elementControllerArray;
    }

    private async connect() {
        const transport = await ExtensionDebuggerTransport.create(this.tab.id);
        this.instance = await puppeteer.connect({
            transport : transport,
            defaultViewport : null
        });
        [this.page] = await this.instance.pages();
    }

    private async open() {
        this.window = await createWindow();
        [this.tab] = await currentWindowTabs(this.window.id);
        await this.connect();
    }
    private async goto(url : string) {
        await this.page.goto(url);
    }

    private async findTabByTitle(title : string) {
        [this.tab] = await findTabsByTitle(title);
        await this.connect();
    }

    private async findTabByIndex(index : number) {
        [this.tab] = await findTabsByIndex(this.window.id, index);
        await this.connect();
    }
    private async findTabByUrl(url : string) {
        [this.tab] = await findTabsByUrl(url);
        await this.connect();
    }
    async execute(msg : RequestMessage) {
        const result = await this.typeHandler(msg);
        return result;
    }

    private async typeHandler(msg : RequestMessage) {
        const type = msg.type;

        switch(type) {
            case Type.BROWSER : {
                await this.browserHandler(msg);

                if (msg.returnVariable) {
                    this.variable = msg.returnVariable;
                }
                break;
            }
            case Type.ELEMENT : {
                const result = await this.elementHandler(msg);
                return result;
            }
        }
    }

    private async browserHandler(msg : RequestMessage) {
        const action = msg.action;
        switch(action) {
            case Action.OPEN : {
                await this.open();
                await this.goto(msg.parameter.url)
                break;
            }
            case Action.CONNECT : {
                const connectOptionType = msg.parameter.connectOption.type;
                const connectOptionValue = msg.parameter.connectOption.value;
                switch (connectOptionType) {
                    case ConnectOptionType.URL : {
                        await this.findTabByUrl(connectOptionValue as string);
                        break;
                    }
                    case ConnectOptionType.TITLE : {
                        await this.findTabByTitle(connectOptionValue as string);
                        break;
                    }
                    case ConnectOptionType.INDEX : {
                        await this.findTabByIndex(connectOptionValue as number);
                    }

                }
            }
        }
    }

    private async elementHandler(msg : RequestMessage) {
        const action = msg.action;
        const locatorType = msg.parameter.locatorType;
        const locator = msg.parameter.locator;
        const returnVariable = msg.returnVariable;
        const targetVariable = msg.targetVariable;
        const value = msg.parameter.value;
        let elementController : ElementController;
        
        if (targetVariable) {
            elementController = this.elementControllerArray.find(elementController => elementController.variable === targetVariable);
        }

        if (!elementController) {
            elementController = await this.waitFor(msg);
            this.elementControllerArray.push(elementController);
        }
        switch(action) {
            case Action.WAIT : {
                return elementController.variable;
                break;
            }
            case Action.CLICK : {
                elementController.click();
                break;
            }
            case Action.HOVER : {
                elementController.hover();
                break;
            }
            case Action.TYPE : {
                elementController.type(value);
                break;
            }
            case Action.READ : {
                const result = elementController.read();
                return result;
            }

        }
    }

    private async waitFor(msg : RequestMessage) {
        const locator = msg.parameter.locator;
        const locatorType = msg.parameter.locatorType;
        const returnVariable = msg.returnVariable;

        let elementHandle : ElementHandle;

        switch(locatorType) {
            case LocatorType.XPATH : {
                elementHandle = await this.page.waitForXPath(locator);
                break;
            }
            case LocatorType.CSSSELECTOR : {
                elementHandle = await this.page.waitForSelector(locator);
                break;
            }
        }
        return new ElementController(elementHandle, returnVariable);
    }
}

export interface RequestMessage {
    targetVariable? : string
    type : Type,
    action : Action
    parameter : Parameter
    returnVariable? : string
}

export enum Type {
    BROWSER = 'Browser',
    ELEMENT = 'Element',
}

export enum Action {
    OPEN = 'open',
    CONNECT = 'connect',
    WAIT = 'wait',
    CLICK = 'click',
    HOVER = 'hover',
    TYPE = 'type',
    READ = 'read'
}

export enum ConnectOptionType {
    URL = 'url',
    TITLE = 'title',
    INDEX = 'index'
}
export enum LocatorType {
    XPATH = 'xpath',
    CSSSELECTOR = 'cssselector',
    ELEMENT = 'element'
}

export interface Parameter {
    timeout? : number
    url? : string
    connectOption? : {
        type : ConnectOptionType,
        value : string | number
    }
    locatorType? : LocatorType
    locator? : string
    value? : string
}

export class ElementController {
    elementHandle : ElementHandle
    variable : string

    constructor(elementHandle : ElementHandle, variable : string) {
        this.elementHandle = elementHandle;
        this.variable = variable;
    }
    async click() {
        await this.elementHandle.click();
    }
    async hover() {
        await this.elementHandle.hover();
    }
    async type(text : string) {
        await this.elementHandle.type(text);
    }
    async read() {
        const result = await (await this.elementHandle.getProperty('textContent')).jsonValue() as string;
        return result;
    }
}