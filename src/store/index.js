import Vue from 'vue';
import Vuex from 'vuex';
import { userinfo } from './modules/auth';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    signInDialog: false,
    drawer: false,
    backendUrl: process.env.VUE_APP_BACKEND_URL_DEV,
    appTokenURL:process.env.VUE_APP_TWITCH_APPTOKEN_ISSUE_DEV,
    redirectUri:process.env.VUE_APP_TWITCH_REDIRECTURI_DEV,
    embedUrl:process.env.VUE_APP_EMBED_PARERNT_DEV,
    firebaseLoaded: false,
    snackbarArr:[],
    snackbar: {
      type: 'error',
      text: '',
      value: false,
    },
    searchString: null,
    searchBar: false,
    twitchOAuthToken: '',
    headerConfig: {
      Authorization: '',
      'Client-id': process.env.VUE_APP_TWITCH_CLIENT_ID,
      Accept: process.env.VUE_APP_TWITCH_HEADER_ACCEPT,
    },
    VidClipData: [],
    searchQuery: '',
    likedStreamer: [],
    pinnedClips: [],
    cliplist: [],
    currentCliplist:[],
    currentListData:'',
    dateSort: {
      text: null,
      start: null,
      end: null,
    },
    userList: [],
    isSaved: '',
    darkColorSet:['#E53935','#C62828','#D81B60','#AD1457','#8E24AA','#6A1B9A','#5E35B1','#4527A0','#3949AB','#283593','#1E88E5','#1565C0','#039BE5','#0277BD','#00ACC1','#00838F','#00897B','#00695C','#43A047','#2E7D32','#7CB342','#558B2F','#C0CA33','#9E9D24','#F9A825','#FFB300','#FF8F00','#FB8C00','#EF6C00','#F4511E','#D84315','#6D4C41','#4E342E','#546E7A','#37474F','#757575','#424242'],
  },
  mutations: {
    SET_DateSort(state,payload){
      state.dateSort = payload
    },
    SET_SignInDialog(state, payload) {
      state.signInDialog = payload
    },
    UPDATE_Firedata(state, payload){
      state.currentCliplist[payload.index].fireData.createdAt = payload.createdAt;
    },
    SET_Cliplist(state, payload){
      state.cliplist = payload;
    },
    SET_Drawer(state, payload){
      state.drawer = payload;
    },
    SET_TwitchOAuthToken(state, payload){
      state.twitchOAuthToken = `Bearer ${payload}`;
    },
    SET_TwitchAppAccessToken(state,payload){
      state.headerConfig.Authorization = `Bearer ${payload}`;
    },
    SET_CurrentListData(state, payload){
      state.currentListData = payload;
    },
    SET_FirebaseLoad(state, payload){
      state.firebaseLoaded = payload
    },
    INIT_SnackBar(state){
      state.snackbarArr = [];
    },
    SET_SnackBar(state,response){
      // state.SnackBar = response;
      if(state.snackbarArr.length >= 3){
        state.snackbarArr.push(response);
        state.snackbarArr.splice(0,1);
      } else {
        state.snackbarArr.push(response);
        setTimeout(() =>{
          state.snackbarArr.splice(0,1)} ,5000);
      }
    },
    DELETE_snackBar(state, response){
      state.snackbarArr.splice(response,1);
    },
    SET_isSaved(state,response){
      const existingCliplist = JSON.parse(localStorage.getItem('allCliplists'));
      state.isSaved = existingCliplist.find((el) => el.id === response);
    },
    TOGGLE_SearchBar(state) {
      state.searchBar = !state.searchBar;
    },
    INIT_currCliplist(state) {
      state.currentCliplist = {
        id:'',
        title:'',
        description:'',
        color:'',
        pinnedClips:[],
      };
    },
    SET_VidClipData(state, response) {
      state.VidClipData = response;
    },
    ADD_ClipInCurrentCliplist(state, payload){
      state.currentCliplist.push(...payload);
      state.currentCliplist.sort((a,b) => a.fireData.createdAt - b.fireData.createdAt)
    },
    ADD_CurrentCliplist(state, payload){
      state.currentCliplist = [...state.currentCliplist, ...payload];
    },
    SET_CurrentClipList(state, payload){
      state.currentCliplist = payload;
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
      if (existinglikes.length <= 19) {
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

    INIT_localStorage(state) {
     const likesInit = localStorage.getItem('alllikes');
      if(likesInit === '' || likesInit === [] || likesInit === null){
        localStorage.setItem('alllikes',JSON.stringify([]));
      }
      state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
    },
    DELETE_Clip(state, response) {
      let index = state.currentCliplist.findIndex( (element) => element.clipData.id === response);
      state.currentCliplist.splice(index,1);
    },
    DELETE_importedClip(state, response) {
      const clipindex = state.currentCliplist.pinnedClips.findIndex((el) => el.id === response.target.id);
      state.currentCliplist.pinnedClips.splice(clipindex, 1);
      const title = response.target.title.length > 25 ? `${response.target.title.substr(0, 24)}...` : response.target.title;
      this.commit('SET_SnackBar', { type: 'error', text: `Clip : ${title}가 삭제되었습니다.`, value: true });
    },
  },
  actions: {
    setUserInfo({ commit }, payload){
      commit('SET_UserInfo', payload)
    },
    setFirebaeStatus({ commit }, payload){
      commit('SET_FirebaseLoad', payload)
    }
  },
  modules: {
    userinfo: userinfo,
  },
});
