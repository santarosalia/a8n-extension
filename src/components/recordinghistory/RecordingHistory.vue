<template>
<v-container class="pa-0" fluid>
  <v-list :height="listHeight">
    <RecordingHistoryItem v-for="record, i in records" :record="record" :index="i"/>
  </v-list>
</v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import RecordingHistoryItem from '@/components/recordinghistory/RecordingHistoryItem.vue';
import { CapturedEventDetails } from '@CrxInterface';
import { CRX_STATE } from '@CrxConstants';


const store = useStore();
const listHeight = ref(window.innerHeight - (48 + 56));
const records = computed(():CapturedEventDetails[]=> store.getters[CRX_STATE.CRX_RECORDS]);
const onResize = () => {
  listHeight.value = window.innerHeight - (48 + 56);
}
window.addEventListener('resize', onResize);
</script>
