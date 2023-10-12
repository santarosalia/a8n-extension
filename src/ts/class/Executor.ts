import { ExecuteRequestMessage, ExecuteResponseMessage } from "@CrxInterface";
import { BrowserAction, CRX_COMMAND, ElementAction } from "@CrxConstants";
import { BrowserController } from "./CrxBrowserController";
import { sendMessageToView } from "../api/CrxApi";

export class Executor {
    instanceUUIDBrowserControllerMap: Map<string, BrowserController>
    instanceUUID: string
    index: number
    process: ExecuteRequestMessage[]
    constructor (process: ExecuteRequestMessage[]) {
        this.process = process;
        this.instanceUUIDBrowserControllerMap = new Map<string, BrowserController>();
        const msg = this.process.shift();
        this.execute(msg);

    }
    async execute (msg: ExecuteRequestMessage, params?: any) {
        let browserController: BrowserController;
        // const isElement = Object.values(ElementAction).includes(msg.object.action as any);
        // const isWait = msg.object.action === BrowserAction.WAIT;
        const instanceUUID = params?.instanceUUID;
        if (instanceUUID) {
            // if (isElement) {
            //     browserController = Array.from(this.instanceUUIDBrowserControllerMap.values()).find(browserController => browserController.instanceUUIDElementControllerMap.has(instanceUUID));
            // } else {
            browserController = this.instanceUUIDBrowserControllerMap.get(instanceUUID);
            // }
            if (!browserController) throw new Error('Target Lost');
        } else {
            browserController = new BrowserController();
            this.instanceUUIDBrowserControllerMap.set(browserController.instanceUUID, browserController);
        }
        const result = await browserController.execute(msg);
        const resultParams = {
            textContent : result ? result.textContent : null,
            propertyValue : result ? result.propertyValue : null,
            x : result ? result.x : null,
            y : result ? result.y : null,
            width : result ? result.width : null,
            height : result ? result.height : null,
            exists : result ? result.exists : null,
            tagName : result ? result.tagName : null,
            image : result ? result.image : null,
            scrapedData : result ? result.scrapedData : null,
            elements : result ? result.elements : null,
            instanceUUID : browserController.instanceUUID,
            evaluateResult : result ? result.evaluateResult : null,
            outerHTML : result ? result.outerHTML : null
        }
        this.instanceUUIDBrowserControllerMap.set(browserController.instanceUUID, browserController);
        
        const nextMsg = this.process.shift();
        if (nextMsg === undefined) return sendMessageToView(CRX_COMMAND.CMD_END_PROCESS);
        this.execute(nextMsg, resultParams);
    }
}