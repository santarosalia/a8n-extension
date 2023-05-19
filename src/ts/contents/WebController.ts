// new KeyboardEvent('keydown', {
//     code: 'Enter',
//     key: 'Enter',
//     charCode: 13,
//     keyCode: 13,
//     view: window,
//     bubbles: true
// });


import { CRX_MSG_RECEIVER } from "@CrxConstants";
import { CRX_COMMAND, CrxMessage } from "@CrxInterface";
import { CrxWebController } from "../class/CrxClass";



export const webController = (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.WEB_CONTROLLER) return;
    switch (message.command) {  

        case CRX_COMMAND.CMD_WEB_CONTROL : {
            const controller = new CrxWebController(message.payload);
            controller.execute();
            alert('a');
            // setTimeout(() => {
                
            //     self.close();
            // }, 1000);
            // const el = document.querySelector(message.payload.cssSelector) as HTMLInputElement
            // el.value = message.payload.value
            break;
        }

       
    }
}

chrome.runtime.onMessage.addListener(webController);