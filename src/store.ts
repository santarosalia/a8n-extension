import { createStore } from "vuex";
import { CRX_RECORDS } from '@CrxConstants'
import { getItemFromLocalStorage, setItemFromLocalStorage } from "@CrxApi";
import { toRaw } from "vue";

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
        }
    }
});