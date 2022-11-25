import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import './plugins/firebase';
import './plugins/filter';
import './plugins/moment';
import Ads from 'vue-google-adsense'
import './registerServiceWorker'
import VueApexCharts from 'vue-apexcharts'


// import './error'
Vue.use(VueApexCharts)
Vue.use(require('vue-script2'))
Vue.use(Ads.Adsense)
Vue.use(Ads.InArticleAdsense)
Vue.use(Ads.InFeedAdsense)

Vue.config.productionTip = false;
Vue.component('apexchart', VueApexCharts)

new Vue({
  store,
  router,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
