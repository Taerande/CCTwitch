import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import store from '../store';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// import Channel from '../views/Channel.vue';
// import Search from '../views/Search.vue';
Vue.use(VueRouter);
firebase.getCurrentUser = () => {
  return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
      }, reject);
  })
};

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');
const Search = () => import(/* webpackChunkName: "123" */ '@/views/Search.vue');
const Channel = () => import(/* webpackChunkName: "423123" */ '@/views/Channel.vue');
const Login = () => import(/* webpackChunkName: "Login" */ '@/views/Login.vue');
const Trending = () => import(/* webpackChunkName: "Trending" */ '@/views/Trending.vue');


const Timeline = () => import(/* webpackChunkName: "Timeline" */ '@/views/Timeline.vue');

const Cliplist = () => import(/* webpackChunkName: "Cliplist" */ '@/views/Cliplist.vue');


const Mycliplist = () => import(/* webpackChunkName: "Mycliplist" */ '@/views/Mycliplist.vue');

const Timelines = () => import(/* webpackChunkName: "Timelines" */ '@/views/Timelinelist.vue');

const HotClip = () => import(/* webpackChunkName: "HotClip" */ '@/views/HotClip.vue');


const Streamer = () => import(/* webpackChunkName: "Streamer" */ '@/views/Streamer.vue');
const PageNotFound = () => import(/* webpackChunkName: "PageNotFound" */ '@/views/PageNotFound.vue');

const SpecialList = () => import(/* webpackChunkName: "SpecialList" */ '@/views/SpecialList.vue');
const User = () => import(/* webpackChunkName: "User" */ '@/views/User.vue');
const Tag = () => import(/* webpackChunkName: "Tag" */ '@/views/Tag.vue');
const Test = () => import(/* webpackChunkName: "Test" */ '@/views/Test.vue');
const Report = () => import(/* webpackChunkName: "Report" */ '@/views/Report.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/channel',
    name: 'Channel',
    component: Channel,
    meta:{
      title: `Channel`
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: async (to, from, next) => {
      const state = localStorage.getItem('state');
      if(to.query.code && to.query.state === state){
        next();
      } else {
        next({name:'Home'});
      }
    }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta:{
      title: `Search`
    }
  },
  {
    path: '/trending',
    name: 'Trending',
    component: Trending,
  },
  {
    path: '/cliplist/:id',
    name: 'Cliplist',
    component: Cliplist,
  },
  {
    path:'/timeline/:id',
    name: 'Timeline',
    component: Timeline,
  },
  {
    path:'/timelines',
    name: 'Timelines',
    component: Timelines,
  },
  {
    path: '/special/:id',
    name: 'SpecialList',
    component: SpecialList,
  },
  {
    path: '/hotclip/:id',
    name: 'HotClip',
    component: HotClip,
  },
  {
    path: '/tag/:id',
    name: 'Tag',
    component: Tag,
  },
  {
    path: '/mycliplist',
    name: 'Mycliplist',
    component: Mycliplist,
    meta:{
      requireAuth: true
    }
  },
  {
    path: '/streamer',
    name: 'Streamer',
    component: Streamer,
  },
  {
    path: '/report',
    name: 'Report',
    component: Report,
  },
  {
    path: '/test',
    name: 'Test',
    component: Test,
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


router.beforeEach( async (to, from, next) => {
  store.commit('INIT_SnackBar')
  const requireAuth = to.meta.requireAuth;
  const user = await firebase.getCurrentUser();
  if(requireAuth && user){
      next();
    } else if(requireAuth && !user) {
      next({name:'Home'});
      store.commit('SET_SnackBar', {type:'error', text:'로그인이 필요합니다.', value:true})
      store.commit('SET_SignInDialog', true)
    } else {
      next();
    }
})

router.afterEach((to, from) => {
  window.scrollTo(0,0)
})

export default router;
