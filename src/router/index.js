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
const cliplistList = () => import(/* webpackChunkName: "cliplistList" */ '@/components/cliplist/cliplistList.vue');
const cliplistIndex = () => import(/* webpackChunkName: "cliplistIndex" */ '@/components/cliplist/cliplistIndex.vue');
const test = () => import(/* webpackChunkName: "test" */ '@/views/test.vue');
const Import = () => import(/* webpackChunkName: "import" */ '@/views/Import.vue');
const Liked = () => import(/* webpackChunkName: "liked" */ '@/views/Liked.vue');
const Analysis = () => import(/* webpackChunkName: "liked" */ '@/views/Analysis.vue');
const Random = () => import(/* webpackChunkName: "liked" */ '@/views/Random.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'about',
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
    path: '/clip',
    name: 'Cliplist',
    component: Cliplist,
    children: [
      {
        path: ':id',
        name: 'cliplistIndex',
        component: cliplistIndex,
      },
    ],

  },
  {
    path: '/cliplist',
    name: 'cliplistList',
    component: cliplistList,
  },
  {
    path: '/import/:id',
    name: 'Import',
    component: Import,
  },
  {
    path: '/test',
    name: 'Test',
    component: test,
  },
  {
    path: '/liked',
    name: 'Liked',
    component: Liked,
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: Analysis,
  },
  {
    path: '/random',
    name: 'Random',
    component: Random,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
