<template>
  <v-container>
    
    <v-list>
      <v-list-item v-for="record in records" :title="record.type" :subtitle="record.xpath" :value="record.index">
        
      </v-list-item>
    </v-list>
    
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore();
const records = computed(()=> store.getters['getRecord']);
</script>
