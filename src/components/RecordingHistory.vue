<template>
  <v-container>

    <v-list>
      <v-list-item v-for="item in records" :title="EVENT_TYPE_TO_KOREAN[item.type]" :subtitle="item.xpath" :value="item.index">
        <template v-slot:prepend>
          {{ item.index }}
        </template>
        {{ item.timestamp }}
        {{ item.fullXpath}}
      </v-list-item>
    </v-list>
    
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { CapturedEventDetails } from '@CrxInterface';
import { EVENT_TYPE_TO_KOREAN } from '@CrxConstants';

const store = useStore();
const records = computed(():CapturedEventDetails[]=> store.getters['getRecords']);
</script>
