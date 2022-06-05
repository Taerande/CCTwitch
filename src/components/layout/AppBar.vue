<template>
  <v-app-bar class="white--text indigo lighten-3" height="60" app flat absolute>
    <v-container
    class="align-center justify-center">
      <v-row class="d-flex align-center">
        <div class="d-flex">
          <v-btn icon @click="changeDrawer(!drawer)">
            <v-icon color="white">mdi-menu</v-icon>
          </v-btn>
          <v-dialog
            content-class="drawer"
            v-model="$store.state.drawer"
            no-click-animation
            fullscreen
            scrollable
            transition="dialog-bottom-transition"
          >
            <v-card>
              <v-card-title class="blue">
                <div class="white--text">Quick Menu</div>
                <v-spacer></v-spacer>
                <v-btn color="white" @click="changeDrawer(false)" icon>
                  <v-icon>mdi-chevron-double-down</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text class="pt-3 pb-10">
                <v-list>
                  <div class="text-caption pl-5">Search</div>
                  <v-form
                  @submit.prevent="searchChannel($store.state.searchString)">
                    <v-text-field
                      v-model="$store.state.searchString"
                      @click:prepend="searchChannel($store.state.searchString)"
                      color="twitch"
                      outlined
                      flat
                      dense
                      prepend-inner-icon="mdi-magnify"
                      placeholder="Find streamer"
                      solo
                    ></v-text-field>
                  </v-form>
                  <div class="text-caption pl-5 pt-3">Menu</div>
                  <v-divider class="my-3"></v-divider>
                  <v-list-item to="/" @click="changeDrawer(false)">
                    <v-icon color="twitch" class="pr-1">mdi-home</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Home</span>
                  </v-list-item>
                  <v-list-item to="/trending" @click="changeDrawer(false)">
                    <v-icon color="green" class="pr-1">mdi-trending-up</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Trending</span>
                  </v-list-item>
                  <v-list-item to="/mycliplist" @click="changeDrawer(false)">
                    <v-icon color="blue" class="pr-1">mdi-playlist-check</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">My Cliplist</span>
                  </v-list-item>
                  <v-list-item to="/streamer" @click="changeDrawer(false)">
                    <v-icon color="red" class="pa-0 ma-0 pr-1">mdi-heart</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Streamer</span>
                  </v-list-item>
                  <div class="text-caption pl-5 pt-8">User</div>
                  <v-divider class="my-3"></v-divider>
                  <v-card flat v-if="$store.state.userinfo.userInfo">
                    <v-card-text>
                      <v-avatar
                      size="24">
                        <img
                          :src="$store.state.userinfo.userInfo.photoURL" lazy-src="@/assets/img/404.jpg">
                      </v-avatar>
                    <span class="text-subtitle px-1">{{$store.state.userinfo.userInfo.displayName}}</span>
                    <div class="d-flex justify-center py-3">
                      <v-btn width="100%" @click="logOut()" :loading="logoutLoading" color="error">Logout</v-btn>
                    </div>
                    </v-card-text>
                  </v-card>
                  <v-card flat v-else>
                    <div class="d-flex justify-center px-10 pt-5">
                      <v-btn color="twitch" dark width="100%" @click="$store.commit('SET_SignInDialog', true)">로그인</v-btn>
                    </div>
                  </v-card>
                  <div class="text-caption pl-5 pt-3">Option</div>
                  <v-divider class="my-3"></v-divider>
                  <div>
                    <v-btn
                    depressed
                    v-if="!$vuetify.theme.dark"
                    class="text-capitalize text-caption pa-0 ma-0 px-1"
                    @click="toggleDarkTheme()">
                      <v-icon color="yellow darken-3">mdi-weather-night</v-icon>
                      <span>Dark Mode</span>
                    </v-btn>
                    <v-btn v-else
                    depressed
                    class="text-capitalize text-caption pa-0 ma-0 px-1"
                    @click="toggleDarkTheme()">
                      <v-icon color="red">mdi-weather-sunny</v-icon>
                      <span>Dark Theme</span>
                    </v-btn>
                  </div>
                </v-list>
              </v-card-text>
            </v-card>
          </v-dialog>
          <router-link class="d-flex" :to="{name: 'Home'}">
            <v-img
              class="shrink mr-1"
              contain
              src="@/assets/logo.png"
              width="30"
            />
          <div
            :class="$route.name === 'Home' ? 'twitch--text' : '' "
            class="text-lg-h4 text-h5 font-weight-bold d-flex align-center pl-3 appbar-text">CCTwitch</div>
          </router-link>
        </div>
        <div v-if="$vuetify.breakpoint.mdAndUp" class="d-flex pl-3">
          <router-link to="/trending">
            <div class="px-1 appbar-text" to="/trending">
              <span :class="$route.name === 'Trending' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">Trending</span>
            </div>
          </router-link>
          <router-link to="/mycliplist">
            <div class="px-1 appbar-text">
              <span :class="$route.name === 'cliplistList' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">My Cliplist</span>
            </div>
          </router-link>
          <router-link class="ma-0 pa-0" to="/streamer">
            <div class="px-1 appbar-text">
              <span :class="$route.name === 'streamer' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">Streamer</span>
            </div>
          </router-link>
        </div>
      </v-row>
    </v-container>
    <v-spacer></v-spacer>
    <div class="px-3">
      <SearchBar></SearchBar>
    </div>
    <v-avatar
      class="hoverCursor"
      @click="changeDrawer(!drawer)"
      v-if="$store.state.userinfo.userInfo"
      size="36"
    >
      <img
      :src="$store.state.userinfo.userInfo.photoURL" lazy-src="@/assets/img/404.jpg">
    </v-avatar>
    <SignInDialog v-else :type="{parent:'appBar'}"></SignInDialog>
  </v-app-bar>
</template>
<script>

import SearchBar from '@/components/SearchBar.vue';
import SignInDialog from '@/components/dialog/SignInDialog.vue';
import { mapState } from 'vuex'
import { mapMutations } from 'vuex'

export default {
  components: {
    SearchBar,
    SignInDialog,
  },
  data() {
    return {
      dialog: false,
      logoutLoading: false,
    };
  },
  methods: {
    ...mapMutations({
      changeDrawer: 'SET_Drawer',
    }),
    toggleDarkTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('dark', this.$vuetify.theme.dark);
    },
    async logOut(){
      this.logoutLoading = true;
      await this.$firebase.auth().signOut().then(() =>{
      this.logoutLoading = false;
      this.changeDrawer(false);
      this.$router.push({name:'Home'}).catch(()=>{});
      this.$store.commit('SET_SnackBar',{type: 'error', text:'로그아웃', value:true})
      });
    },
    searchChannel(el) {
      if(el === '' || null){ return }
      this.$store.state.searchQuery = el;
      this.$router.push({
        path: '/search',
        query: {
          q: el,
        },
        params: {
          q: el,
        },
      });
      this.changeDrawer(false);
    },
  },
  computed: {
    ...mapState({
      drawer: 'drawer',
    })
  },
  created() {
  },
};
</script>
<style lang="scss">
.v-toolbar__content{
  padding: 0px !important;
}
.v-toolbar__extension{
  padding-top: 0px !important;
}
// .v-text-field__details{
//   display: none;
// }
#app-bar{
  position: absolute;
  top: 0;
  margin-left: 15%;
  margin-right: 15%;
}
.v-dialog.drawer{
  border-radius: 5px;
  margin: 24px;
  overflow-y: auto;
  pointer-events: auto;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 100%;
  z-index: inherit;
  box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);
}
.v-dialog--fullscreen.drawer{
  border-radius: 5px;
  margin: 0;
  height: 70%;
  position: fixed;
  overflow-y: auto;
  top: 30%;
  left: 15%;
  width: 40%;
}
@media screen and (max-width: 1264px) {
  .v-dialog--fullscreen.drawer{
  border-radius: 5px;
  margin: 0;
  height: 70%;
  position: fixed;
  overflow-y: auto;
  top: 30%;
  left: 10px;
  width: 70%;
}

}


@media screen and (max-width: 600px){
  .v-dialog--fullscreen.drawer{
  margin: 0;
  height: 100%;
  position: fixed;
  overflow-y: auto;
  top: 60px;
  left: 0;
  width: 100%;
}
}
.appbar-text:hover{
  color: var(--twitch-color);
}
</style>
