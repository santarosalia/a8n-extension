import { createStore } from "vuex";
import { CRX_RECORDS, EVENT } from '@CrxConstants'
import { getItemFromLocalStorage, setItemFromLocalStorage, sendMessageToServiceWorker, switchFrame, editImage } from "@CrxApi";
import { toRaw } from "vue";
import { CRX_CMD } from "@CrxConstants";
import { CapturedEvent, CrxInputEvent } from "@CrxClass";

export default createStore({
    modules : {
    },
    state : {
        CRX_RECORDS : []
    },
    getters : {
        getRecords(state) {
            return state.CRX_RECORDS;
        }
    },
    mutations : {
        setRecords(state, CRX_RECORDS) {
            state.CRX_RECORDS = CRX_RECORDS;
        }
    },
    actions : {
        dispatchRecords({commit}) {
            getItemFromLocalStorage([CRX_RECORDS]).then(result => {
                commit('setRecords', result[CRX_RECORDS]);
            })
        },
        async addNewRecord({ getters }, payload) {
            const records = toRaw(getters['getRecords']);
            const newVal = payload.newValue as CapturedEvent;
            const oldVal = payload.oldValue as CapturedEvent;
            
            if (oldVal.type === EVENT.INPUT && newVal.type === EVENT.INPUT) {
                records.pop();
            }
            
            switch (newVal.type) {
                case EVENT.MOVETAB || EVENT.OPENBROWSER : {
                    break;
                }
                default : {
                    await sendMessageToServiceWorker(CRX_CMD.CMD_CAPTURE_IMAGE).then(async result => {
                        if (result.error) throw new Error(result.error);
                        await editImage(result.image, newVal.rect).then(result => {
                            
                            newVal.image = result;
                        });
                    }).catch(e =>{
                    });
                }
            }
            
            
            const isSameFrame : boolean = JSON.stringify(oldVal.frameStack) === JSON.stringify(newVal.frameStack);
            if (!isSameFrame) records.push(switchFrame(newVal));
            records.push(newVal);
            setItemFromLocalStorage(CRX_RECORDS, records);
        },
        removeRecord({ getters }, index : number) {
            const records = toRaw(getters['getRecords']);
            records.splice(index, 1);
            setItemFromLocalStorage(CRX_RECORDS, records);
        },
        editRecord({ getters }, payload) {
            const records = toRaw(getters['getRecords']);
            records[payload.index] = toRaw(payload.record);
            setItemFromLocalStorage(CRX_RECORDS, records);
        },
        recordingWindowFocus() {
            sendMessageToServiceWorker(CRX_CMD.CMD_RECORDING_WINDOW_FOCUS);
        }
    }
});