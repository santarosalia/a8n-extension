import { createStore } from "vuex";
import { CRX_RECORDS } from '@CrxConstants'
import { getItemFromLocalStorage, setItemFromLocalStorage, sendMessageToServiceWorker } from "@CrxApi";
import { toRaw } from "vue";
import { CRX_CMD } from "@CrxConstants";

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