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
const User = () => import(/* webpackChunkName: "user" */ '@/views/User.vue');
const UserInfo = () => import(/* webpackChunkName: "UserInfo" */ '@/components/User/index.vue');
const Trending = () => import(/* webpackChunkName: "trending" */ '@/views/Trending.vue');
const Cliplist = () => import(/* webpackChunkName: "cliplist" */ '@/views/Cliplist.vue');
const cliplistList = () => import(/* webpackChunkName: "cliplistList" */ '@/components/cliplist/cliplistList.vue');
const test = () => import(/* webpackChunkName: "test" */ '@/views/test.vue');
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
    path: '/user',
    name: 'User',
    component: User,
    children:[
      {
        path:':id',
        name:'userinfo',
        component: UserInfo,
      }
    ]
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
    children: [
      {
        path: ':id',
        name: 'cliplistIndex',
        component: cliplistIndex,
      },
    ],

  },
  {
    path: '/mycliplist',
    name: 'cliplistList',
    component: cliplistList,
    beforeEnter: (to, from, next) => {
      if(!store.state.userinfo.userInfo){
        router.push({name:'Home'});
        store.commit('SET_SignInDialog',true)
        store.commit('SET_SnackBar',{
          type:'error',
          text:'로그인이 필요합니다.',
          value:true,
        })
      }
      next()
    }
  },
  {
    path: '/streamer',
    name: 'streamer',
    component: streamer,
  },
  {
    path: '/test',
    name: 'test',
    component: test,
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

})
router.afterEach((to, from) => {
  // store.commit('SET_FirebaseLoad', false)
})

export default router;
