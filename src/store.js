import { createStore } from "vuex";

export default createStore({
    modules : {
    },
    state : {
        record : []
    },
    getters : {
        getRecord(state) {
            return state.record;
        }
    },
    mutations : {
        setRecord(state, record) {
            state.record = record;
        }
    },
    actions : {
        dispatchRecord({commit}) {
            chrome.storage.local.get(['WD_CRX_RECORD']).then(result => {
                commit('setRecord', result['WD_CRX_RECORD']);
            });
        }
    }
});