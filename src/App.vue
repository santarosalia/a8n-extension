<template>
  <v-app>
    <v-main>
      <TopBar/>
      <RouterView/>
      <Footer/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import TopBar from '@/components/TopBar.vue';
import { useStore } from 'vuex'
import Footer from '@/components/Footer.vue';
import { CRX_ACTION } from '@CrxConstants'
import { CRX_CONTEXT_MENU_TYPE } from '@CrxInterface';
const store = useStore();
store.dispatch(CRX_ACTION.DISPATCH_RECORDS);
store.dispatch(CRX_ACTION.DISPATCH_SCRAPING_DATAS);
store.dispatch(CRX_ACTION.CONTEXT_MENU_CHANGE, CRX_CONTEXT_MENU_TYPE.NORMAL);
</script>
<style>
@font-face {
  font-family: "nanum";
  src: url("@/assets/NanumSquareR.otf");
}
* {
  font-family: "nanum";
  font-size: small;
}
body::-webkit-scrollbar {
  display: none;
}
*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
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