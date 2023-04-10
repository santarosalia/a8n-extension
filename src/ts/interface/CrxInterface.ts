export interface TopbarMenuDetails {
    title : string
    index : number
    path : string
}

export interface CapturedEventDetails {
    type : string
    localName : string
    textContent : string
    id : string
    value : string
    xpath : string
    fullXpath : string
    linkTextXpath : string
    cssSelector : string
    frameStack : object[]
    x : number
    y : number
    pageX : number
    pageY : number
    clientX : number
    clientY : number
    ctrlKey : boolean
    shiftKey : boolean
    timestamp : number
    url : string
}

export interface SettingDetails {
    CRX_EVENT_INDEX : number
    CRX_VIEW_WINDOW_ID : number
}
