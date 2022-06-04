import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import store from '../store';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import axios from 'axios';

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
const Search = () => import(/* webpackChunkName: "search" */ '@/views/Search.vue');
const Channel = () => import(/* webpackChunkName: "channel" */ '@/views/Channel.vue');
const User = () => import(/* webpackChunkName: "user" */ '@/views/User.vue');
const Login = () => import(/* webpackChunkName: "login" */ '@/views/Login.vue');
const UserInfo = () => import(/* webpackChunkName: "UserInfo" */ '@/components/User/index.vue');
const Tag = () => import(/* webpackChunkName: "tag" */ '@/views/Tag.vue');
const tagIndex = () => import(/* webpackChunkName: "UserInfo" */ '@/components/tag/index.vue');
const Trending = () => import(/* webpackChunkName: "trending" */ '@/views/Trending.vue');
const Cliplist = () => import(/* webpackChunkName: "cliplist" */ '@/views/Cliplist.vue');
const cliplistList = () => import(/* webpackChunkName: "cliplistList" */ '@/components/cliplist/cliplistList.vue');
const cliplistIndex = () => import(/* webpackChunkName: "cliplistIndex" */ '@/components/cliplist/cliplistIndex.vue');
const streamer = () => import(/* webpackChunkName: "streamer" */ '@/views/Streamer.vue');
const PageNotFound = () => import(/* webpackChunkName: "PageNotFound" */ '@/views/PageNotFound.vue');


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
    path: '/tag',
    name: 'Tag',
    component: Tag,
    children: [
      {
        path: ':id',
        name: 'tagIndex',
        component: tagIndex,
        meta:{
          title: `Tag`
        }
      },
    ],
  },
  {
    path: '/mycliplist',
    name: 'cliplistList',
    component: cliplistList,
    meta:{
      requireAuth: true
    }
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


router.beforeEach( async (to, from, next) => {
  window.scroll(0,0)
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
})

export default router;
