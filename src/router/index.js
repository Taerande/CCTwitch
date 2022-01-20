import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Channel from '../views/Channel.vue';

Vue.use(VueRouter);

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');
const Search = () => import(/* webpackChunkName: "about" */ '@/views/Search.vue');
// const Channel = () => import(/* webpackChunkName: "about" */ '../views/Channel.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/channel',
    name: 'Channel',
    component: Channel,
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
