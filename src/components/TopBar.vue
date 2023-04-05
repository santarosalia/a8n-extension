<template>
    <v-card>
        <v-tabs v-model="tab">
            <v-tab v-for="menu in topbarMenu" :value="menu.index" @click="pushRouter(menu)">{{ menu.title }}</v-tab>
        </v-tabs>
    </v-card>
</template>
  
<script lang="ts" setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router';
    import CrxConstants from '@/js/constants/CrxConstants.js';
    import { TopbarMenu } from '@/ts/interface/CrxInterface';

    const router = useRouter();
    const topbarMenu = CrxConstants.topbarMenu;
    const tab = ref(null);

    const pushRouter = (menu : TopbarMenu) => {
        router.push(menu.path);
    }
</script>
  