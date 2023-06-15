import { createWindow, currentWindowTabs, findTabsByTitle, findTabsByIndex, findTabsByUrl, closeWindow, maximizeWindow, minimizeWindow } from "@CrxApi";
import { Browser, Page, ElementHandle, Frame, KeyInput, BoundingBox, BoxModel } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'

export class BrowserController {
    private window : chrome.windows.Window
    private tab : chrome.tabs.Tab
    private instance : Browser
    private instanceId : string
    private page : Page
    private elementControllerArray : ElementController[]
    private frame : Frame

    constructor() {
        this.elementControllerArray = [];
    }

    get getInstanceId() {
        return this.instanceId;
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
    private async goTo(url : string) {
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
    private async maximize() {
        await maximizeWindow(this.window.id);
    }
    private async minimize() {
        await minimizeWindow(this.window.id);
    }
    private async scrollTo(x : number, y : number) {
        await this.page.mouse.wheel({
            deltaX : x,
            deltaY : y
        });
    }
    private async back() {
        await this.page.goBack();
    }
    private async handleAlert() {
        this.page.on('dialog', dialog => {
            dialog.accept();
        });
    }
    async execute(msg : RequestMessage) {
        const result = await this.actionHandler(msg);
        return result;
    }

    private async actionHandler(msg : RequestMessage) {
        const action = msg.action;
        const value = msg.parameter.value;
        const x = msg.parameter.x;
        const y = msg.parameter.y;
        const returnInstanceId = msg.returnInstanceId;
        const targetInstanceId = msg.targetInstanceId;
        const bool = msg.parameter.bool;

        let elementController : ElementController;
        const isElement = Object.values(ElementAction).includes(action as any);

        if (isElement) {
            if (targetInstanceId) {
                elementController = this.elementControllerArray.find(elementController => elementController.instanceId === targetInstanceId);
            }
    
            if (!elementController) {
                elementController = await this.waitFor(msg);
                this.elementControllerArray.push(elementController);
            }
        }

        if (!isElement && returnInstanceId) {
            this.instanceId = returnInstanceId;
        }

        switch(action) {
            case BrowserAction.OPEN : {
                await this.open();
                await this.goTo(msg.parameter.url);
                break;
            }
            case BrowserAction.CONNECT : {
                const connectOptionType = msg.parameter.connectOption.type;
                const connectOptionValue = msg.parameter.connectOption.value;
                switch (connectOptionType) {
                    case ConnectOptionType.URL : {
                        await this.findTabByUrl(connectOptionValue);
                        break;
                    }
                    case ConnectOptionType.TITLE : {
                        await this.findTabByTitle(connectOptionValue);
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
            case BrowserAction.GO_TO : {
                await this.goTo(value as string);
                break;
            }
            case BrowserAction.BACK : {
                await this.back();
                break;
            }
            case BrowserAction.MAXIMIZE : {
                await this.maximize();
                break;
            }
            case BrowserAction.MINIMIZE : {
                await this.minimize();
                break;
            }
            case BrowserAction.SCROLL_TO : {
                await this.scrollTo(x, y);
                break;
            }
            case BrowserAction.SWITCH_TAB : {
                await this.findTabByIndex(value as number);
                break;
            }
            case ElementAction.WAIT : {
                return elementController.instanceId;
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
                await elementController.type(value as string);
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
                const result = await elementController.getProperty(value as string);
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
            case ElementAction.SET_CHECK_BOX_STATE : {
                await elementController.setCheckBoxState(bool);
                break;
            }
            case ElementAction.SET_SELECT_BOX_VALUE : {
                await elementController.setSelectBoxValue(value as string);
                break;
            }
        }

    }

    private async waitFor(msg : RequestMessage) {
        const locator = msg.parameter.locator;
        const locatorType = msg.parameter.locatorType;
        const returnVariable = msg.returnInstanceId;
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
    targetInstanceId? : string
    action : Action
    parameter : Parameter
    returnInstanceId? : string
}

export interface ResponseMessage {
    status : Status,
    value : string | boolean | BoundingBox | BoxModel,
    
}

export enum Status {
    SUCCESS = 'success',
    ERROR = 'error',
}


export enum BrowserAction {
    OPEN = 'open',
    CONNECT = 'connect',
    SWITCH_FRAME = 'switchFrame',
    RESET_FRAME = 'resetFrame',
    CLOSE = 'close',
    MAXIMIZE = 'maximize',
    MINIMIZE = 'minimize',
    SCROLL_TO = 'scrollTo',
    GO_TO = 'goTo',
    BACK = 'back',
    SWITCH_TAB = 'switchTab'
}

export enum ElementAction {
    WAIT = 'wait',
    CLICK = 'click',
    HOVER = 'hover',
    TYPE = 'type',
    READ = 'read',
    EXISTS = 'exists',
    GET_PROPERTY = 'getProperty',
    PRESS = 'press',
    BOUNDING_BOX = 'boundingBox',
    READ_TAG = 'readTag',
    BOX_MODEL = 'boxModel',
    CLEAR = 'clear',
    SET_CHECK_BOX_STATE = 'setCheckBoxState',
    SET_SELECT_BOX_VALUE = 'setSelectBoxValue'
}

export type Action = BrowserAction | ElementAction;

export enum ConnectOptionType {
    URL = 'url',
    TITLE = 'title'
}
export enum LocatorType {
    XPATH = 'xpath',
    CSS_SELECTOR = 'cssSelector'
}

export interface Parameter {
    timeout? : number
    url? : string
    connectOption? : {
        type : ConnectOptionType,
        value : string
    }
    locatorType? : LocatorType
    locator? : string
    value? : string | number
    frameName? : string
    bool? : boolean
    x? : number
    y? : number
}

export class ElementController {
    elementHandle : ElementHandle
    instanceId : string

    constructor(elementHandle : ElementHandle, instanceId : string) {
        this.elementHandle = elementHandle;
        this.instanceId = instanceId;
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
    async setCheckBoxState(value : boolean) {
        await this.elementHandle.evaluate(node => {
            const element = node as HTMLInputElement;
            element.checked = value;
        });
    }
    async setSelectBoxValue(value : string) {
        await this.elementHandle.select(value);
    }
    async screenshot() {
        // 스크린샷 처리 어떻게할지 고민
        await this.elementHandle.screenshot();
    }
}