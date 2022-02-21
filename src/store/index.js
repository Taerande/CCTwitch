import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    snackbar: {
      type: 'error',
      text: '',
      value: false,
    },
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
    pinnedClips: [],
    cliplist: [],
    userInfo: {},
  },
  mutations: {
    SET_UserInfo(state, response) {
      state.userInfo = response;
    },
    SET_SnackBar(state, response) {
      state.snackbar.type = response.type;
      state.snackbar.text = response.text;
      state.snackbar.value = response.value;
      if (response.value === undefined) state.snackbar.value = true;
    },
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
      temp.splice(response.index, 1);
      localStorage.setItem('alllikes', JSON.stringify(temp));
      state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
      this.commit('SET_SnackBar', { type: 'error', text: `BookMark : ${response.display_name} 님이 삭제되었습니다.`, value: true });
    },
    SET_LikedStreamer(state, response) {
      const existinglikes = JSON.parse(localStorage.getItem('alllikes'));
      const input = response;
      if (existinglikes.length <= 9) {
        localStorage.setItem('liked', JSON.stringify(input));
        // Save allEntries back to local storage
        existinglikes.push(input);
        localStorage.setItem('alllikes', JSON.stringify(existinglikes));
        this.commit('SET_SnackBar', { type: 'success', text: `BookMark : ${input.display_name} 님이 추가되었습니다.`, value: true });
      } else {
        this.commit('SET_SnackBar', { type: 'error', text: 'Liked Streamer 목록이 꽉 찼습니다.', value: true });
      }
      state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
    },
    ADD_pinnedClip(state, response) {
      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      if (existingCliplist[response.listIndex].pinnedClips.find((ele) => ele.id === response.data.id)) {
        this.commit('SET_SnackBar', { type: 'error', text: `ClipList : ${response.data.title} 는 이미 있습니다.`, value: true });
      } else {
        existingCliplist[response.listIndex].pinnedClips.push(response.data);
        localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
        state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
        this.commit('SET_SnackBar', { type: 'success', text: `ClipList : ${response.data.title} 가 추가되었습니다.`, value: true });
      }
    },
    DELETE_pinnedClip(state, response) {
      const target = state.pinnedClips.find((ele) => ele === response);
      const index = state.pinnedClips.indexOf(target);
      state.pinnedClips.splice(index, 1);
    },
    SET_newCliplist(state, response) {
      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      const input = {
        id: existingCliplist.length,
        title: response.title,
        color: response.color,
        pinnedClips: [],
      };
      localStorage.setItem('cliplist', JSON.stringify(input));
      existingCliplist.push(input);
      localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      this.commit('SET_SnackBar', { type: 'success', text: `ClipList : ${response.title} 가 추가되었습니다.`, value: true });
    },
    DELETE_newCliplist(state, response) {
      const temp = JSON.parse(localStorage.getItem('allCliplists'));
      temp.splice(response.index, 1);
      localStorage.setItem('allCliplists', JSON.stringify(temp));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      this.commit('SET_SnackBar', { type: 'error', text: `ClipList : ${response.title}가 삭제되었습니다.`, value: true });
    },
    INIT_localStorage(state) {
      state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
    },
  },
  actions: {
  },
  modules: {
  },
});
