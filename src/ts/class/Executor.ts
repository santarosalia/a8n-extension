import { ExecuteRequestMessage } from "@CrxInterface";
import { BrowserAction, ElementAction } from "@CrxConstants";
import { BrowserController } from "./CrxBrowserController";
import { instanceUUIDBrowserControllerMap } from "../store/CrxStore";

export class Executor {
    constructor (process: ExecuteRequestMessage[]) {
        const promiseses = process.map(msg => {
            return this.execute(msg);
        });
        promiseses.reduce(async (prev, curr) => {
            return prev.then(() => curr).catch(e => {
                console.log(e);
            })
        }, Promise.resolve());
        
    }
    async execute (msg: ExecuteRequestMessage) {
        let browserController: BrowserController;
        const isElement = Object.values(ElementAction).includes(msg.object.action as any);
        const isWait = msg.object.action === BrowserAction.WAIT;
        if (msg.object.instanceUUID) {
            if (isElement) {
                browserController = Array.from(instanceUUIDBrowserControllerMap.values()).find(browserController => browserController.instanceUUIDElementControllerMap.has(msg.object.instanceUUID));
            } else {
                browserController = instanceUUIDBrowserControllerMap.get(msg.object.instanceUUID);
            }
            if (!browserController) throw new Error('Target Lost');
        } else {
            browserController = new BrowserController();
            instanceUUIDBrowserControllerMap.set(browserController.instanceUUID, browserController);
        }
    }
}