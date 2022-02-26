import Vue from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import './plugins/firebase';

// import VuetifyDialog from 'vuetify-dialog';
// import 'vuetify-dialog/dist/vuetify-dialog.css';

// Vue.use(VuetifyDialog, {
//   context: {
//     vuetify,
//   },
// });

Vue.config.productionTip = false;
new Vue({
  axios,
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
