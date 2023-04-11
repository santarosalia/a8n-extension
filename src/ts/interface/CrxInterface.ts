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
    frameStack : object[]
    url : string
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
}

export interface SettingDetails {
    CRX_EVENT_INDEX : number
    CRX_VIEW_WINDOW_ID : number
}
