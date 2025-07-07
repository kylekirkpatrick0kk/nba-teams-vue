import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import TeamAnalytics from '../views/TeamAnalytics.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/team-analytics',
    name: 'TeamAnalytics',
    component: TeamAnalytics,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;