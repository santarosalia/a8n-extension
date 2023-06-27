import { createWindow, currentWindowTabs, findTabsByTitle, findTabsByIndex, findTabsByUrl, closeWindow, maximizeWindow, minimizeWindow, sleep, detachDebugger, generateUUID } from "@CrxApi";
import { Browser, Page, ElementHandle, Frame, KeyInput, BoundingBox, BoxModel } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'
import { CRX_COMMAND } from "@CrxInterface";

export class BrowserController {
    private _window : chrome.windows.Window
    private _tab : chrome.tabs.Tab
    private _instance : Browser
    private _instanceUUID : string
    private _page : Page
    private _elementControllerArray : ElementController[]
    private _frame : Frame
    private _browserType : BrowserType

    constructor() {
        this._elementControllerArray = [];
        this._instanceUUID = generateUUID();
    }

    get instanceUUID() {
        return this._instanceUUID;
    }
    get elementControllerArray() {
        return this._elementControllerArray;
    }
    get browserType() {
        return this._browserType;
    }
    /**
     * 1. Puppeteer 를 이용하여 BrowserController 의 tab id 를 가진 tab 에 연결,
     * 
     * 2. transport 생성,
     * 
     * 3. transport로 Browser Instance 설정,
     * 
     * 4. Browser Instance 에서 pages 가져와 Page Instance 설정,
     * 
     * 5. Page Instance 에서 mainFrame 가져와 Frame Instance 설정
     * 
     */
    private async connect() {
        await detachDebugger();
        const transport = await ExtensionDebuggerTransport.create(this._tab.id);
        this._instance = await puppeteer.connect({
            transport : transport,
            defaultViewport : null
        });
        [this._page] = await this._instance.pages();
        this._frame = this._page.mainFrame();
    }
    /**
     * CrxApi 윈도우 생성하여 Window Instance 설정
     * 
     * Window ID 로 Tab 검색하여 Tab Instance 설정
     * 
     * connect 실행
     */
    private async open() {
        this._window = await createWindow();
        [this._tab] = await currentWindowTabs(this._window.id);
        await this.connect();
    }

    /**
     * 주어진 url로 페이지 이동
     * @peon goTo
     * @activity 링크 이동
     * @param url 
     */
    private async goTo(url : string) {
        await this._page.goto(url);
    }

    /**
     * 주어진 Title에 해당하는 탭 탐색 후 연결
     * @peon connect
     * @activity 브라우저 연결
     * @param title 
     */
    private async findTabByTitle(title : string) {
        [this._tab] = await findTabsByTitle(title);
        await this.connect();
    }

    /**
     * 주어진 Index 해당하는 탭 탐색 후 연결
     * @peon connect
     * @activity 브라우저 연결
     * @param index 
     * @deprecated 지원 검토 중
     */
    private async findTabByIndex(index : number) {
        [this._tab] = await findTabsByIndex(this._window.id, index);
        await this.connect();
    }

    /**
     * 주어진 URL 에 해당하는 탭 탐색 후 연결
     * @peon connect
     * @activity 브라우저 연결
     * @param url 
     */
    private async findTabByUrl(url : string) {
        [this._tab] = await findTabsByUrl(url);
        await this.connect();
    }

    /**
     * 브라우저 최대화
     * @peon maximize
     * @activity 창 최대화
     */
    private async maximize() {
        await maximizeWindow(this._window.id);
    }

    /**
     * 브라우저 최소화
     * @peon minimize
     * @activity 창 최소화
     */
    private async minimize() {
        await minimizeWindow(this._window.id);
    }

    /**
     * 주어진 x, y 값의 위치로 스크롤 이동
     * @peon scrollTo
     * @activity 스크롤 이동
     * @param x 
     * @param y 
     */
    private async scrollTo(x : number, y : number) {
        await this._page.mouse.wheel({
            deltaX : x,
            deltaY : y
        });
    }

    /**
     * 이전 페이지로 이동
     * @peon back
     * @activity 이전페이지 이동
     */
    private async back() {
        await this._page.goBack();
    }

    /**
     * window.alert 으로 띄워진 얼럿 처리 기능
     * @deprecated 지원 예정
     * @peon alert
     * @activity 경고
     */
    private async handleAlert() {
        this._page.on('dialog', dialog => {
            dialog.accept();
        });
    }

    /**
     * 주어진 JSON 메시지로 브라우저 자동화
     * @param msg 
     * @returns 
     */
    async execute(msg : RequestMessage) {
        const result = await this.actionHandler(msg);
        return result;
    }

    /**
     * object.action 으로 분기하여 각각 해당하는 함수 실행
     * @param msg 
     * @returns 
     */
    private async actionHandler(msg : RequestMessage) {
        const action = msg.object.action;
        const value = msg.object.parameter.value;
        const x = msg.object.parameter.x;
        const y = msg.object.parameter.y;
        const targetInstanceUUID = msg.object.instanceUUID;
        const bool = msg.object.parameter.bool;

        let elementController : ElementController;
        const isElement = Object.values(ElementAction).includes(action as any);

        if (isElement) {
            if (targetInstanceUUID) {
                elementController = this._elementControllerArray.find(elementController => elementController.instanceUUID === targetInstanceUUID);
            } else {
                elementController = await this.waitFor(msg);
                this._elementControllerArray.push(elementController);
            }
        }

        switch(action) {
            case BrowserAction.OPEN : {
                await this.open();
                await this.goTo(msg.object.parameter.url);
                this._browserType = await this._page.evaluate(() => {
                    return window.navigator.userAgent.indexOf('Edg') > -1 ? BrowserType.EDGE : BrowserType.CHROME;
                });
                break;
            }
            case BrowserAction.CONNECT : {
                const connectOptionType = msg.object.parameter.connectOption.type;
                const connectOptionValue = msg.object.parameter.connectOption.value;
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
                await closeWindow(this._window.id);
                break;
            }
            case BrowserAction.SWITCH_FRAME : {
                await this.switchFrame(msg);
                break;
            }
            case BrowserAction.RESET_FRAME : {
                await this.resetFrame();
                break;
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
                return elementController.instanceUUID;
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

    /**
     * 주어진 Locator 로 엘리먼트를 찾아 ElementController 클래스 생성
     * @param msg 
     * @returns 
     */
    private async waitFor(msg : RequestMessage) {
        const locator = msg.object.parameter.locator;
        const locatorType = msg.object.parameter.locatorType;
        const timeout = msg.object.parameter.timeout;
        let elementHandle : ElementHandle;

        switch(locatorType) {
            case LocatorType.XPATH : {
                elementHandle = await this._frame.waitForXPath(locator, {
                    timeout : timeout
                });
                break;
            }
            case LocatorType.CSS_SELECTOR : {
                elementHandle = await this._frame.waitForSelector(locator, {
                    timeout : timeout
                });
                break;
            }
        }
        return new ElementController(elementHandle);
    }

    /**
     * 프레임 이동
     * @peon switchFrame
     * @activity 프레임 이동
     * @param msg 
     */
    private async switchFrame(msg : RequestMessage) {
        const frameName = msg.object.parameter.frameName;
        const frames = this._frame.childFrames();
        this._frame = frames.find(frame => frame.name() === frameName);
        await sleep(1000);
    }
    /**
     * 프레임 초기화
     * @peon resetFrame
     * @activity 프레임 초기화
     */
    private async resetFrame() {
        this._frame = this._page.mainFrame();
        await sleep(1000);
    }
}

export interface RequestMessage {
    command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTIVITY | CRX_COMMAND.CMD_CRX_START_PROCESS | CRX_COMMAND.CMD_CRX_END_PROCESS
    object : {
        instanceUUID? : string
        action : Action
        parameter : Parameter
    }
}

export interface ResponseMessage {
    command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTIVITY
    object : {
        status : Status,
        value : string | boolean | BoundingBox | BoxModel,
        instanceUUID? : string
    }
    
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

export enum BrowserType {
    CHROME = 'Chrome',
    EDGE = 'Edge'
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
    browserType? : BrowserType
}

export class ElementController {
    private _elementHandle : ElementHandle
    private _instanceUUID : string

    constructor(elementHandle : ElementHandle) {
        this._elementHandle = elementHandle;
        this._instanceUUID = generateUUID();
    }

    get instanceUUID() {
        return this._instanceUUID;
    }

    /**
     * 엘리먼트 클릭
     * @peon click
     * @activity 엘리먼트 클릭
     */
    async click() {
        await this._elementHandle.click();
    }

    /**
     * 엘리먼트 마우스 오버
     * @peon hover
     * @activity 엘리먼트 마우스오버
     */
    async hover() {
        await this._elementHandle.hover();
    }

    /**
     * input element 에 텍스트 입력
     * @peon type
     * @activity 엘리먼트 입력
     * @param text 
     */
    async type(text : string) {
        await this._elementHandle.type(text);
    }

    /**
     * 엘리먼트 텍스트 반환
     * @peon read
     * @activity 엘리먼트 읽기
     * @returns 
     */
    async read() {
        const result = await (await this._elementHandle.getProperty('textContent')).jsonValue() as string;
        return result;
    }

    /**
     * 속성 이름에 해당하는 속성 값 반환
     * @peon getProperty
     * @activity 엘리먼트 속성 읽기
     * @param propertyName 
     * @returns 
     */
    async getProperty(propertyName : string) {
        const property = await (await this._elementHandle.getProperty(propertyName)).jsonValue() as string;
        return property;
    }

    /**
     * 엘리먼트에 keyInput 에 해당하는 특수 키 입력
     * @peon press
     * @activity 엘리먼트 특수 키 입력
     * @param keyInput 
     */
    async press(keyInput : KeyInput) {
        await this._elementHandle.press(keyInput);
    }

    /**
     * 엘리먼트 height width x y 정보를 갖고 있는 객체 반환
     * @peon boundingBox
     * @activity 엘리먼트 크기
     * @returns 
     */
    async boundingBox() {
        const boundingBox = await this._elementHandle.boundingBox();
        return boundingBox;
    }

    /**
     * 엘리먼트 태그 이름 반환
     * @peon readTag
     * @activity 엘리먼트 Tag 읽기
     * @returns 
     */
    async readTag() {
        const tag = await this._elementHandle.evaluate(node => node.tagName);
        return tag;
    }

    /**
     * 엘리먼트 박스 정보 (border, content, height, width, margin, padding) 반환
     * @deprecated 지원 미정
     * @returns 
     */
    async boxModel() {
        const boxModel = await this._elementHandle.boxModel();
        return boxModel;
    }
    
    /**
     * input element 초기화
     * @peon clear
     * @activity 입력창 초기화
     */
    async clear() {
        await this._elementHandle.evaluate(node => node.textContent = '');
    }

    /**
     * 체크박스 상태 변경
     * @peon setCheckBoxState
     * @activity 체크박스 선택
     * @param value 
     */
    async setCheckBoxState(value : boolean) {
        await this._elementHandle.evaluate(node => {
            const element = node as HTMLInputElement;
            element.checked = value;
        });
    }

    /**
     * 셀렉트 박스 값 변경
     * @peon setSelectBoxValue
     * @activity 셀렉트박스 선택
     * @param value 
     */
    async setSelectBoxValue(value : string) {
        await this._elementHandle.select(value);
    }

    /**
     * 스크린샷
     * @deprecated 스크린샷 처리 방법 고민중
     */
    async screenshot() {
        // 스크린샷 처리 어떻게할지 고민
        await this._elementHandle.screenshot();
    }
}