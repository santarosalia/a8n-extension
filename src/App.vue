<template>
  <v-app>
    <v-main>
      <TopBar/>
      <RouterView/>
    </v-main>
  </v-app>
</template>

<script setup>
import RecordingHistory from './components/RecordingHistory.vue';
import TopBar from './components/TopBar.vue';


</script>
