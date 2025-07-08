import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import TeamAnalytics from '../views/TeamAnalytics.vue';
import TeamDetails from '../components/TeamDetails.vue';

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
  {
    path: '/team/:city',
    name: 'TeamDetails',
    component: TeamDetails,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;