import {createWebHistory, createRouter} from 'vue-router';

const routes = [
    {
        path : '/rh',
        name : 'RecordingHistory',
        component : () => import('@/components/RecordingHistory.vue')
    },
    {
        path : '/ds',
        name : 'DataScrapping',
        component : () => import('@/components/DataScrapping.vue')
    },
    {
        path : '/:pathMatch(.*)',
        redirect : 'rh'
    }
];

const router = createRouter({
    history : createWebHistory(),
    routes
});

export default router;