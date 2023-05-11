<template>
    <v-app-bar density="compact">
        <template #default>
            <v-tabs v-model="tab">
                <v-tab v-for="menu in topbarMenus" :value="menu.index" @click="pushRouter(menu)">{{ menu.title }}</v-tab>
            </v-tabs>
        </template>
    </v-app-bar>

</template>
  
<script lang="ts" setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router';
    import { topbarMenu } from '@CrxConstants';
    import { TopbarMenuDetails } from '@CrxInterface';

    const router = useRouter();
    const topbarMenus = topbarMenu;
    const tab = ref(0);
    router.push('/')
    const pushRouter = (menu : TopbarMenuDetails) => {
        router.push(menu.path);
    }
    router.beforeEach((to, from, next) => {
        if (to.path === '/rh') tab.value = 0;
        else if (to.path === '/ds') tab.value = 1;
        from.path;
        next();
    })
</script>
  