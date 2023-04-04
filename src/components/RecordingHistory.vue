<template>
  <v-container>
    {{ d }}
    <v-btn></v-btn>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
const d = ref('');
chrome.storage.local.get(['WD_CRX_RECORD']).then(result => {
  d.value = result['WD_CRX_RECORD'];
})
</script>
