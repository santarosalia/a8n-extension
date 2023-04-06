<template>
    <v-card>
        <v-tabs v-model="tab">
            <v-tab v-for="menu in topbarMenus" :value="menu.index" @click="pushRouter(menu)">{{ menu.title }}</v-tab>
        </v-tabs>
    </v-card>
</template>
  
<script lang="ts" setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router';
    import { topbarMenu } from '@CrxConstants';
    import { TopbarMenuDetails } from '@CrxInterface';

    const router = useRouter();
    const topbarMenus = topbarMenu;
    const tab = ref(null);

    const pushRouter = (menu : TopbarMenuDetails) => {
        router.push(menu.path);
    }
</script>
  