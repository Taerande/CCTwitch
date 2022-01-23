import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    searchBar: false,
    searchList: [],
    headerConfig: {
      Authorization: process.env.VUE_APP_TWTITCH_OAUTH,
      'Client-id': process.env.VUE_APP_TWITCH_CLIENT_ID,
      Accept: process.env.VUE_APP_TWITCH_HEADER_ACCEPT,
    },
    VidClipData: [],
    searchQuery: '',

  },
  mutations: {
    TOGGLE_SearchBar(state) {
      state.searchBar = !state.searchBar;
    },
    SET_SearchList(state, response) {
      state.searchList = response;
    },
    SET_VidClipData(state, response) {
      state.VidClipData = response;
    },
  },
  actions: {
  },
  modules: {
  },
});
