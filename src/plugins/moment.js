import Vue from 'vue';
import moment from 'moment';
import store from '../store';
// import 'moment/locale/ko';
const lang = store.state.globalLan;
moment.locale(lang);

Vue.prototype.$moment = moment;
