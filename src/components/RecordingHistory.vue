<template>
<v-container class="pa-0">
    <v-list :height="listHeight">
      <v-list-item v-if="records.length == 0" title="레코딩 내역이 없습니다"></v-list-item>
      <v-list-item v-for="item, i in records" :title="EVENT_TYPE_TO_KOREAN[item.type]" :value="i">
        <template v-slot:append>
          <v-btn variant="text" icon>
            <v-icon icon="mdi-minus"></v-icon>
          </v-btn>
        </template>
        <template v-slot:subtitle>
          {{ item.localName }}
          {{ item.value }}
          {{ item.textContent }}
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { CapturedEventDetails } from '@CrxInterface';
import { EVENT_TYPE_TO_KOREAN } from '@CrxConstants';

const store = useStore();
const listHeight = ref(window.innerHeight * 70 / 100);
const records = computed(():CapturedEventDetails[]=> store.getters['getRecords']);
const onResize = () => {
  listHeight.value = window.innerHeight * 70 / 100;
}
window.addEventListener('resize', onResize);
</script>
