import { createWindow, currentWindowTabs, findTabsByIndex, closeWindow, maximizeWindow, minimizeWindow, sleep, detachDebugger, generateUUID, getWindow, getAllTabs } from "@CrxApi";
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
    private _instanceUUIDElementControllerMap : Map<string, ElementController>
    private _frame : Frame
    private _browserType : BrowserType

    constructor (tab? : chrome.tabs.Tab) {
        this._instanceUUIDElementControllerMap = new Map<string, ElementController>();
        this._instanceUUID = generateUUID();
        if (tab) {
            this._tab = tab;
            getWindow(tab.windowId).then(window => {
                this._window = window;
            });
        }
    }

    get instanceUUID() {
        return this._instanceUUID;
    }
    get instanceUUIDElementControllerMap() {
        return this._instanceUUIDElementControllerMap;
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
    async connect() {
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
     * @deprecated
     */
    private async open() {
        this._window = await createWindow();
        [this._tab] = await currentWindowTabs(this._window.id);
        await this.connect();
        this._page.on('dialog', async (d)=>{
            d.accept();
            d.message();
        });
        
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
    private async findTabByTitle(title : string, isContains : boolean) {
        if (isContains) {
            this._tab = (await getAllTabs()).find(tab => tab.title.includes(title));
        } else {
            this._tab = (await getAllTabs()).find(tab => tab.title === title);
        }
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
    private async findTabByUrl(url : string, isContains : boolean) {
        if (isContains) {
            this._tab = (await getAllTabs()).find(tab => tab.url.includes(url));
        } else {
            this._tab = (await getAllTabs()).find(tab => tab.url === url);
        }
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
    private async goBack() {
        await this._page.goBack({
            waitUntil : "domcontentloaded"
        });
    }

    private async goForward() {
        await this._page.goForward({
            waitUntil : "domcontentloaded"
        });
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
    async execute(msg : ExecuteRequestMessage) {
        const result = await this.actionHandler(msg);
        return result;
    }

    /**
     * object.action 으로 분기하여 각각 해당하는 함수 실행
     * @param msg 
     * @returns 
     */
    private async actionHandler(msg : ExecuteRequestMessage) {
        const action = msg.object.action;
        const targetInstanceUUID = msg.object.instanceUUID;

        let elementController : ElementController;
        const isElement = Object.values(ElementAction).includes(action as any);

        if (isElement) {
            if (targetInstanceUUID) {
                elementController = this._instanceUUIDElementControllerMap.get(targetInstanceUUID);
            } 
            // else {
            //     elementController = await this.waitFor(msg);
            //     this._elementControllerArray.push(elementController);
            // }
        }
        
        switch(action) {
            // case BrowserAction.OPEN : {
            //     await this.open();
            //     await this.goTo(msg.object.parameter.url);
            //     this._browserType = await this._page.evaluate(() => {
            //         return window.navigator.userAgent.indexOf('Edg') > -1 ? BrowserType.EDGE : BrowserType.CHROME;
            //     });
            //     break;
            // }
            case BrowserAction.CONNECT : {
                const connectOptionType = msg.object.parameter.connectOption.type;
                const connectOptionValue = msg.object.parameter.connectOption.value;
                const isContains = msg.object.parameter.connectOption.isContains;
                switch (connectOptionType) {
                    case ConnectOptionType.URL : {
                        await this.findTabByUrl(connectOptionValue, isContains);
                        break;
                    }
                    case ConnectOptionType.TITLE : {
                        await this.findTabByTitle(connectOptionValue, isContains);
                        break;
                    }
                    case ConnectOptionType.INSTANCE_UUID : {
                        await this.connect();
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
                this._instanceUUIDElementControllerMap.set(elementController.instanceUUID, elementController);
                return {
                    instanceUUID : elementController.instanceUUID
                };
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
            case BrowserAction.GO_BACK : {
                await this.goBack();
                break;
            }
            case BrowserAction.GO_FORWARD : {
                await this.goForward();
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
            case ElementAction.LEFT_CLICK : {
                await elementController.leftClick();
                break;
            }
            case ElementAction.RIGHT_CLICK : {
                await elementController.rightClick();
                break;
            }
            case ElementAction.DOUBLE_CLICK : {
                await elementController.doubleClick();
                break;
            }
            case ElementAction.HOVER : {
                await elementController.hover();
                break;
            }
            case ElementAction.TYPE : {
                await elementController.clear();
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
            case ElementAction.GET_BOUNDING_BOX : {
                const boundingBox = await elementController.getBoundingBox();
                return {
                    x : Number(boundingBox.x.toFixed(0)),
                    y : Number(boundingBox.y.toFixed(0)),
                    width : Number(boundingBox.width.toFixed(0)),
                    height : Number(boundingBox.height.toFixed(0))
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
            case ElementAction.SCREENSHOT : {
                const image = await elementController.screenshot();
                return {
                    image : image
                }
            }
        }

    }

    /**
     * 주어진 Locator 로 엘리먼트를 찾아 ElementController 클래스 생성
     * @param msg 
     * @returns 
     */
    private async waitFor(msg : ExecuteRequestMessage) {
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
    private async switchFrame(msg : ExecuteRequestMessage) {
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

export interface ExecuteRequestMessage {
    command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTIVITY | CRX_COMMAND.CMD_WB_CHECK_BROWSER_LAUNCH
    object : {
        instanceUUID? : string
        action? : Action
        parameter? : Parameter
    }
    tranId :number
}

export interface ExecuteResponseMessage {
    command : string,
    tranId : number,
    responseInfo : {
        result : Status,
        errorMessage? : string,
    }
    object? : {
        textContent? : string,
        propertyValue? : string
        x? : number
        y? : number
        width? : number
        height? : number
        exists? : boolean,
        tagName? : string
        instanceUUID? : string
        image? : string
    }
}

export interface BrowserCheckRequestMessage {
    command : CRX_COMMAND.CMD_WB_CHECK_BROWSER_LAUNCH,
    tranId : number,
    responseInfo : null,
    object : {
        browserType : BrowserType,
        instanceUUID : string
    }
}

export interface BrowserCheckReponseMessage {
    command : CRX_COMMAND.CMD_WB_CHECK_BROWSER_LAUNCH,
    tranId : number,
    responseInfo : {
        result : Status,
        errorMessage : string
    },
    object : {
        isBrowserLaunch : boolean
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
    GO_BACK = 'goBack',
    GO_FORWARD = 'goForward',
    SWITCH_TAB = 'switchTab',
    WAIT = 'wait',
}

export enum ElementAction {
    LEFT_CLICK = 'leftClick',
    DOUBLE_CLICK = 'doubleClick',
    RIGHT_CLICK = 'rightClick',
    HOVER = 'hover',
    TYPE = 'type',
    READ = 'read',
    EXISTS = 'exists',
    GET_PROPERTY = 'getProperty',
    PRESS = 'press',
    GET_BOUNDING_BOX = 'getBoundingBox',
    READ_TAG = 'readTag',
    BOX_MODEL = 'boxModel',
    SET_CHECK_BOX_STATE = 'setCheckBoxState',
    SET_SELECT_BOX_VALUE = 'setSelectBoxValue',
    SCREENSHOT = 'screenshot'
}

export type Action = BrowserAction | ElementAction;

export enum ConnectOptionType {
    URL = 'URL',
    TITLE = 'Title',
    INSTANCE_UUID = 'instanceUUID'
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
        value : string,
        isContains : boolean
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
     * 엘리먼트 좌클릭
     * @peon leftClick
     * @activity 엘리먼트 좌클릭
     */
    async leftClick() {
        await this._elementHandle.click({
            button : "left"
        });
    }
    /**
     * 엘리먼트 우클릭
     * @peon rightClick
     * @activity 엘리먼트 우클릭
     */
    async rightClick() {
        await this._elementHandle.click({
            button : "right"
        });
    }

    /**
     * 엘리먼트 더블 클릭
     * @peon doubleClick
     * @activity 엘리먼트 더블 클릭
     */
    async doubleClick() {
        await this._elementHandle.click({
            button : "left",
            clickCount : 2,
            delay : 100
        });
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
     * 엘리먼트 height width x y 정보를 갖고 있는 객체 반환 후 반올림
     * @peon boundingBox
     * @activity 엘리먼트 크기
     * @returns 
     */
    async getBoundingBox() {
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
     * @peon screenshot
     * @activity 엘리먼트 이미지 저장
     */
    async screenshot() {
        return await this._elementHandle.screenshot({
            encoding : 'base64'
        }) as string;
    }
}