import { createStore } from "vuex";
import { EVENT, CRX_STATE } from '@CrxConstants'
import { getItemFromLocalStorage, setItemFromLocalStorage, sendMessageToServiceWorker, switchFrame, editImage } from "@CrxApi";
import { toRaw } from "vue";
import { CapturedEvent } from "@CrxClass";
import { CRX_COMMAND, ScrapingDatas } from "@CrxInterface";

const getInitState = () => {
    const state = {
        CRX_RECORDS : [],
        CRX_SCRAPING_DATAS : {
            exceptRow : [],
            data : []
        },
    }
    Object.keys(CRX_STATE.CRX_DIALOG_STATE).forEach(key => {
        state[key] = false;
    });
    return state;
}

export default createStore({
    modules : {
    },
    state : getInitState(),
    getters : {
        CRX_RECORDS(state) {
            return state.CRX_RECORDS;
        },
        CRX_SCRAPING_DATAS(state) {
            return state.CRX_SCRAPING_DATAS;
        },
        CRX_MULTI_PAGE_DIALOG(state) {
            return state[CRX_STATE.CRX_DIALOG_STATE.CRX_MULTI_PAGE_DIALOG];
        },
        CRX_CONFIRM_DIALOG(state) {
            return state[CRX_STATE.CRX_DIALOG_STATE.CRX_CONFIRM_DIALOG];
        }
    },
    mutations : {
        CRX_RECORDS(state, CRX_RECORDS) {
            state.CRX_RECORDS = CRX_RECORDS;
        },
        CRX_SCRAPING_DATAS(state, CRX_SCRAPING_DATA) {
            state.CRX_SCRAPING_DATAS = CRX_SCRAPING_DATA;
        },
        CRX_MULTI_PAGE_DIALOG(state, payload) {
            state[CRX_STATE.CRX_DIALOG_STATE.CRX_MULTI_PAGE_DIALOG] = payload;
        }
    },
    actions : {
        DISPATCH_RECORDS({commit}) {
            getItemFromLocalStorage([CRX_STATE.CRX_RECORDS]).then(result => {
                commit(CRX_STATE.CRX_RECORDS, result[CRX_STATE.CRX_RECORDS]);
            });
        },
        async ADD_NEW_RECORD({ getters }, payload) {
            console.log(CRX_STATE.CRX_RECORDS)
            const records = toRaw(getters[CRX_STATE.CRX_RECORDS]);
            console.log(records)
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
                    await sendMessageToServiceWorker(CRX_COMMAND.CMD_CAPTURE_IMAGE).then(async result => {
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
            setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, records);
        },
        REMOVE_RECORD({ getters }, index : number) {
            const records = toRaw(getters[CRX_STATE.CRX_RECORDS]);
            records.splice(index, 1);
            setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, records);
        },
        EDIT_RECORD({ getters }, payload) {
            const records = toRaw(getters[CRX_STATE.CRX_RECORDS]);
            records[payload.index] = toRaw(payload.record);
            setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, records);
        },
        RECORDING_WINDOW_FOCUS() {
            sendMessageToServiceWorker(CRX_COMMAND.CMD_RECORDING_WINDOW_FOCUS);
        },
        ADD_SCRAPING_DATA({ getters }, payload) {
            const scrapingDatas = toRaw(getters[CRX_STATE.CRX_SCRAPING_DATAS] as ScrapingDatas);
            const newVal = payload.newValue.data;
            console.log(123123123)
            console.log(scrapingDatas)
            scrapingDatas.data.push(newVal);
            setItemFromLocalStorage(CRX_STATE.CRX_SCRAPING_DATAS, scrapingDatas);
        },
        DISPATCH_SCRAPING_DATAS({ commit }) {
            getItemFromLocalStorage([CRX_STATE.CRX_SCRAPING_DATAS]).then(result => {
                commit(CRX_STATE.CRX_SCRAPING_DATAS, result[CRX_STATE.CRX_SCRAPING_DATAS]);
            });
        },
        CLEAR_SCRAPING_DATA() {
            setItemFromLocalStorage(CRX_STATE.CRX_SCRAPING_DATAS, {
                exceptRow : [] as number[],
                data : []
            });
        },
        REMOVE_COLUMN({getters}, payload) {
            const colIdx = payload.colIdx;
            const removeIdx = payload.removeIdx;
            
            const scrapingDatas = toRaw(getters[CRX_STATE.CRX_SCRAPING_DATAS] as ScrapingDatas);
            scrapingDatas.data[colIdx].exceptColumn.push(removeIdx);

            setItemFromLocalStorage(CRX_STATE.CRX_SCRAPING_DATAS, scrapingDatas);
        },
        REMOVE_ROW({ getters }, payload : number) {
            const scrapingDatas = toRaw(getters[CRX_STATE.CRX_SCRAPING_DATAS] as ScrapingDatas);
            scrapingDatas.exceptRow.push(payload);
            setItemFromLocalStorage(CRX_STATE.CRX_SCRAPING_DATAS, scrapingDatas);
        },
        SELECT_NEXT_PAGE_BUTTON() {
            sendMessageToServiceWorker(CRX_COMMAND.CMD_CAPTURE_NEXT_PAGE_BUTTON);
        }

    }
});