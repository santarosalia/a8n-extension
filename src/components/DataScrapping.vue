<template>
    <v-container>
      
        ds
    </v-container>
  </template>
  
<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore();
const records = computed(()=> store.getters['getRecord']);
</script>
  