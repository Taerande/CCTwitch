import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    searchString: null,
    searchBar: false,
    searchList: [],
    headerConfig: {
      Authorization: process.env.VUE_APP_TWTITCH_OAUTH,
      'Client-id': process.env.VUE_APP_TWITCH_CLIENT_ID,
      Accept: process.env.VUE_APP_TWITCH_HEADER_ACCEPT,
    },
    VidClipData: [],
    searchQuery: '',
    likedStreamer: [],
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
    DELETE_LikedStreamer(state, response) {
      const temp = JSON.parse(localStorage.getItem('alllikes'));
      temp.splice(response, 1);
      localStorage.setItem('alllikes', JSON.stringify(temp));
      state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
    },
    SET_LikedStreamer(state, response) {
      let existinglikes = JSON.parse(localStorage.getItem('alllikes'));
      if (existinglikes == null) existinglikes = [];
      if (existinglikes.length < 10) {
        const input = response;
        localStorage.setItem('liked', JSON.stringify(input));
        console.log(input);
        // Save allEntries back to local storage
        existinglikes.push(input);
        localStorage.setItem('alllikes', JSON.stringify(existinglikes));
        state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
      }
    },
  },
  actions: {
  },
  modules: {
  },
});
