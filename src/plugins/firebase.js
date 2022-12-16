import Vue from 'vue';

import firebase from 'firebase/compat/app';
import firebaseConfig from '../../firebaseConfig';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import 'firebase/compat/messaging'
import 'firebase/compat/storage'
import store from '../store'

firebase.initializeApp(firebaseConfig);

const app2 = firebase.initializeApp({
  databaseURL:"https://cctwitch-streamdata-kor.asia-southeast1.firebasedatabase.app"
},'app2')


Vue.prototype.$firebase = firebase;
Vue.prototype.$firertdb = firebase.database();
Vue.prototype.$streamData = firebase.database(app2);
Vue.prototype.$firestore = firebase.firestore();
Vue.prototype.$messaging = firebase.messaging();
Vue.prototype.$storage = firebase.storage();
// Vue.prototype.$isAuth = false;
firebase.auth().onAuthStateChanged( async (user) => {
  store.commit('SET_FirebaseLoad', true)
  if (user) {
    await store.dispatch('setUserInfo',user);
    // store.dispatch('SET_FirebaseLoad', true)
    // localStorage.setItem('userInfo',JSON.stringify(user));
  } else {
    await store.dispatch('setUserInfo',null);
  }
  await store.dispatch('setFirebaeStatus', true);
});
