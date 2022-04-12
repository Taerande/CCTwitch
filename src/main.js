import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import './plugins/firebase';
import Ads from 'vue-google-adsense'


Vue.use(require('vue-script2'))
Vue.use(Ads.Adsense)
Vue.use(Ads.InArticleAdsense)
Vue.use(Ads.InFeedAdsense)
// import VuetifyDialog from 'vuetify-dialog';
// import 'vuetify-dialog/dist/vuetify-dialog.css';

// Vue.use(VuetifyDialog, {
//   context: {
//     vuetify,
//   },
// });

Vue.config.productionTip = false;
new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
