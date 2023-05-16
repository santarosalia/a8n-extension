import { CapturedEvent } from "@CrxClass";

export const topbarMenu = [
    {
        title : '레코딩 내역',
        index : 0,
        path : '/rh'
    },
    {
        title : '데이터 스크래핑',
        index : 1,
        path : '/ds'
    }
];

export const CRX_NEW_RECORD = 'CRX_NEW_RECORD';
export const CRX_ADD_SCRAPING_DATA = 'CRX_ADD_SCRAPING_DATA';

export const CRX_MSG_RECEIVER = {
    SERVICE_WORKER : 'SERVICE_WORKER',
    WEB_RECORDER : 'WEB_RECORDER',
    WEB_SELECTOR : 'WEB_SELECTOR',
    BROWSER_CONTROLLER : 'BROWSER_CONTROLLER',
    VIEW : 'VIEW',
    CONTENT_SCRIPT : 'CONTENT_SCRIPT'
}

const CRX_DIALOG_STATE =  {
    CRX_CONFIRM_DIALOG : 'CRX_CONFIRM_DIALOG',
    CRX_MULTI_PAGE_DIALOG : 'CRX_MULTI_PAGE_DIALOG'
}

export const CRX_STATE = {
    CRX_RECORDS : 'CRX_RECORDS',
    CRX_SCRAPING_DATAS : 'CRX_SCRAPING_DATAS',
    CRX_DIALOG_STATE : CRX_DIALOG_STATE,
    CRX_NEXT_PAGE_BUTTON : 'CRX_NEXT_PAGE_BUTTON',
    CRX_NEXT_PAGE_NUMBER : 'CRX_NEXT_PAGE_NUMBER',
    CRX_IS_MULTI_PAGE : 'CRX_IS_MULTI_PAGE',
    CRX_PAGE_COUNT : 'CRX_PAGE_COUNT'
}
export const CRX_ACTION = {
    DISPATCH_RECORDS : 'DISPATCH_RECORDS',
    ADD_NEW_RECORD : 'ADD_NEW_RECORD',
    REMOVE_RECORD : 'REMOVE_RECORD',
    EDIT_RECORD : 'EDIT_RECORD',
    RECORDING_WINDOW_FOCUS : 'RECORDING_WINDOW_FOCUS',
    ADD_SCRAPING_DATA : 'ADD_SCRAPING_DATA',
    DISPATCH_SCRAPING_DATAS : 'DISPATCH_SCRAPING_DATAS',
    CLEAR_SCRAPING_DATA : 'CLEAR_SCRAPING_DATA',
    REMOVE_COLUMN : 'REMOVE_COLUMN',
    REMOVE_ROW : 'REMOVE_ROW',
    CONTEXT_MENU_CHANGE : 'CONTEXT_MENU_CHANGE',
    SAVE_DATA_SCRAPING : 'SAVE_DATA_SCRAPING',
    SAVE_DATA : 'SAVE_DATA'
}
export const EVENT_TYPE_TO_KOREAN = {
    click : '클릭',
    input : '입력',
    movetab : '탭이동',
    removetab : '탭제거',
    openbrowser : '브라우저 열기',
    keydown : '키보드 입력',
    switchframe : '프레임 이동',
    select : '셀렉트 박스',
    readtext : '텍스트 읽기',
    readattribute : '속성값 읽기',
    hover : '마우스 Hover',
    datascraping : '데이터 스크래핑',
    resetframe : '프레임 초기화',
    popup : '팝업'
}

export const getLocatorInfo = (self : CapturedEvent) => {
    return {
        xpath : {
            displayName : 'XPath',
            type : 'xpath',
            val : self.xpath
        },
        fullxpath : {
            displayName : '전체 XPath',
            type : 'fullXpath',
            val : self.fullXpath
        },
        linktextxpath : {
            displayName : '링크 텍스트 XPath',
            type : 'linkTextXpath',
            val : self.linkTextXpath
        },
        cssselector : {
            displayName : 'CSS 선택자',
            type : 'cssSelector',
            val : self.cssSelector
        },
    }
    
}

export const EVENT = {
    CLICK : 'click',
    KEYDOWN : 'keydown',
    SCROLL : 'scroll',
    INPUT : 'input',
    WHEEL : 'wheel',
    SELECT : 'select',
    MOUSEMOVE : 'mousemove',
    MOUSEOVER : 'mouseover',
    MOUSEOUT : 'mouseout',
    MOVETAB : 'movetab',
    REMOVETAB : 'removetab',
    OPENBROWSER : 'openbrowser',
    SWITCHFRAME : 'switchframe',
    CONTEXTMENU : 'contextmenu',
    READTEXT : 'readtext',
    DATASCRAPING : 'datascraping',
    READATTRIBUTE : 'readattribute',
    HOVER : 'hover',
    OPENVIEW : 'openview',
    NEXTPAGEBUTTON : 'nextpagebutton',
    NEXTPAGENUMBER : 'nextpagenumber',
    RESETFRAME : 'resetframe',
    POPUP : 'popup',
    MOUSEDOWN : 'mousedown',
    MOUSEUP : 'mouseup'
}

