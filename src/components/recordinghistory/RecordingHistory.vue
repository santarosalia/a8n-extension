<template>
<v-container class="pa-0" fluid>
    <v-list :height="listHeight">
      <v-list-item v-if="records.length == 0" title="레코딩 내역이 없습니다"></v-list-item>
      <RecordingHistoryItem v-for="record, i in records" :record="record" :index="i"/>
    </v-list>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import RecordingHistoryItem from '@/components/recordinghistory/RecordingHistoryItem.vue';
import { CapturedEventDetails } from '@CrxInterface';


const store = useStore();
const listHeight = ref(window.innerHeight - (48 + 56));
const records = computed(():CapturedEventDetails[]=> store.getters['getRecords']);
const onResize = () => {
  listHeight.value = window.innerHeight - (48 + 56);
}
window.addEventListener('resize', onResize);
</script>
