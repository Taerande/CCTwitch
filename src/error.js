import Vue from 'vue';
import store from './store'
// import axios from 'axios';
// import router from 'vue-router'


// Vue.config.errorHandler = async (e) => {
//   store.commit('SET_SnackBar', { type: 'error', text: e.message, value: true });
// }
//   console.log(e);
//   if(e.response.status === 401){
//     try{
//       if(localStorage.getItem('twitchAppAccessToken')){
//         await axios.get('https://id.twitch.tv/oauth2/validate',{
//           headers:{
//             Authorization: `OAuth ${JSON.parse(localStorage.getItem('twitchAppAccessToken'))}`
//             }
//         }).then((res) => {
//         }).catch(async (error) => {
//           //비정상, 앱엑세스 토큰 재발급 Backend 처리
//           await axios.get(store.state.appTokenURL).then((res) => {
//             localStorage.setItem('twitchAppAccessToken', JSON.stringify(res.data.access_token));
//             store.commit('SET_TwitchAppAccessToken', res.data.access_token);
//           })
//         })
//       } else {
//         //앱 엑세스 토큰이 없는 경우 이므로 앱엑세스 토큰 발급해야댐 백엔드처리
//         await axios.get(store.state.appTokenURL)
//         .then((res) => {
//           //받아온 엑세스토큰 로컬스토리지에 저장
//           store.commit('SET_TwitchAppAccessToken', res.data.access_token);
//           localStorage.setItem('twitchAppAccessToken', JSON.stringify(res.data.access_token))
//           });
//       }
//     }catch{
//     }
//   }
