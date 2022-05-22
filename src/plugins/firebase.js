import Vue from 'vue';

import firebase from 'firebase/compat/app';
import firebaseConfig from '../../firebaseConfig';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import store from '../store'

firebase.initializeApp(firebaseConfig);

Vue.prototype.$firebase = firebase;
Vue.prototype.$firertdb = firebase.database();
Vue.prototype.$firestore = firebase.firestore();
// Vue.prototype.$isAuth = false;


firebase.auth().onAuthStateChanged( async (user) => {
  store.commit('SET_FirebaseLoad', true)
  if (user) {
    await store.dispatch('setUserInfo',user);
    // store.dispatch('SET_FirebaseLoad', true)
    // localStorage.setItem('userInfo',JSON.stringify(user));
    // router.push('/')
  } else {
    await store.dispatch('setUserInfo',null);
  }
  await store.dispatch('setFirebaeStatus', true);
});

