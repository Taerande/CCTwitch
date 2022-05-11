<template>
  <v-app-bar height="90" app flat absolute>
    <v-container
    class="align-center justify-center">
      <v-row class="d-flex align-center">
        <div class="d-flex">
          <v-btn icon @click="changeDrawer()">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <v-dialog
            content-class="drawer"
            v-model="$store.state.drawer"
            no-click-animation
            fullscreen
            transition="dialog-bottom-transition"
          >
            <v-card>
              <v-card-title>
                <span>Quick Menu</span>
                <v-spacer></v-spacer>
                <v-btn @click="changeDrawer()" icon>
                  <v-icon>mdi-chevron-double-down</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-list>
                  <div class="text-caption pl-5">Search</div>
                  <v-divider class="my-3"></v-divider>
                  <v-form
                  @submit.prevent="searchChannel($store.state.searchString)">
                    <v-text-field
                      v-model="$store.state.searchString"
                      @click:prepend="searchChannel($store.state.searchString)"
                      @keydown.enter="$store.commit('SET_SnackBar',{type:'info', text:'Success', value:true})"
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
                  <v-list-item to="/" @click="changeDrawer()">
                    <v-icon color="twitch" class="pr-1">mdi-home</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Home</span>
                  </v-list-item>
                  <v-list-item to="/trending" @click="changeDrawer()">
                    <v-icon color="green" class="pr-1">mdi-trending-up</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Trending</span>
                  </v-list-item>
                  <v-list-item to="/mycliplist" @click="changeDrawer()">
                    <v-icon color="blue" class="pr-1">mdi-playlist-check</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">My Cliplist</span>
                  </v-list-item>
                  <v-list-item to="/streamer" @click="changeDrawer()">
                    <v-icon color="red" class="pa-0 ma-0 pr-1">mdi-heart</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Streamer</span>
                  </v-list-item>
                  <v-list-item to="/streamer" @click="changeDrawer()">
                    <v-icon color="red" class="pa-0 ma-0 pr-1">mdi-help</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Random</span>
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
                    <div class="d-flex justify-center px-10 pt-5">
                      <v-btn width="100%" @click="logOut" :loading="logoutLoading" color="error">Logout</v-btn>
                    </div>
                    </v-card-text>
                  </v-card>
                  <v-card flat v-else>
                    <div class="d-flex justify-center px-10 pt-5">
                     <SignInDialog :type="{parent:'quickMenu'}"></SignInDialog>
                    </div>
                  </v-card>
                  <div class="text-caption pl-5 pt-8">Option</div>
                  <v-divider class="my-3"></v-divider>
                  <div>
                    <v-btn
                    depressed
                    outlined
                    v-if="!$vuetify.theme.dark"
                    @click="toggleDarkTheme()">
                      <v-icon color="yellow darken-3">mdi-weather-night</v-icon>
                      <span>Dark Mode</span>
                    </v-btn>
                    <v-btn v-else
                    depressed
                    class="text-capitalize text-caption"
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
              src="@/assets/img/TwitchGlitchBlackOps.png"
              transition="scale-transition"
              width="30"
            />
          <div
            class="text-lg-h4 text-h5 font-weight-bold d-flex align-center pl-3">CCTwitch</div>
          </router-link>
        </div>
        <div v-if="$vuetify.breakpoint.mdAndUp" class="d-flex">
          <router-link to="/trending">
            <div class="px-2 rounded-pill">
              <span class="text-subtitle-2 text-lg-body-1 pr-1">Trending</span>
            </div>
          </router-link>
          <router-link to="/mycliplist">
            <div class="px-2 rounded-pill">
              <span class="text-subtitle-2 text-lg-body-1 pr-1">My Cliplist</span>
            </div>
          </router-link>
          <router-link class="ma-0 pa-0" to="/streamer">
            <div class="px-2 rounded-pill">
              <span class="text-subtitle-2 text-lg-body-1 pr-1">Streamer</span>
            </div>
          </router-link>
        </div>
        <v-spacer></v-spacer>
        <div class="px-3">
          <SearchBar></SearchBar>
        </div>
      </v-row>
    </v-container>
    <v-avatar
      v-if="$store.state.userinfo.userInfo"
      size="36"
    >
      <img
      :src="$store.state.userinfo.userInfo.photoURL" lazy-src="@/assets/img/404.jpg">
    </v-avatar>
    <SignInDialog v-else :type="{parent:'appbar'}"></SignInDialog>
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
      await setTimeout( async () => {
        await this.$firebase.auth().signOut().then(() =>{
        this.logoutLoading = false;
        this.$store.commit('SET_UserInfo', null);
        localStorage.removeItem('userInfo');
        if(this.$route.path !== '/'){
          this.$router.push({path:'/'})
        }
      });
      this.$store.commit('SET_Drawer');
      this.$store.commit('SET_SnackBar',{type: 'error', text:'로그아웃', value:true})
      }, 500);
    },
    searchChannel(el) {
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
      this.changeDrawer();
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
.v-text-field__details{
  display: none;
}
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
@media screen and (max-width: 600px){
  .v-dialog--fullscreen.drawer{
  border-radius: 10px;
  margin: 0;
  height: 70%;
  position: fixed;
  overflow-y: auto;
  top: 30%;
  left: 0;
  width: 100%;
}

}
</style>
