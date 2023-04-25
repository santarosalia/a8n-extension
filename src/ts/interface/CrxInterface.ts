export interface TopbarMenuDetails {
    title : string
    index : number
    path : string
}

export interface CapturedEventDetails extends EventDetails {
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
}

export interface EventDetails {
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

interface Locator {
    type : LocatorType
    value : string
}

export enum LocatorType {
    Xpath = 'xpath',
    FullXpath = 'fullXpath',
    LinkTextXpath = 'linkTextXpath',
    CssSelector = 'cssSelector'
}

export interface CrxMessage {
    receiver : string
    command : CRX_COMMAND
    payload? : any
}

export enum CRX_COMMAND {
    CMD_RECORDING_START = 'CMD_RECORDING_START',
    CMD_RECORDING_END = 'CMD_RECORDING_END',
    CMD_STORE_CAPTURED_EVENT = 'CMD_STORE_CAPTURED_EVENT',
    CMD_RECORDING_WINDOW_FOCUS = 'CMD_RECORDING_WINDOW_FOCUS',
    CMD_CAPTURE_IMAGE = 'CMD_CAPTURE_IMAGE',
    CMD_SEND_EVENT = 'CMD_SEND_EVENT',
    CMD_OPEN_VIEW = 'CMD_OPEN_VIEW'
}