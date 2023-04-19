import {createWebHashHistory, createRouter, RouteRecordRaw} from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path : '/',
        component : () => import('@/components/recordinghistory/RecordingHistory.vue')
    },
    {
        path : '/rh',
        name : 'RecordingHistory',
        component : () => import('@/components/recordinghistory/RecordingHistory.vue')
    },
    {
        path : '/ds',
        name : 'DataScrapping',
        component : () => import('@/components/DataScrapping.vue')
    },
    {
        path : '/:pathMatch(.*)',
        redirect : '/'
    }
];

const router = createRouter({
    history : createWebHashHistory(),
    routes : routes
});

router.beforeEach((to, from, next) => {    
    next();
})

export default router;