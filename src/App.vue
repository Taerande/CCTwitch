<template>
  <v-app>
    <AppBar app></AppBar>
    <!-- <bookmark app></bookmark> -->
    <v-main class="app-container" app  v-if="$store.state.firebaseLoaded && initData">
      <v-container class="absolute-center" v-if="!initData">
        <v-row>
          <v-progress-circular class="mx-auto" indeterminate color="twitch"></v-progress-circular>
        </v-row>
      </v-container>
      <router-view v-else class="mx-auto" :key="$route.fullPath" />
    </v-main>
    <v-main v-else  class="app-container" app>
      <v-container>
        <v-progress-circular class="absolute-center" color="twitch" size="60" width="6" indeterminate></v-progress-circular>
      </v-container>
    </v-main>
    <SnackBar app></SnackBar>
    <Footer app></Footer>
  </v-app>
</template>

<script>
// import bookmark from '@/components/layout/bookmark.vue'
import SnackBar from '@/components/layout/SnackBar.vue'
import AppBar from '@/components/layout/AppBar.vue'
import Footer from '@/components/layout/Footer.vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    AppBar,
    Footer,
    // bookmark,
    SnackBar,
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

 async created() {
    this.$store.commit('SET_SignInDialog', false);
    const appAccessToken = JSON.parse(localStorage.getItem('twitchAppAccessToken'));
    this.$store.commit('SET_TwitchAppAccessToken', appAccessToken);
    this.$vuetify.theme.dark = JSON.parse(localStorage.getItem('dark'))

    // 백엔드에서 처리 해야댐.. twitch auth validation
    if(localStorage.getItem('twitchAppAccessToken')){
      await axios.get('https://id.twitch.tv/oauth2/validate',{
        headers:{
          Authorization: `OAuth ${JSON.parse(localStorage.getItem('twitchAppAccessToken'))}`
          }
      }).then((res) => {
        //정상
      }).catch(async (error) => {
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
  }
}
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap');
:root {
  --twitch-color: rgb(119, 44, 232);
  --hoverBack-color: rgba(255, 255, 255, 0.3);
}
.absolute-center{
  position: absolute;
  top:40vh;
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
@media screen and (max-width: 960px) {
  html {
    font-size: 90%;
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
  html {
    font-size: 80%;
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

.v-dialog.clipIframe {
  margin: 0 !important;
}
.hoverCursor{
  cursor: pointer;
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
.v-progress-circular--indeterminate > svg{
  animation: progress-circular-rotate 1s linear infinite !important;
  transition: all 0.1s ease-in-out !important;
}
</style>
