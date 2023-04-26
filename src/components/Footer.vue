<template>
    <v-bottom-navigation>
        <v-btn @click="recordingWindowFocus">
            <v-icon>mdi-map-marker</v-icon>
            레코딩 창
        </v-btn>
        <v-btn>
            <v-icon>mdi-inbox-arrow-up</v-icon>
            저장
        </v-btn>
        <v-btn v-if="isDataScraping" @click="scrapingDataClear">
            <v-icon>mdi-minus</v-icon>
            데이터 삭제
        </v-btn>
    </v-bottom-navigation>

</template>
  
<script lang="ts" setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const store = useStore();
const router = useRouter();

const currentRoute = computed(() => router.currentRoute.value);

const isDataScraping = computed(() => currentRoute.value.path === '/ds');

const recordingWindowFocus = () => {
    store.dispatch('recordingWindowFocus');
}
const scrapingDataClear = () => {
    store.dispatch('clearScrapingData')
}
</script>
  