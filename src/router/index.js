import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import store from '../store';
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
const streamer = () => import(/* webpackChunkName: "streamer" */ '@/views/Streamer.vue');
// const Analysis = () => import(/* webpackChunkName: "Analysis" */ '@/views/Analysis.vue');
// const Random = () => import(/* webpackChunkName: "Random" */ '@/views/Random.vue');
const PageNotFound = () => import(/* webpackChunkName: "PageNotFound" */ '@/views/PageNotFound.vue');

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
    path: '/streamer',
    name: 'streamer',
    component: streamer,
  },
  // {
  //   path: '/analysis',
  //   name: 'Analysis',
  //   component: Analysis,
  // },
  // {
  //   path: '/random',
  //   name: 'Random',
  //   component: Random,
  // },
  {
    path: '*',
    name: 'PageNotFound',
    component : PageNotFound,
  }
  // { path: '*', beforeEnter: (to, from, next) => { next('/') } },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});
// base: process.env.BASE_URL,


router.beforeEach((to, from, next) => {
  store.commit('INIT_SnackBar')
  next()
  // store.commit('SET_FirebaseLoad', true)
  // if(store.state.firbaseLoaded) {
  //   setTimeout( () => {
  //     next()
  //   }, 500)
  // }
})
router.afterEach((to, from) => {
  // store.commit('SET_FirebaseLoad', false)
})

export default router;
