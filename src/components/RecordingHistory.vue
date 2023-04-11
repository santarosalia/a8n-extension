<template>
<v-container class="pa-0">
    <v-list :height="listHeight">
      <v-list-item v-if="records.length == 0" title="레코딩 내역이 없습니다"></v-list-item>
      <v-list-item v-for="item, i in records" :value="i" density="compact">
        <template v-slot:default>
          {{EVENT_TYPE_TO_KOREAN[item.type]}}
          <br>
          <span v-if="item.localName">
            Tag : {{ item.localName }}
          </span>
          <span v-else-if="item.value">
            Value : {{ item.value }}
          </span>
          <span v-else-if="item.url">
            URL : {{ item.url }}
          </span>
        </template>
        <template v-slot:append>
          <v-btn variant="text" icon>
            <v-icon icon="mdi-minus"></v-icon>
          </v-btn>
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
const listHeight = ref(window.innerHeight * 80 / 100);
const records = computed(():CapturedEventDetails[]=> store.getters['getRecords']);
const onResize = () => {
  listHeight.value = window.innerHeight * 80 / 100;
}
window.addEventListener('resize', onResize);
</script>
