import { KeyInput } from "puppeteer-core/lib/cjs/puppeteer/api-docs-entry"
import { Action } from "@/ts/type/CrxType"
import { AlertOption, BrowserType, CRX_COMMAND, CloseTarget, ConnectOptionType, LocatorType, Status } from "@CrxConstants"

export interface TopbarMenuDetails {
    title : string
    index : number
    path : string
}

export interface CrxCapturedEventDetails extends CrxEventDetails {
    localName : string
    textContent : string
    id : string
    value : string
    xpath : string
    fullXpath : string
    linkTextXpath : string
    cssSelector : string
    frameStack : FrameStack[]
    info : EventInfo[]
    locator : Locator
    class : string[]
    name : string
    image : string
    clientWidth : number
    clientHeight : number
    attribute : Locator
}

export interface CrxEventDetails {
    AT_TARGET : number
    BUBBLING_PHASE : number
    CAPTURING_PHASE : number
    NONE : number
    bubbles : boolean
    cancelBubble : boolean
    cancelable : boolean
    composed : boolean
    currentTarget : Window
    data : string
    defaultPrevented: boolean
    detail: number
    eventPhase: number
    inputType: string
    isComposing: boolean
    isTrusted: boolean
    returnValue: boolean
    srcElement: Element
    target: Element
    timeStamp: number
    type: string
    which: number
    altKey: boolean
    altitudeAngle: number
    azimuthAngle: number
    button: number
    buttons: number
    clientX: number
    clientY: number
    ctrlKey: boolean
    height: number
    isPrimary: boolean
    layerX: number
    layerY: number
    metaKey: boolean
    movementX: number
    movementY: number
    offsetX: number
    offsetY: number
    pageX: number
    pageY: number
    pointerId: number
    pointerType: string
    pressure: number
    screenX: number
    screenY: number
    shiftKey: boolean
    tangentialPressure: number
    tiltX: number
    tiltY: number
    twist: number
    width: number
    x: number
    y: number
    charCode: number
    code: string
    key: string
    keyCode: number
    location: number
    repeat : boolean
    selectedIndex : number

}

export interface FrameStack {
    frameIndex : number
    id : string
    name : string
    element : Element
}
export interface EventInfo {
    type : string
    displayName : string
    value? : string | number
    values? : LocatorInfo[]
}

export interface LocatorInfo {
    displayName : string
    type : string
    val : string
}

export interface Locator {
    type : LocatorType
    value : string
}

export interface CrxMessage {
    receiver : string
    command : CRX_COMMAND
    payload? : any
}

export enum CRX_CONTEXT_MENU_TYPE {
    NORMAL,
    MULTIPAGE
}

export interface ScrapingDatas {
    exceptRow : number[]
    data : ScrapingData[]
    frameStack : FrameStack[]
}

interface ScrapingData {
    columnSize : number
    pattern : string
    textData : string[][]
    exceptColumn : number[]
}

export interface ExecuteRequestMessage {
    command : CRX_COMMAND.CMD_CRX_EXECUTE_ACTION | CRX_COMMAND.CMD_WB_CHECK_BROWSER_LAUNCH
    object : {
        instanceUUID? : string
        action? : Action
        parameter? : ExecuteActionParameter
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

export interface ExecuteActionParameter {
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
    target? : CloseTarget
    alertOption? : AlertOption
}
