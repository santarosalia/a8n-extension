<template>
    <v-card>
        <v-tabs v-model="tab">
            <v-tab value="1">레코딩 내역</v-tab>
            <v-tab value="2">데이터 스크래핑</v-tab>
        </v-tabs>
    </v-card>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore();
const tab = ref(null);
const records = computed(()=> store.getters['getRecord']);
</script>
  