import { createStore } from "vuex";
import { EVENT, CRX_STATE, CRX_NEW_RECORD } from '@CrxConstants'
import { getItemFromLocalStorage, setItemFromLocalStorage, sendMessageToServiceWorker, switchFrame, editImage} from "@CrxApi";
import { toRaw } from "vue";
import { CapturedEvent, CrxDataScrapingEvent } from "@CrxClass";
import { CRX_COMMAND, CRX_CONTEXT_MENU_TYPE, ScrapingDatas } from "@CrxInterface";
import router from "@/router";

const getInitState = () => {
    const state = {
        CRX_RECORDS : [],
        CRX_SCRAPING_DATAS : {
            exceptRow : [],
            data : [],
            frameStack : []
        },
        CRX_NEXT_PAGE_BUTTON : null,
        CRX_NEXT_PAGE_NUMBER : null,
        CRX_PAGE_COUNT : 0,
        CRX_IS_MULTI_PAGE : false
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
        },
        CRX_NEXT_PAGE_BUTTON(state) {
            return state.CRX_NEXT_PAGE_BUTTON;
        },
        CRX_NEXT_PAGE_NUMBER(state) {
            return state.CRX_NEXT_PAGE_NUMBER;
        },
        CRX_IS_MULTI_PAGE(state) {
            return state.CRX_IS_MULTI_PAGE;
        },
        CRX_PAGE_COUNT(state) {
            return state.CRX_PAGE_COUNT;
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
        },
        CRX_NEXT_PAGE_BUTTON(state, payload) {
            state[CRX_STATE.CRX_NEXT_PAGE_BUTTON] = payload;
        },
        CRX_NEXT_PAGE_NUMBER(state, payload) {
            state[CRX_STATE.CRX_NEXT_PAGE_NUMBER] = payload;
        },
        CRX_IS_MULTI_PAGE(state, payload) {
            state[CRX_STATE.CRX_IS_MULTI_PAGE] = payload;
        },
        CRX_PAGE_COUNT(state, payload) {
            state[CRX_STATE.CRX_PAGE_COUNT] = payload;
        }
    },
    actions : {
        DISPATCH_RECORDS({commit}) {
            getItemFromLocalStorage([CRX_STATE.CRX_RECORDS]).then(result => {
                commit(CRX_STATE.CRX_RECORDS, result[CRX_STATE.CRX_RECORDS]);
            });
        },
        async ADD_NEW_RECORD({ getters }, payload) {

            const records = toRaw(getters[CRX_STATE.CRX_RECORDS]);
            const newVal = payload.newValue as CapturedEvent;
            const oldVal = payload.oldValue as CapturedEvent;   

            if (oldVal && oldVal.type === EVENT.INPUT && newVal.type === EVENT.INPUT) {
                records.pop();
            }
            
            switch (newVal.type) {
                case EVENT.MOVETAB : {
                    if (!oldVal) return;
                    break;
                }
                case EVENT.POPUP : {
                    break;
                }
                case EVENT.DATASCRAPING : {
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
            
            
            if (oldVal) {
                const isSameFrame : boolean = JSON.stringify(oldVal.frameStack) === JSON.stringify(newVal.frameStack);
                if (!isSameFrame) {
                    records.push(switchFrame(newVal));
                }
            }
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
            scrapingDatas.data.push(newVal);
            scrapingDatas.frameStack = newVal.frameStack;
            router.push('/ds');
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
                data : [],
                frameStack : []
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
        CONTEXT_MENU_CHANGE({}, payload : CRX_CONTEXT_MENU_TYPE) {
            sendMessageToServiceWorker(CRX_COMMAND.CMD_CONTEXT_MENU_CHANGE, payload);
        },
        SAVE_DATA_SCRAPING({ getters }, payload : CrxDataScrapingEvent) {
            // const records = toRaw(getters[CRX_STATE.CRX_RECORDS]);
            // records.push(payload);
            // setItemFromLocalStorage(CRX_STATE.CRX_RECORDS, records);
            setItemFromLocalStorage(CRX_NEW_RECORD, payload);
        },
        SAVE_DATA() {
            // const records = toRaw(getters[CRX_STATE.CRX_RECORDS]);
            // localStorage.setItem(CRX_STATE.CRX_RECORDS, JSON.stringify(records));
            sendMessageToServiceWorker(CRX_COMMAND.CMD_RECORDING_END);
        }

    }
});