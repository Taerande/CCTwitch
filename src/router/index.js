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
const Search = () => import(/* webpackChunkName: "123" */ '@/views/Search.vue');
const Channel = () => import(/* webpackChunkName: "423123" */ '@/views/Channel.vue');
const User = () => import(/* webpackChunkName: "User" */ '@/views/User.vue');
const Login = () => import(/* webpackChunkName: "Login" */ '@/views/Login.vue');
const UserInfo = () => import(/* webpackChunkName: "UserInfo" */ '@/components/User/index.vue');
const Tag = () => import(/* webpackChunkName: "Tag" */ '@/views/Tag.vue');
const TagIndex = () => import(/* webpackChunkName: "TagIndex" */ '@/components/tag/index.vue');
const Trending = () => import(/* webpackChunkName: "Trending" */ '@/views/Trending.vue');

const Cliplist = () => import(/* webpackChunkName: "Cliplist" */ '@/views/Cliplist.vue');
const CliplistIndex = () => import(/* webpackChunkName: "CliplistIndex" */ '@/components/cliplist/cliplistIndex.vue');
const CliplistList = () => import(/* webpackChunkName: "CliplistList" */ '@/components/cliplist/cliplistList.vue');
const SpecialList = () => import(/* webpackChunkName: "SpecialList" */ '@/views/Speciallist.vue');
const SpecialListIndex = () => import(/* webpackChunkName: "SpecialListIndex" */ '@/components/cliplist/speciallistIndex.vue');

const Streamer = () => import(/* webpackChunkName: "Streamer" */ '@/views/Streamer.vue');
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
        component: CliplistIndex,
      },
    ],
  },
  {
    path: '/special',
    name: 'Speciallist',
    component: SpecialList,
    children: [
      {
        path: ':id',
        name: 'SpeciallistIndex',
        component: SpecialListIndex,
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
        name: 'TagIndex',
        component: TagIndex,
        meta:{
          title: `Tag`
        }
      },
    ],
  },
  {
    path: '/mycliplist',
    name: 'CliplistList',
    component: CliplistList,
    meta:{
      requireAuth: true
    }
  },
  {
    path: '/streamer',
    name: 'streamer',
    component: Streamer,
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
