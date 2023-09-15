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
        name : 'DataScraping',
        component : () => import('@/components/DataScraping.vue')
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