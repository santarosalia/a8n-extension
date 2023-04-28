<template>
    <v-bottom-navigation>
        <v-btn v-if="!isDataScraping" @click="recordingWindowFocus">
            <v-icon>mdi-map-marker</v-icon>
            레코딩 창
        </v-btn>
        <v-btn v-if="!isDataScraping">
            <v-icon>mdi-inbox-arrow-up</v-icon>
            저장
        </v-btn>
        <v-btn v-if="isDataScraping" @click="scrapingDataClear">
            <v-icon>mdi-minus</v-icon>
            스크래핑 초기화
        </v-btn>
        <v-btn v-if="isDataScraping">
            <v-icon>mdi-inbox-arrow-up</v-icon>
            스크래핑 저장
        </v-btn>
        <v-btn v-if="isDataScraping" @click="multiPage">
            <v-icon>mdi-plus</v-icon>
            다중 페이지
        </v-btn>
    </v-bottom-navigation>

</template>
  
<script lang="ts" setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { CRX_STATE, CRX_ACTION } from '@CrxConstants';

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
const multiPage = () => {
   store.commit(CRX_STATE.CRX_DIALOG_STATE.CRX_MULTI_PAGE_DIALOG, true);
}
</script>
  