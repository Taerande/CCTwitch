import Vue from 'vue';
import store from './store'

Vue.config.errorHandler = e => {
  store.commit('SET_SnackBar', {type:'error', text:e.message, value: true});
}
