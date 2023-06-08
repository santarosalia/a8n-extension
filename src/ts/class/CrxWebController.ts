import { createWindow, currentWindowTabs, findTabsByTitle, findTabsByIndex, findTabsByUrl, closeWindow } from "@CrxApi";
import { Browser, Page, ElementHandle, Frame, KeyInput } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'

export class BrowserController {
    private window : chrome.windows.Window
    private tab : chrome.tabs.Tab
    private instance : Browser
    private variable : string
    private page : Page
    private elementControllerArray : ElementController[]
    private frame : Frame

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
        this.frame = this.page.mainFrame();
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
            case BrowserAction.OPEN : {
                await this.open();
                await this.goto(msg.parameter.url);
                break;
            }
            case BrowserAction.CONNECT : {
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
                        break;
                    }
                }
                break;
            }
            case BrowserAction.CLOSE : {
                await closeWindow(this.window.id);
                break;
            }
            case BrowserAction.SWITCH_FRAME : {
                await this.switchFrame(msg);
            }
            case BrowserAction.RESET_FRAME : {
                await this.resetFrame();
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
            case ElementAction.WAIT : {
                return elementController.variable;
                break;
            }
            case ElementAction.CLICK : {
                await elementController.click();
                break;
            }
            case ElementAction.HOVER : {
                await elementController.hover();
                break;
            }
            case ElementAction.TYPE : {
                await elementController.type(value);
                break;
            }
            case ElementAction.READ : {
                const result = await elementController.read();
                return result;
            }
            case ElementAction.EXISTS : {
                const exists = elementController ? true : false;
                return exists;
            }
            case ElementAction.GET_PROPERTY : {
                const result = await elementController.getProperty(value);
                return result;
            }
            case ElementAction.PRESS : {
                await elementController.press(value as KeyInput);
                break;
            }
            case ElementAction.BOUNDING_BOX : {
                const result = await elementController.boundingBox();
                return result;
            }
            case ElementAction.READ_TAG : {
                const result = await elementController.readTag();
                return result;
            }
            case ElementAction.BOX_MODEL : {
                const result = await elementController.boxModel();
                return result;
            }
            case ElementAction.CLEAR : {
                await elementController.clear();
                break;
            }
        }
    }

    private async waitFor(msg : RequestMessage) {
        const locator = msg.parameter.locator;
        const locatorType = msg.parameter.locatorType;
        const returnVariable = msg.returnVariable;
        const timeout = msg.parameter.timeout;
        let elementHandle : ElementHandle;

        switch(locatorType) {
            case LocatorType.XPATH : {
                elementHandle = await this.frame.waitForXPath(locator, {
                    timeout : timeout
                });
                break;
            }
            case LocatorType.CSS_SELECTOR : {
                elementHandle = await this.frame.waitForSelector(locator, {
                    timeout : timeout
                });
                break;
            }
        }
        return new ElementController(elementHandle, returnVariable);
    }
    private async switchFrame(msg : RequestMessage) {
        const frameName = msg.parameter.frameName;
        const frames = this.frame.childFrames();
        this.frame = frames.find(frame => frame.name() === frameName);
    }
    private async resetFrame() {
        this.frame = this.page.mainFrame();
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

export enum BrowserAction {
    OPEN = 'open',
    CONNECT = 'connect',
    SWITCH_FRAME = 'switchframe',
    RESET_FRAME = 'resetframe',
    CLOSE = 'close'
}

export enum ElementAction {
    WAIT = 'wait',
    CLICK = 'click',
    HOVER = 'hover',
    TYPE = 'type',
    READ = 'read',
    EXISTS = 'exists',
    GET_PROPERTY = 'getproperty',
    PRESS = 'press',
    BOUNDING_BOX = 'boundingbox',
    READ_TAG = 'readtag',
    BOX_MODEL = 'boxmodel',
    CLEAR = 'clear'
}

export type Action = BrowserAction | ElementAction;

export enum ConnectOptionType {
    URL = 'url',
    TITLE = 'title',
    INDEX = 'index'
}
export enum LocatorType {
    XPATH = 'xpath',
    CSS_SELECTOR = 'css'
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
    frameName? : string
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
    async getProperty(propertyName : string) {
        const property = await (await this.elementHandle.getProperty(propertyName)).jsonValue() as string;
        return property;
    }
    async press(keyInput : KeyInput) {
        await this.elementHandle.press(keyInput);
    }
    async boundingBox() {
        const boundingBox = await this.elementHandle.boundingBox();
        return boundingBox;
    }
    async readTag() {
        const tag = await this.elementHandle.evaluate(node => node.tagName);
        return tag;
    }
    async boxModel() {
        const boxModel = await this.elementHandle.boxModel();
        return boxModel;
    }
    async clear() {
        await this.elementHandle.evaluate(node => node.textContent = '');
    }
}