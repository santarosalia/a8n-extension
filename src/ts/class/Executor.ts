import { ExecuteRequestMessage, ExecuteResponseMessage } from "@CrxInterface";
import { BrowserAction, ElementAction } from "@CrxConstants";
import { BrowserController } from "./CrxBrowserController";

export class Executor {
    instanceUUIDBrowserControllerMap: Map<string, BrowserController>
    instanceUUID: string
    index: number
    process: ExecuteRequestMessage[]
    constructor (process: ExecuteRequestMessage[]) {
        this.process = process;
        this.instanceUUIDBrowserControllerMap = new Map<string, BrowserController>();
        const [msg] = process;
        this.execute(msg);
        // const promiseses = process.map(msg => {
        //     return this.execute(msg);
        // });
        // promiseses.reduce(async (prev, curr) => {
        //     return prev.then(async (result) => {
        //         if (result) {
        //             this.instanceUUID = result.instanceUUID;
        //         }
        //         return curr
        //     }).catch(e => {
        //         console.log(e);
        //     })
        // }, Promise.resolve());
    }
    async execute (msg: ExecuteRequestMessage, instanceUUID?: any) {
        // console.log(msg)
        let browserController: BrowserController;
        const isElement = Object.values(ElementAction).includes(msg.object.action as any);
        const isWait = msg.object.action === BrowserAction.WAIT;
        // console.log(params)
        if (instanceUUID) {
            if (isElement) {
                browserController = Array.from(this.instanceUUIDBrowserControllerMap.values()).find(browserController => browserController.instanceUUIDElementControllerMap.has(instanceUUID));
            } else {
                console.log(instanceUUID)
                console.log(this.instanceUUIDBrowserControllerMap)
                browserController = this.instanceUUIDBrowserControllerMap.get(instanceUUID);
            }
            if (!browserController) throw new Error('Target Lost');
        } else {
            browserController = new BrowserController();
            this.instanceUUIDBrowserControllerMap.set(browserController.instanceUUID, browserController);
        }
        const result = await browserController.execute(msg);
        // if (isWait) this.instanceUUID = result.instanceUUID;
        this.instanceUUIDBrowserControllerMap.set(browserController.instanceUUID, browserController);
        
        this.process.shift();
        console.log(this.process)
        const [nextMsg] = this.process;
        this.execute(nextMsg, browserController.instanceUUID);
    }
}