<template>
  <v-app>
    <AppBar app></AppBar>
    <bookmark app></bookmark>
    <v-main class="app-container" app>
      <v-progress-circular v-if="this.$store.state.firbaseLoaded" class="absolute-center" color="twitch" size="60" width="6" indeterminate></v-progress-circular>
      <router-view class="mx-auto" :key="$route.fullPath" />
    </v-main>
    <SnackBar app></SnackBar>
    <Footer app></Footer>
  </v-app>
</template>

<script>
import bookmark from '@/components/layout/bookmark.vue'
import SnackBar from '@/components/layout/SnackBar.vue'
import AppBar from '@/components/layout/AppBar.vue'
import Footer from '@/components/layout/Footer.vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    AppBar,
    Footer,
    bookmark,
    SnackBar,
  },
  data() {
    return {}
  },
  methods: {
    searchBarToggle() {
      this.$store.commit('TOGGLE_SearchBar')
    },
  },
 async created() {
    const likesInit = JSON.parse(localStorage.getItem('alllikes'))
    const cliplistInit = JSON.parse(localStorage.getItem('allCliplists'))
    const userInfo = localStorage.getItem('userInfo');
    if(userInfo){
      this.$store.commit('SET_UserInfo',userInfo)
    }
    if (likesInit === null) {
      const likes = []
      localStorage.setItem('alllikes', JSON.stringify(likes))
    }
    if (cliplistInit === null) {
      const likes = []
      localStorage.setItem('allCliplists', JSON.stringify(likes))
    }
    this.$store.commit('INIT_localStorage')
    this.$vuetify.theme.dark = JSON.parse(localStorage.getItem('dark'))

    // 백엔드에서 처리 해야댐.. twitch auth validation
    if(localStorage.getItem('twitchAppAccessToken')){
      axios.get('https://id.twitch.tv/oauth2/validate',{
        headers:{
          Authorization: `OAuth ${localStorage.getItem('twitchAppAccessToken').slice(1,-1)}`
        }
      }).then((res) => {
        //정상

      }).catch((error) => {
        //비정상, 앱엑세스 토큰 재발급 Backend 처리
        axios.get(this.$store.state.appTokenURL).then((res) => {
          localStorage.setItem('twitchAppAccessToken', JSON.stringify(res.data.access_token));
        });
      })
    } else {
      //앱 엑세스 토큰이 없는 경우 이므로 앱엑세스 토큰 발급해야댐 백엔드처리
      axios.get(this.$store.state.appTokenURL)
      .then((res) => {
        //받아온 엑세스토큰 로컬스토리지에 저장
        localStorage.setItem('twitchAppAccessToken', JSON.stringify(res.data.access_token))
        });
      }
  }
}
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap');
:root {
  --twitch-color: rgb(119, 44, 232);
}
.absolute-center{
  position: absolute;
  top:40vh;
  left:50%;
  transform: translate(-50%, -50%);
  z-index: 500;
}
header {
  height: fit-content;
  padding-left: 15%;
  padding-right: 15%;
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
  .table-duration,
  .table-date,
  .table-channel,
  .table-views {
    display: none;
  }
}

.v-dialog.clipIframe {
  margin: 0 !important;
}
</style>
