import Vue from 'vue';
import VueRouter from 'vue-router';
import Admin from '../views/Admin.vue';
import Info from '../views/Info.vue';

Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    component: Info,
    name: 'Info',
  },
  {
    path: '/admin',
    component: Admin,
    name: 'Admin',
  },
  {
    path: '*',
    component: Info,
  },
];

const router = new VueRouter({
  mode: 'hash',
  // mode: 'history',
  base: './',
  routes,
});

export default router;
