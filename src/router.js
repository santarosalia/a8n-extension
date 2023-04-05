import {createWebHashHistory, createRouter} from 'vue-router';

const routes = [
    {
        path : '/',
        component : () => import('@/components/RecordingHistory.vue')
    },
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
        redirect : '/'
    }
];

const router = createRouter({
    history : createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    console.log('------------from------------');
    console.log(from);
    console.log('------------from------------');
    console.log('------------to------------');
    console.log(to)
    console.log('------------to------------');
    
    next();
})

export default router;