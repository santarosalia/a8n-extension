import { createStore } from "vuex";
import { CRX_RECORDS } from '@CrxConstants'
import { getItemFromLocalStorage } from "@CrxApi";

export default createStore({
    modules : {
    },
    state : {
        records : []
    },
    getters : {
        getRecords(state) {
            return state.records;
        }
    },
    mutations : {
        setRecords(state, record) {
            state.records = record;
        }
    },
    actions : {
        dispatchRecords({commit}) {
            getItemFromLocalStorage([CRX_RECORDS]).then(result => {
                commit('setRecords', result[CRX_RECORDS]);
            })
        }
    }
});