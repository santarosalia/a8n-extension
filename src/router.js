import {createWebHistory, createRouter} from 'vue-router';

const routes = [
    {
        path : '/home',
        name : 'Home',
        component : () => import('./components/RecordingHistory.vue')
    },
    {
        path : '/:pathMatch(.*)',
        redirect : 'home'
    }
];

const router = createRouter({
    history : createWebHistory(),
    routes
});

export default router;