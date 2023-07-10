import { generateUUID } from "@CrxApi";
import { ElementHandle, KeyInput } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry";


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