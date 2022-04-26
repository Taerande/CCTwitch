import Vue from 'vue';

import firebase from 'firebase/compat/app';
import firebaseConfig from '../../firebaseConfig';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import store from '../store'

firebase.initializeApp(firebaseConfig);

Vue.prototype.$firebase = firebase;
Vue.prototype.$firestore = firebase.firestore();

firebase.auth().onAuthStateChanged((user) => {
  console.log(user);
  // store.commit('SET_FirebaseLoad', true)
  if (user) {
    // store.commit('SET_FirebaseLoad', true)
    store.commit('SET_UserInfo',user)
    // router.push('/')
  } else {
  }
  });
