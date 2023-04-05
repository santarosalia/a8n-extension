<template>
  <v-app>
    <v-main>
      <TopBar/>
      <RouterView/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import TopBar from './components/TopBar.vue';
import { useStore } from 'vuex'

const store = useStore();
store.dispatch('dispatchRecord');

</script>
<style>
body::-webkit-scrollbar {
  display: none;
}
*::-webkit-scrollbar {
  width: 8px;
}
*::-webkit-scrollbar-track{
  background-color: gainsboro;
  border-radius: 100px;
}
*::-webkit-scrollbar-thumb{
  height: 30%;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
  border-radius: 100px;
}
</style>