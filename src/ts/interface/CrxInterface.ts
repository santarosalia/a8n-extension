export interface TopbarMenu {
    title : string;
    index : number;
    path : string;
}

export interface CapturedEventDetails {
    index : number;
    type : string;
    id : string;
    target : HTMLElement;
    x : number;
    y : number;
    pageX : number;
    pageY : number;
    clientX : number;
    clientY : number;
    ctrlKey : boolean;
    shiftKey : boolean;
    scrollX : number;
    scrollY : number;
}

