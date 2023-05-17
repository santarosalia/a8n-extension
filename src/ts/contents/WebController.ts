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


export const webController = (message : CrxMessage) => {
    if (message.receiver !== CRX_MSG_RECEIVER.WEB_CONTROLLER) return;
    switch (message.command) {  

        case CRX_COMMAND.CMD_WEB_CONTROL : {
            console.log(message.payload.value)
            const el = document.querySelector(message.payload.cssSelector) as HTMLInputElement
            el.value = message.payload.value
            break;
        }

       
    }
}