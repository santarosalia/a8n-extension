import { CapturedEvent } from "../class/CrxClass";

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

export const CRX_RECORDS = 'CRX_RECORDS';
export const CRX_NEW_RECORD = 'CRX_NEW_RECORD';
export const CRX_MSG_RECEIVER = {
    SERVICE_WORKER : 'SERVICE_WORKER',
    WEB_RECORDER : 'WEB_RECORDER',
    WEB_SELECTOR : 'WEB_SELECTOR',
    BROWSER_CONTROLLER : 'BROWSER_CONTROLLER'
}
export const EVENT_TYPE_TO_KOREAN = {
    click : '클릭',
    input : '입력',
    movetab : '탭이동',
    removetab : '탭제거',
    openbrowser : '브라우저 열기',
    keydown : '키보드 입력',
    switchframe : '프레임 이동',
    select : '셀렉트 박스'
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
    MOUSEOVER : 'mouseover',
    MOUSEOUT : 'mouseout',
    MOVETAB : 'movetab',
    REMOVETAB : 'removetab',
    OPENBROWSER : 'openbrowser',
    SWITCHFRAME : 'switchframe'
}

export const CRX_CMD = {
    CMD_RECORDING_START : 'CMD_RECORDING_START',
    CMD_RECORDING_END : 'CMD_RECORDING_END',
    CMD_STORE_CAPTURED_EVENT : 'CMD_STORE_CAPTURED_EVENT',
    CMD_RECORDING_WINDOW_FOCUS : 'CMD_RECORDING_WINDOW_FOCUS',
    CMD_CAPTURE_IMAGE : 'CMD_CAPTURE_IMAGE',
    CMD_SEND_EVENT : 'CMD_SEND_EVENT'
}

