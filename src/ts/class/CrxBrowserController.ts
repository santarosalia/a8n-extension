import { 
    findTabsByIndex,
    maximizeWindow,
    minimizeWindow,
    sleep,
    detachDebugger,
    generateUUID,
    getWindow,
    getAllTabs, 
    closeWindow,
    closeTab,
    waitPageLoading,
    focusTab,
    windowFocus
} from "@CrxApi";
import { Browser, Page, ElementHandle, Frame, Dialog } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";
import puppeteer from 'puppeteer-core/lib/cjs/puppeteer/web'
import { ExtensionDebuggerTransport } from 'puppeteer-extension-transport'
import { ExecuteRequestMessage } from "@CrxInterface";
import { ElementController } from "@CrxClass/CrxElementController";
import { AlertOption, BrowserAction, BrowserType, CloseTarget, ConnectOptionType, ElementAction, LocatorType } from "@CrxConstants";

export class BrowserController {
    private _window : chrome.windows.Window
    private _tab : chrome.tabs.Tab
    private _instance : Browser
    private _instanceUUID : string
    private _page : Page
    private _instanceUUIDElementControllerMap : Map<string, ElementController>
    private _frame : Frame
    private _browserType : BrowserType
    private _dialog : Dialog

    constructor (tab? : chrome.tabs.Tab) {
        this._instanceUUIDElementControllerMap = new Map<string, ElementController>();
        this._instanceUUID = generateUUID();
        if (tab) {
            this._tab = tab;
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
        // await detachDebugger(this._tab);
        await waitPageLoading(this._tab);
        this._window = await getWindow(this._tab.windowId);
        const transport = await ExtensionDebuggerTransport.create(this._tab.id);
        this._instance = await puppeteer.connect({
            transport : transport,
            defaultViewport : null
        });
        [this._page] = await this._instance.pages();
        this._frame = this._page.mainFrame();
        this._page.on('dialog', dialog => {
            this._dialog = dialog;
        });
        // await sleep(1000);
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
        if (this._tab === undefined) throw new Error('Not Exists');
        await this.connect();
    }

    /**
     * 주어진 Index 해당하는 탭 탐색 후 연결
     * @peon connect
     * @activity 브라우저 연결
     * @param index 
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
        if (typeof(this._tab) === 'undefined') throw new Error('Not Exists');
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
     * window.alert 으로 띄워진 얼럿 처리
     * @peon handleAlert
     * @activity 경고
     */
    private async handleAlert(alertOption : AlertOption) {
        const exists = this._dialog !== undefined;
        const dialogMessage = this._dialog.message();
        let result = {
            textContent : dialogMessage,
            exists : exists
        };

        switch (alertOption) {
            case AlertOption.ACCEPT : {
                await this._dialog.accept();
                this._dialog = undefined;
                break;
            }
            case AlertOption.DISMISS : {
                await this._dialog.dismiss();
                this._dialog = undefined;
                break;
            }
            case AlertOption.EXISTS : {
                break;
            }
            case AlertOption.READ : {
                break;
            }
        }
        return result;
    }

    async connectCheck() {
        if (this._instance) {
            if (!this._instance.isConnected()) {
                await this.connect();
            }
        }
    }

    /**
     * 주어진 JSON 메시지로 브라우저 자동화
     * @param msg 
     * @returns 
     */
    async execute(msg : ExecuteRequestMessage) {
        await this.connectCheck();
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
            elementController = this._instanceUUIDElementControllerMap.get(targetInstanceUUID);
        }
        
        switch(action) {
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
                const target = msg.object.parameter.target;
                switch (target) {
                    case CloseTarget.TAB : {
                        await closeTab(this._tab);
                        break;
                    }
                    case CloseTarget.WINDOW : {
                        await closeWindow(this._window.id);
                        break;
                    }
                }
                break;
            }
            case BrowserAction.WAIT : {
                await waitPageLoading(this._tab);
                const elementController = await this.waitFor(msg);
                this._instanceUUIDElementControllerMap.set(elementController.instanceUUID, elementController);
                return {
                    instanceUUID : elementController.instanceUUID
                };
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
            case BrowserAction.HANDLE_ALERT : {
                const alertOption = msg.object.parameter.alertOption;
                const result = await this.handleAlert(alertOption);
                return {
                    textContent : result.textContent,
                    exists : result.exists
                };
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
                return {
                    exists : elementController.exists
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
                await windowFocus(this._window.id);
                await focusTab(this._tab.id);
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
        const defaultTimeout = 10000;
        let elementHandle : ElementHandle | void;
        switch(locatorType) {
            case LocatorType.XPATH : {
                elementHandle = await this._frame.waitForXPath(locator, {
                    timeout : timeout === 0 ? defaultTimeout : timeout
                }).catch(e => {
                    console.error(e);
                });
                break;
            }
            case LocatorType.CSS_SELECTOR : {
                elementHandle = await this._frame.waitForSelector(locator, {
                    timeout : timeout === 0 ? defaultTimeout : timeout
                }).catch(e => {
                    console.error(e);
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
        this._frame = frames.find(frame => frame.name().includes(frameName));
        if (this._frame === undefined) throw new Error('Not Found');
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









