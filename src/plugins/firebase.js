import Vue from 'vue';

import firebase from 'firebase/compat/app';
import firebaseConfig from '../../firebaseConfig';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

firebase.initializeApp(firebaseConfig);

Vue.prototype.$firebase = firebase;
Vue.prototype.$firestore = firebase.firestore();
// firebase.firestore().collection('test').add({ test: 'success' });
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('log in', user);
    // var uid = user.uid;
  } else {
    console.log('not log in');
  }
  });
