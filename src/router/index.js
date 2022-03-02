import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
// import Channel from '../views/Channel.vue';
// import Search from '../views/Search.vue';

Vue.use(VueRouter);

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');
const Search = () => import(/* webpackChunkName: "search" */ '@/views/Search.vue');
const Channel = () => import(/* webpackChunkName: "channel" */ '@/views/Channel.vue');
const Trending = () => import(/* webpackChunkName: "trending" */ '@/views/Trending.vue');
const Cliplist = () => import(/* webpackChunkName: "cliplist" */ '@/views/Cliplist.vue');
const test = () => import(/* webpackChunkName: "test" */ '@/views/test.vue');
const Import = () => import(/* webpackChunkName: "Import" */ '@/views/Import.vue');

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
  {
    path: '/trending',
    name: 'Trending',
    component: Trending,
  },
  {
    path: '/cliplist',
    name: 'Cliplist',
    component: Cliplist,
  },
  {
    path: '/import/:id',
    name: 'import',
    component: Import,
  },
  {
    path: '/test',
    name: 'test',
    component: test,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
