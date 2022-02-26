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
    currentCliplist: {},
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
    SET_Pagination(state, response) {
      const index = state.likedStreamer.findIndex((el) => el === response.data);
      state.likedStreamer[index].pagination = response.pagination;
    },
    SET_currCliplist(state, response) {
      if (response.data.id === undefined) {
        state.currentCliplist = {};
        // this.commit('SET_SnackBar', { type: response.type, text: response.text, value: true });
      } else {
        state.currentCliplist = response.data;
        // this.commit('SET_SnackBar', { type: response.type, text: response.text, value: true });
      }
    },
    INIT_currCliplist(state) {
      state.currentCliplist = {};
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
      if (existingCliplist[response.listIndex].pinnedClips.length < 30) {
        if (existingCliplist[response.listIndex].pinnedClips.find((ele) => ele.id === response.data.id)) {
          const title = response.data.title.length > 25 ? `${response.data.title.substr(0, 24)}...` : response.data.title;
          this.commit('SET_SnackBar', { type: 'error', text: `ClipList : ${title} 는 이미 있습니다.`, value: true });
        } else {
          existingCliplist[response.listIndex].pinnedClips.push(response.data);
          localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
          state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
          state.currentCliplist = {};
          const title = response.data.title.length > 25 ? `${response.data.title.substr(0, 24)}...` : response.data.title;
          this.commit('SET_SnackBar', { type: 'success', text: `ClipList : ${title} 가 추가되었습니다.`, value: true });
        }
      } else {
        this.commit('SET_SnackBar', { type: 'error', text: 'ClipList : 클립을 더 이상 저장할 수 없습니다.', value: true });
      }
    },
    UPDATE_clipList(state, response) {
      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      const currentDataIndex = existingCliplist.findIndex((el) => el.id === response.id);
      existingCliplist[currentDataIndex].title = response.title;
      existingCliplist[currentDataIndex].color = response.color;
      localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      state.currentCliplist = existingCliplist[currentDataIndex];
      this.commit('SET_SnackBar', { type: 'success', text: `Clip Title : ${response.title} 으로 변경되었습니다..`, value: true });
    },
    SET_newCliplist(state, response) {
      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      const uid = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
             + Math.random().toString(16).slice(2)
             + Date.now().toString(16).slice(4);
      const input = {
        id: uid,
        title: response.title,
        color: response.color,
        pinnedClips: [],
      };
      localStorage.setItem('cliplist', JSON.stringify(input));
      existingCliplist.push(input);
      localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      const title = response.title.length > 25 ? `${response.title.substr(0, 24)}...` : response.title;
      this.commit('SET_SnackBar', { type: 'success', text: `ClipList : ${title} 가 추가되었습니다.`, value: true });
    },
    DELETE_cliplist(state, response) {
      const temp = JSON.parse(localStorage.getItem('allCliplists'));
      const index = temp.findIndex((el) => el.id === response.target.id);
      temp.splice(index, 1);
      localStorage.setItem('allCliplists', JSON.stringify(temp));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      state.currentCliplist = {};
      const title = response.target.title.length > 25 ? `${response.target.title.substr(0, 24)}...` : response.target.title;
      this.commit('SET_SnackBar', { type: 'error', text: `ClipList : ${title}가 삭제되었습니다.`, value: true });
    },
    INIT_localStorage(state) {
      state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
    },
    DELETE_clip(state, response) {
      const temp = JSON.parse(localStorage.getItem('allCliplists'));
      const listindex = state.cliplist.findIndex((el) => el.id === response.belongsTo.id);
      const clipindex = state.currentCliplist.pinnedClips.findIndex((el) => el.id === response.target.id);
      temp[listindex].pinnedClips.splice(clipindex, 1);
      localStorage.setItem('allCliplists', JSON.stringify(temp));
      const title = response.target.title.length > 25 ? `${response.target.title.substr(0, 24)}...` : response.target.title;
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      state.currentCliplist = temp[listindex];
      this.commit('SET_SnackBar', { type: 'error', text: `Clip : ${title}가 삭제되었습니다.`, value: true });
    },
  },
  actions: {
  },
  modules: {
  },
});
