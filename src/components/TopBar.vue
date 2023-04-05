<template>
    <v-card>
        <v-tabs v-model="tab">
            <v-tab v-for="menu in topbarMenu" :value="menu.index" @click="pushRouter(menu)">{{ menu.title }}</v-tab>
        </v-tabs>
    </v-card>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router';
import CrxConstants from '@/js/constants/CrxConstants.js';

const store = useStore();
const router = useRouter();
const topbarMenu = CrxConstants.topbarMenu;
const tab = ref(null);

const pushRouter = (menu) => {
    console.log(menu.path)
    router.push(menu.path);
}


</script>
  