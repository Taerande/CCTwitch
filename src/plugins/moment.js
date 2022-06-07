import Vue from 'vue';
import moment from 'moment';
// import 'moment/locale/ko';
// const lang = store.state.globalLan;
const lang = navigator.language.split('-')[0];
moment.locale(lang);
Vue.prototype.$moment = moment;
