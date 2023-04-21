import { CRX_MSG_RECEIVER } from "@CrxConstants";
import CrxHilightCSS from '@/css/CrxHighlight.css?raw'
import CrxContexMenuCSS from '@/css/CrxContextMenu.css?raw'
import { webRecorderStart, webRecorderEnd } from "@/ts/contents/WebRecorder";
import { CrxMessage, CRX_COMMAND } from "@CrxInterface";
import CrxContextMenu from "@/ts/class/CrxContextMenu";

// try { 
    
// } catch {}

// console.log('%c startedv','color:red')

let WebRecorderStarted : boolean;

chrome.runtime.onMessage.addListener((request : CrxMessage) => {
    if (request.receiver !== CRX_MSG_RECEIVER.WEB_RECORDER) return;

    switch (request.command) {
        case CRX_COMMAND.CMD_RECORDING_START : {
            if (WebRecorderStarted) return;
            webRecorderStart();
            const crxHighlightStyle = document.createElement('style');
            crxHighlightStyle.innerHTML = CrxHilightCSS;
            document.head.appendChild(crxHighlightStyle);
            const crxContextMenuStyle = document.createElement('style');
            crxContextMenuStyle.innerHTML = CrxContexMenuCSS;
            document.head.appendChild(crxContextMenuStyle)
            // const crxContextMenuList = ['텍스트 읽기','데이터 스크래핑','속성값 읽기','마우스 호버','레코딩 내역 창 열기'];
            // const crxContextMenuTitleList = ['readText','dataScrapping','readAttribute','hover','openRecordHistory'];


            // const crxContextMenuUl = document.createElement('ul');
            // crxContextMenuList.forEach((item,index) => {
            //     const crxContextMenuLi = document.createElement('li');
            //     crxContextMenuLi.textContent = item;
            //     crxContextMenuLi.id = crxContextMenuTitleList[index];
            //     crxContextMenuUl.appendChild(crxContextMenuLi);
            // });
            // crxContextMenu.appendChild(crxContextMenuUl);
            // window.top.document.head.after(crxContextMenu);
            WebRecorderStarted = true;
            break;
        }
        case CRX_COMMAND.CMD_RECORDING_END : {
            webRecorderEnd();
            break;
        }
    }
});
