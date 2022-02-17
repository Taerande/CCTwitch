import Vue from 'vue';
import axios from 'axios';
import cheerio from 'cheerio';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

new Vue({
  cheerio,
  axios,
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
