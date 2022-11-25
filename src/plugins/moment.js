import Vue from 'vue';
import moment from 'moment';
import 'moment-duration-format';

const lang = navigator.language.split('-')[0];
moment.locale(lang);
Vue.prototype.$moment = moment;
