<template>
    <v-bottom-navigation>
        <v-btn v-if="!isDataScraping" @click="recordingWindowFocus">
            <v-icon>mdi-map-marker</v-icon>
            레코딩 창
        </v-btn>
        <v-btn v-if="!isDataScraping" @click="saveData">
            <v-icon>mdi-inbox-arrow-up</v-icon>
            저장
        </v-btn>
        <v-btn v-if="isDataScraping" @click="scrapingDataClear">
            <v-icon>mdi-cancel</v-icon>
            스크래핑 초기화
        </v-btn>
        <v-btn v-if="isDataScraping" @click="saveScrapingData">
            <v-icon>mdi-inbox-arrow-up</v-icon>
            스크래핑 저장
        </v-btn>
        <v-btn v-if="isDataScraping" @click="multiPage">
            <v-icon>mdi-text-box-multiple-outline</v-icon>
            다중 페이지
        </v-btn>
    </v-bottom-navigation>

</template>
  
<script lang="ts" setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { CRX_STATE, CRX_ACTION } from '@CrxConstants';
import { ScrapingDatas } from '@/ts/interface/CrxInterface';
import { CrxDataScrapingEvent } from '@CrxClass';

const store = useStore();
const router = useRouter();

const currentRoute = computed(() => router.currentRoute.value);

const isDataScraping = computed(() => currentRoute.value.path === '/ds');

const recordingWindowFocus = () => {
    store.dispatch(CRX_ACTION.RECORDING_WINDOW_FOCUS);
}
const scrapingDataClear = () => {
    store.dispatch(CRX_ACTION.CLEAR_SCRAPING_DATA)
}
const saveScrapingData = () => {
    let data : any;
    const isMultiPage = store.getters[CRX_STATE.CRX_IS_MULTI_PAGE];
    const scrapingDatas = store.getters[CRX_STATE.CRX_SCRAPING_DATAS] as ScrapingDatas;
    if (scrapingDatas.data.length === 0) return;
    const exceptRow = scrapingDatas.exceptRow;
    const patterns = scrapingDatas.data.map(item => item.pattern);
    const columnSize = scrapingDatas.data.map(item => item.columnSize);
    const exceptColumn = scrapingDatas.data.map(item => item.exceptColumn);
    const frameStack = scrapingDatas.frameStack.map(item => item);
    
    if (isMultiPage) {
        const pageCnt = store.getters[CRX_STATE.CRX_PAGE_COUNT];
        const nextPageButton = store.getters[CRX_STATE.CRX_NEXT_PAGE_BUTTON];
        const nextPageNumber = store.getters[CRX_STATE.CRX_NEXT_PAGE_NUMBER];
        
        data = {
            patterns : patterns,
            columnSize : columnSize,
            exceptColumn : exceptColumn,
            exceptRow : exceptRow,
            pageCnt : pageCnt,
            pageXpath : nextPageButton,
            paginationXpath : nextPageNumber,
            frameStack : frameStack
        }
    } else {
        data = {
            patterns : patterns,
            columnSize : columnSize,
            exceptColumn : exceptColumn,
            exceptRow : exceptRow,
            frameStack : frameStack
        }
    }
    const e = new CrxDataScrapingEvent(null, data);
    console.log(e)
    store.dispatch(CRX_ACTION.SAVE_DATA_SCRAPING, e);
    store.dispatch(CRX_ACTION.CLEAR_SCRAPING_DATA);
    router.push('/rh');
    store.commit(CRX_STATE.CRX_IS_MULTI_PAGE, false);
    
}
const multiPage = () => {
   store.commit(CRX_STATE.CRX_DIALOG_STATE.CRX_MULTI_PAGE_DIALOG, true);
}

const saveData = () => {
    store.dispatch(CRX_ACTION.SAVE_DATA);
}
</script>
  