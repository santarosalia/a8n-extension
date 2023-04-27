import { createStore } from "vuex";
import { CRX_RECORDS, CRX_SCRAPING_DATAS, EVENT } from '@CrxConstants'
import { getItemFromLocalStorage, setItemFromLocalStorage, sendMessageToServiceWorker, switchFrame, editImage } from "@CrxApi";
import { toRaw } from "vue";
import { CapturedEvent } from "@CrxClass";
import { CRX_COMMAND, ScrapingDatas } from "@CrxInterface";

export default createStore({
    modules : {
    },
    state : {
        CRX_RECORDS : [],
        CRX_SCRAPING_DATAS : {
            exceptRow : [],
            data : []
        }
    },
    getters : {
        getRecords(state) {
            return state.CRX_RECORDS;
        },
        getScrapingDatas(state) {
            return state.CRX_SCRAPING_DATAS;
        }

    },
    mutations : {
        setRecords(state, CRX_RECORDS) {
            state.CRX_RECORDS = CRX_RECORDS;
        },
        setScrapingDatas(state, CRX_SCRAPING_DATA) {
            state.CRX_SCRAPING_DATAS = CRX_SCRAPING_DATA;
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
            sendMessageToServiceWorker(CRX_COMMAND.CMD_RECORDING_WINDOW_FOCUS);
        },
        addScrapingData({ getters }, payload) {
            const scrapingDatas = toRaw(getters['getScrapingDatas'] as ScrapingDatas);
            const newVal = payload.newValue.data;
            console.log(123123123)
            console.log(scrapingDatas)
            scrapingDatas.data.push(newVal);
            setItemFromLocalStorage(CRX_SCRAPING_DATAS, scrapingDatas);
        },
        dispatchScrapingDatas({ commit }) {
            getItemFromLocalStorage([CRX_SCRAPING_DATAS]).then(result => {
                commit('setScrapingDatas', result[CRX_SCRAPING_DATAS]);
            });
        },
        clearScrapingData() {
            setItemFromLocalStorage(CRX_SCRAPING_DATAS, {
                exceptRow : [] as number[],
                data : []
            });
        },
        removeColumn({getters}, payload) {
            const colIdx = payload.colIdx;
            const removeIdx = payload.removeIdx;
            
            const scrapingDatas = toRaw(getters['getScrapingDatas'] as ScrapingDatas);
            scrapingDatas.data[colIdx].exceptColumn.push(removeIdx);

            setItemFromLocalStorage(CRX_SCRAPING_DATAS, scrapingDatas);
        },
        removeRow({ getters }, payload : number) {
            const scrapingDatas = toRaw(getters['getScrapingDatas'] as ScrapingDatas);
            scrapingDatas.exceptRow.push(payload);
            setItemFromLocalStorage(CRX_SCRAPING_DATAS, scrapingDatas);
        }

    }
});