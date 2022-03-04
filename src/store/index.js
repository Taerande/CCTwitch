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
    dateSort: {
      text: null,
      start: null,
      end: null,
    },
    userList:[]
  },
  mutations: {
    SET_DateSort(state, response) {
      state.dateSort = response;
    },
    SET_isChecked(state, response) {
      console.log(response);
      const targetIndex = state.likedStreamer.findIndex((el) =>
        el.id === response.target.id)
      state.likedStreamer[targetIndex].is_checked = response.data;
    },
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
    // SET_Pagination(state, response) {
    //   const index = state.likedStreamer.findIndex((el) => el === response.data);
    //   state.likedStreamer[index].pagination = response.pagination;
    // },
    SET_currCliplist(state, response) {
      if (response.data.id === undefined) {
        state.currentCliplist = {};
        // this.commit('SET_SnackBar', { type: response.type, text: response.text, value: true });
      } else {
        state.currentCliplist = response.data;
        // this.commit('SET_SnackBar', { type: response.type, text: response.text, value: true });
        window.scrollTo(0,0);
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
      if (existingCliplist[response.listIndex].pinnedClips.length < 100 && response.data.id !== undefined) {
        if (existingCliplist[response.listIndex].pinnedClips.find((ele) => ele.id === response.data.id)) {
          const title = response.data.title.length > 25 ? `${response.data.title.substr(0, 24)}...` : response.data.title;
          this.commit('SET_SnackBar', { type: 'error', text: `ClipList : ${title} 는 이미 있습니다.`, value: true });
        } else {
          existingCliplist[response.listIndex].pinnedClips.push(response.data);
          localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
          state.currentCliplist = existingCliplist[response.listIndex];
          state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
          const title = response.data.title.length > 25 ? `${response.data.title.substr(0, 24)}...` : response.data.title;
          this.commit('SET_SnackBar', { type: 'success', text: `ClipList : ${title} 가 추가되었습니다.`, value: true });
        }
      } else if(response.data.id === undefined) {
        this.commit('SET_SnackBar', { type: 'error', text: 'ClipList : 클립정보가 잘못 되었습니다.', value: true });
      } else {
        this.commit('SET_SnackBar', { type: 'error', text: 'ClipList : 클립을 더 이상 저장할 수 없습니다.', value: true });
      }
    },
    UPDATE_pinndedClip(state, response) {
      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      const currentDataIndex = existingCliplist.findIndex((el) => el.id === state.currentCliplist.id);
      existingCliplist[currentDataIndex].pinnedClips = response;
      localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      state.currentCliplist = existingCliplist[currentDataIndex];
      this.commit('SET_SnackBar', { type: 'info', text: 'Pinned Clip : 클립 정보를 업데이트 하였습니다.', value: true });
    },
    UPDATE_clipList(state, response) {
      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      const currentDataIndex = existingCliplist.findIndex((el) => el.id === response.id);
      if (response.title) {
        existingCliplist[currentDataIndex].title = response.title;
      }
      if (response.color) {
        existingCliplist[currentDataIndex].color = response.color;
      }
      if (response.updateId) {
        existingCliplist[currentDataIndex].id = response.updateId;
      }
      localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      state.currentCliplist = existingCliplist[currentDataIndex];
      this.commit('SET_SnackBar', { type: 'success', text: `Clip Title : ${response.title} 으로 변경되었습니다..`, value: true });
    },
    UPDATE_clipDescription(state, response){
      const temp = JSON.parse(localStorage.getItem('allCliplists'));
      const listindex = state.cliplist.findIndex((el) => el.id === state.currentCliplist.id);
      const clipindex = state.currentCliplist.pinnedClips.findIndex((el) => el.id === response.target.id);
      const uid = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
      + Math.random().toString(16).slice(2)
      + Date.now().toString(16).slice(4);
      let input = response.target;
      input = {...input, ...{description: response.data}};
      temp[listindex].pinnedClips.splice(clipindex, 1, input);
      temp[listindex].id = uid;
      state.currentCliplist.pinnedClips.splice(clipindex, 1, input);
      state.currentCliplist.id = uid;
      localStorage.setItem('allCliplists', JSON.stringify(temp));
      const title = response.target.title.length > 25 ? `${response.target.title.substr(0, 24)}...` : response.target.title;
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      this.commit('SET_SnackBar', { type: 'info', text: `Clip : ${title}에 메모가 변경되었습니다.`, value: true });

    },
    SET_newCliplist(state, response) {
      let input;

      const uid = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
                 + Math.random().toString(16).slice(2)
                 + Date.now().toString(16).slice(4);

      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      const matchedCliplist = existingCliplist.find(el => el.id === response.id);

      if(existingCliplist.length < 20 && response.title !== undefined) {
        if(response.id === undefined ) {
          input = {
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

        }  else if(matchedCliplist === undefined) {

          input = response;
          localStorage.setItem('cliplist', JSON.stringify(input));
          existingCliplist.push(input);
          localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
          state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
          const title = response.title.length > 25 ? `${response.title.substr(0, 24)}...` : response.title;
          this.commit('SET_SnackBar', { type: 'success', text: `ClipList : ${title} 가 추가되었습니다.`, value: true });

        } else if (matchedCliplist !== undefined && matchedCliplist.pinnedClips.length !== response.pinnedClips.length) {

          input = {
            id: uid,
            title: response.title,
            color: response.color,
            pinnedClips: response.pinnedClips,
          };
          localStorage.setItem('cliplist', JSON.stringify(input));
          existingCliplist.push(input);
          localStorage.setItem('allCliplists', JSON.stringify(existingCliplist));
          state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
          const title = response.title.length > 25 ? `${response.title.substr(0, 24)}...` : response.title;
          this.commit('SET_SnackBar', { type: 'success', text: `ClipList : ${title} 가 추가되었습니다.`, value: true });

        } else {

          this.commit('SET_SnackBar', { type: 'error', text: `ClipList : 이미 포함된 Cliplist 입니다.`, value: true });
        }

      }else if(existingCliplist.length >= 20){

        this.commit('SET_SnackBar', { type: 'error', text: `ClipList : 저장가능한 list의 개수는 20개 입니다.`, value: true });

      } else {

        this.commit('SET_SnackBar', { type: 'error', text: `ClipList : Data가 없습니다.`, value: true });
      }
      window.scrollTo(0,0);
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
      window.scrollTo(0,0);
    },
    INIT_localStorage(state) {
      state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
    },
    DELETE_clip(state, response) {
      const temp = JSON.parse(localStorage.getItem('allCliplists'));
      const listindex = state.cliplist.findIndex((el) => el.id === response.belongsTo.id);
      const clipindex = state.currentCliplist.pinnedClips.findIndex((el) => el.id === response.target.id);
      const uid = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
      + Math.random().toString(16).slice(2)
      + Date.now().toString(16).slice(4);
      temp[listindex].pinnedClips.splice(clipindex, 1);
      temp[listindex].id = uid;
      state.currentCliplist.pinnedClips.splice(clipindex, 1);
      state.currentCliplist.id = uid;
      localStorage.setItem('allCliplists', JSON.stringify(temp));
      const title = response.target.title.length > 25 ? `${response.target.title.substr(0, 24)}...` : response.target.title;
      state.cliplist = JSON.parse(localStorage.getItem('allCliplists'));
      this.commit('SET_SnackBar', { type: 'error', text: `Clip : ${title}가 삭제되었습니다.`, value: true });
    },
    DELETE_importedClip(state,response){
      const clipindex = state.currentCliplist.pinnedClips.findIndex((el) => el.id === response.target.id);
      state.currentCliplist.pinnedClips.splice(clipindex, 1);
      const title = response.target.title.length > 25 ? `${response.target.title.substr(0, 24)}...` : response.target.title;
      this.commit('SET_SnackBar', { type: 'error', text: `Clip : ${title}가 삭제되었습니다.`, value: true });

    },
    SORT_cliplist(state, response) {
      if (response.type === 'views') {
        if (response.order === 'desc') {
         response.data.sort((a, b) => b.view_count - a.view_count);
        } else {
         response.data.sort((a, b) => a.view_count - b.view_count);
        }
        this.commit('SET_SnackBar', { type: 'info', text: `Filter : 조회수로 정렬합니다.`, value: true });
      }
      if (response.type === 'created') {
        if (response.order === 'desc') {
         response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
         response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        this.commit('SET_SnackBar', { type: 'info', text: `Filter : 날짜로 정렬합니다.`, value: true });
      }
      if (response.type === 'name') {
        if (response.order === 'desc') {
         response.data.sort((a, b) => a.broadcaster_name.localeCompare(b.broadcaster_name));
        } else {
         response.data.sort((a, b) => b.broadcaster_name.localeCompare(a.broadcaster_name));
        }
        this.commit('SET_SnackBar', { type: 'info', text: `Filter : 이름으로 정렬합니다.`, value: true });
      }
    },
  },
  actions: {
  },
  modules: {
  },
});
