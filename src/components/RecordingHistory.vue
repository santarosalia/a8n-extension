<template>
  <v-container>
    <div v-for="item in d">
      {{ item.type }}
    </div>
    <v-btn></v-btn>
    dd
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore();
const d = computed(()=> store.getters['getRecord']);
</script>
