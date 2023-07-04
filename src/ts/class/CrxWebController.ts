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
    get tab() {
        return this._tab
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
        await this._page.goto(url, {
            waitUntil : "domcontentloaded"
        });
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
        const targetInstanceUUID = msg.object.instanceUUID;

        let elementController : ElementController;
        const isElement = Object.values(ElementAction).includes(action as any);

        if (isElement) {
            if (targetInstanceUUID) {
                elementController = this._elementControllerArray.find(elementController => elementController.instanceUUID === targetInstanceUUID);
            } 
            // else {
            //     elementController = await this.waitFor(msg);
            //     this._elementControllerArray.push(elementController);
            // }
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
            case BrowserAction.WAIT : {
                const elementController = await this.waitFor(msg);
                this._elementControllerArray.push(elementController);
                // return elementController.instanceUUID;
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
                const url = msg.object.parameter.url;
                await this.goTo(url);
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
                const x = msg.object.parameter.x;
                const y = msg.object.parameter.y;
                await this.scrollTo(x, y);
                break;
            }
            case BrowserAction.SWITCH_TAB : {
                const tabIndex = msg.object.parameter.tabIndex;
                await this.findTabByIndex(tabIndex);
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
                const text = msg.object.parameter.text;
                await elementController.type(text);
                break;
            }
            case ElementAction.READ : {
                const textContent = await elementController.read();
                return {
                    textContent : textContent
                };
            }
            case ElementAction.EXISTS : {
                const exists = elementController ? true : false;
                return {
                    exists : exists
                };
            }
            case ElementAction.GET_PROPERTY : {
                const propertyName = msg.object.parameter.propertyName;
                const propertyValue = await elementController.getProperty(propertyName);
                return {
                    propertyValue : propertyValue
                };
            }
            case ElementAction.PRESS : {
                const key = msg.object.parameter.key;
                await elementController.press(key);
                break;
            }
            case ElementAction.BOUNDING_BOX : {
                const boundingBox = await elementController.boundingBox();
                return {
                    boundingBox : boundingBox
                };
            }
            case ElementAction.READ_TAG : {
                const tagName = await elementController.readTag();
                return {
                    tagName : tagName
                };
            }
            // deprecated
            case ElementAction.BOX_MODEL : {
                const boxModel = await elementController.boxModel();
                return {
                    boxModel : boxModel
                };
            }
            case ElementAction.CLEAR : {
                await elementController.clear();
                break;
            }
            case ElementAction.SET_CHECK_BOX_STATE : {
                const check = msg.object.parameter.check;
                await elementController.setCheckBoxState(check);
                break;
            }
            case ElementAction.SET_SELECT_BOX_VALUE : {
                const selectValue = msg.object.parameter.selectValue;
                await elementController.setSelectBoxValue(selectValue);
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
    tranId :number
}

export interface ResponseMessage {
    command : string,
    tranId : number,
    result : Status,
    errorMessage? : string,
    object? : {
        textContent? : string,
        propertyValue? : string
        boundingBox? : BoundingBox,
        exists? : boolean,
        tagName? : string
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
    SWITCH_TAB = 'switchTab',
    WAIT = 'wait',
}

export enum ElementAction {
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
    URL = 'URL',
    TITLE = 'Title'
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
    text? : string
    propertyName? : string
    frameName? : string
    key? : KeyInput
    check? : string
    selectValue? : string
    x? : number
    y? : number
    tabIndex? : number
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
        return await (await this._elementHandle.getProperty('textContent')).jsonValue() as string;
    }

    /**
     * 속성 이름에 해당하는 속성 값 반환
     * @peon getProperty
     * @activity 엘리먼트 속성 읽기
     * @param propertyName 
     * @returns 
     */
    async getProperty(propertyName : string) {
        return await (await this._elementHandle.getProperty(propertyName)).jsonValue() as string;
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
        return await this._elementHandle.boundingBox();
    }

    /**
     * 엘리먼트 태그 이름 반환
     * @peon readTag
     * @activity 엘리먼트 Tag 읽기
     * @returns 
     */
    async readTag() {
        return await this._elementHandle.evaluate(node => node.tagName);
    }

    /**
     * 엘리먼트 박스 정보 (border, content, height, width, margin, padding) 반환
     * @deprecated 지원 미정
     * @returns 
     */
    async boxModel() {
        return await this._elementHandle.boxModel();
    }
    
    /**
     * input element 초기화
     * @peon clear
     * @activity 입력창 초기화
     */
    async clear() {
        console.log('clear')
        await this._elementHandle.evaluate(node => {
            const input = node as HTMLInputElement;
            input.value = '';
        });
    }

    /**
     * 체크박스 상태 변경
     * @peon setCheckBoxState
     * @activity 체크박스 선택
     * @param value 
     */
    async setCheckBoxState(value : string) {
        const check = value === 'True' ? true : false;
        if (check) {
            await this._elementHandle.evaluate(async node => {
                const element = node as HTMLInputElement;
                element.checked = true;
            });
        } else {
            await this._elementHandle.evaluate(async node => {
                const element = node as HTMLInputElement;
                element.checked = false;
            });
        }
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