<template>
  <v-app v-if="$store.state.firebaseLoaded && initData">
    <AppBar app></AppBar>
    <v-main app>
      <DisplyaAdContainerVue></DisplyaAdContainerVue>
      <router-view :key="$route.fullPath" />
      <SnackBar app></SnackBar>
      <DisplyaAdContainerVue></DisplyaAdContainerVue>
    </v-main>
    <Footer app></Footer>
  </v-app>
  <v-app v-else>
    <v-main app>
      <v-row class="d-block absolute-center">
        <div class="d-flex justify-center">
          <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
        <div class="d-flex justify-center">
        Initialize CCTwitch...
      </div>
      </v-row>
    </v-main>
  </v-app>
</template>
<script>
import SnackBar from '@/components/layout/SnackBar.vue'
import AppBar from '@/components/layout/AppBar.vue'
import Footer from '@/components/layout/Footer.vue'
import axios from 'axios'
import DisplyaAdContainerVue from './components/DisplyaAdContainer.vue'


export default {
  name: 'App',
  components: {
    AppBar,
    Footer,
    SnackBar,
    DisplyaAdContainerVue
  },
  data() {
    return {
      initData: false,
    }
  },
  methods: {
    searchBarToggle() {
      this.$store.commit('TOGGLE_SearchBar')
    },
  },
  // errorCaptured(err,vm,info) {
  //   console.log(`cat EC: ${err.toString()}\ninfo: ${info}`);
  //    return false;
  // },
 async created() {
    this.$store.commit('INIT_localStorage');
    this.$store.commit('SET_SignInDialog', false);
    const appAccessToken = JSON.parse(localStorage.getItem('twitchAppAccessToken'));
    this.$store.commit('SET_TwitchAppAccessToken', appAccessToken);
    this.$vuetify.theme.dark = JSON.parse(localStorage.getItem('dark'))

    // 백엔드에서 처리 해야댐.. twitch auth validation
    try{
      if(localStorage.getItem('twitchAppAccessToken')){
        await axios.get('https://id.twitch.tv/oauth2/validate',{
          headers:{
            Authorization: `OAuth ${JSON.parse(localStorage.getItem('twitchAppAccessToken'))}`
            }
        }).then((res) => {
          this.initData = true;
          //정상
        }).catch(async (error) => {
          console.log(error);
          //비정상, 앱엑세스 토큰 재발급 Backend 처리
          await axios.get(this.$store.state.appTokenURL).then((res) => {
            localStorage.setItem('twitchAppAccessToken', JSON.stringify(res.data.access_token));
            this.$store.commit('SET_TwitchAppAccessToken', res.data.access_token);
          })
        })
      } else {
        //앱 엑세스 토큰이 없는 경우 이므로 앱엑세스 토큰 발급해야댐 백엔드처리
        await axios.get(this.$store.state.appTokenURL)
        .then((res) => {
          //받아온 엑세스토큰 로컬스토리지에 저장
          this.$store.commit('SET_TwitchAppAccessToken', res.data.access_token);
          localStorage.setItem('twitchAppAccessToken', JSON.stringify(res.data.access_token))
          });
      }

    this.initData = true;
    }catch{

    }
  },
}
</script>
<style lang="scss">
// @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap');
:root {
  --twitch-color: rgb(119, 44, 232);
  --hoverBack-color: rgba(255, 255, 255, 0.3);
}
.absolute-center{
  position: absolute;
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
}
header {
  height: fit-content;
  padding-left: 3%;
  padding-right: 3%;
}
.col,
.row,
.container {
  padding: 0px !important;
  margin: 0px !important;
}
html,
body {
  height: 100vh !important;
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
}
#app {
  font-family: 'Noto Sans KR', sans-serif;
}
a {
  text-decoration: none !important;
  color: inherit !important;
}
.v-dialog--active{
  margin:0 !important;
}
.hidden {
  display: none;
}
div[role='dialog'] {
  box-shadow: none;
}
main {
  margin-right: 15%;
  margin-left: 15%;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: var(--twitch-color);
  background-clip: padding-box;
  border-radius: 5px;
}
::-webkit-scrollbar-track {
  background-color: rgb(245, 245, 245);
  border-radius: 5px;
}

html.overflow-y-hidden{
  overflow-y:scroll !important;
}
@media screen and (max-width: 1264px) and (min-width: 960px) {
  header {
    padding-left: 3%;
    padding-right: 3%;
  }
  main {
    margin-right: 3%;
    margin-left: 3%;
  }
  #container {
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
  }
  #bookmark {
    display: none;
  }
  .table-duration {
    display: none;
  }
}
@media screen and (max-width: 960px) and (min-width: 600px) {
  html{
    font-size: 95%;
  }
  header {
    padding-left: 3%;
    padding-right: 3%;
  }
  main {
    margin-right: 3%;
    margin-left: 3%;
  }
  #container {
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
  }
  #bookmark {
    display: none;
  }

  .table-duration,
  .table-date {
    display: none;
  }
}
@media screen and (max-width: 600px) {
  html{
    font-size: 90%;
  }
  header {
    padding-left: 3px;
    padding-right: 3px;
  }
  main {
    margin-right: 3px;
    margin-left: 3px;
  }
  .table-duration,
  .table-date,
  .table-channel,
  .table-views {
    display: none;
  }
  .beforeVidImg,
  .afterVidImg {
    display: none;
  }
}
.hoverCursor{
  cursor: pointer;
}
.iframeTop{
  position: absolute;
  top:0;
}
.text-stroke {
  text-shadow:
  -0.5px -0.5px 0 rgb(0,0,0,0.5),
  0.5px -0.5px 0 rgb(0,0,0,0.5),
  -0.5px 0.5px 0 rgb(0,0,0,0.5),
  0.5px 0.5px 0 rgb(0,0,0,0.5);
}
.text-stroke-2 {
  text-shadow:
  -1px -1px 0 rgb(0,0,0,0.5),
  1px -1px 0 rgb(0,0,0,0.5),
  -1px 1px 0 rgb(0,0,0,0.5),
  1px 1px 0 rgb(0,0,0,0.5);
}
.theme--dark.v-tabs > .v-tabs-bar{
  background: none !important;
}
.theme--dark.v-tabs-items{
  background: none !important;
}
.chipPill{
  height: fit-content !important;
  padding-bottom: 2px !important;
  padding-top: 2px !important;
}

.custom5cols {
  width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}

.v-snack__content{
  padding: 0;
  width: inherit;
}

.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.cliplist-canvas{
  border-radius: 5%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  width: 50px;
  height: 50px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--twitch-color);
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.v-skeleton-loader__image {
  aspect-ratio: 16 / 9 !important;
  height: auto !important;
}
.v-skeleton-loader__list-item-two-line{
  height: auto !important;
  padding: 0 !important;
  padding-top: 5px !important;
  margin-right: 20px !important;
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}
</style>
