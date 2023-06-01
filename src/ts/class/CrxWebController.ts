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
    private elArray : {
        instance : ElementHandle,
        variable : string
    }[]
    constructor () {

    }
    get getVariable() {
        return this.variable;
    }

    private async connect() {
        const transport = await ExtensionDebuggerTransport.create(this.tab.id);
        this.instance = await puppeteer.connect({
            transport : transport,
            defaultViewport : null
        });
        [this.page] = await this.instance.pages();
    }

    private async create() {
        this.window = await createWindow();
        [this.tab] = await currentWindowTabs(this.window.id);
        await this.connect();
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
    async run(order : Order) {
        await this.typeHandler(order);
    }

    private async typeHandler(order : Order) {
        const type = order.type;

        switch(type) {
            case Type.BROWSER : {
                await this.browserHandler(order);

                if (order.returnVariable) {
                    this.variable = order.returnVariable;
                }
                break;
            }
            case Type.ELEMENT : {
                await this.elementHandler(order);
            }
        }
    }

    private async browserHandler(order : Order) {
        const action = order.action;
        switch(action) {
            case Action.OPEN : {
                this.create();
                break;
            }
            case Action.CONNECT : {
                const connectOptionType = order.parameter.connectOption.type;
                const connectOptionValue = order.parameter.connectOption.value;
                switch (connectOptionType) {
                    case ConnectOptionType.URL : {
                        this.findTabByUrl(connectOptionValue as string);
                        break;
                    }
                    case ConnectOptionType.TITLE : {
                        this.findTabByTitle(connectOptionValue as string);
                        break;
                    }
                    case ConnectOptionType.INDEX : {
                        this.findTabByIndex(connectOptionValue as number);
                    }

                }
            }
        }
    }

    private async elementHandler(order : Order) {
        const action = order.action;
        const locatorType = order.parameter.locatorType;
        const locator = order.parameter.locator;
        const variable = order.returnVariable;
        switch(action) {
            case Action.WAIT : {
                switch(locatorType) {
                    case LocatorType.XPATH : {
                        const el = await this.page.waitForXPath(locator);
                        this.elArray.push({
                            instance : el,
                            variable : variable
                        });
                        break;
                    }
                    case LocatorType.CSSSELECTOR : {
                        const el = await this.page.waitForSelector(locator);
                        this.elArray.push({
                            instance : el,
                            variable : variable
                        });
                        break;
                    }
                }
                break;
            }
            case Action.CLICK : {

            }

        }
    }
}

export interface Order {
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
}

export enum ConnectOptionType {
    URL = 'url',
    TITLE = 'title',
    INDEX = 'index'
}
export enum LocatorType {
    XPATH = 'xpath',
    CSSSELECTOR = 'cssselector'
}

export interface Parameter {
    timeout? : number
    url? : string
    connectOption? : {
        type : ConnectOptionType,
        value : string | number
    }
    locatorType? : LocatorType
    locator : string
}

