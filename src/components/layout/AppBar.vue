<template>
  <v-app-bar dark app flat color="twitch">
    <v-container
    class="align-center justify-center">
      <v-row class="d-flex align-center">
        <div class="d-flex">
          <v-btn dark icon @click="drawer = !drawer">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <v-dialog
            content-class="drawer"
            v-model="drawer"
            no-click-animation
            fullscreen
            transition="dialog-bottom-transition"
          >
            <v-card>
              <v-card-title>
                <span>Quick Menu</span>
                <v-spacer></v-spacer>
                <v-btn @click="drawer = false" icon>
                  <v-icon>mdi-chevron-double-down</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-list>
                  <div class="text-caption pl-5 pt-8">Search</div>
                  <v-divider class="my-3"></v-divider>
                    <v-text-field
                      @keydown.enter="$store.commit('SET_SnackBar',{type:'info', text:'Success', value:true})"
                      color="twitch"
                      outlined
                      flat
                      dense
                      prepend-inner-icon="mdi-magnify"
                      placeholder="Find streamer"
                      solo
                    ></v-text-field>
                  <div class="text-caption pl-5 pt-8">Menu</div>
                  <v-divider class="my-3"></v-divider>
                  <v-list-item to="/">
                    <v-icon color="twitch" class="pr-1">mdi-home</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Home</span>
                  </v-list-item>
                  <v-list-item to="/trending">
                    <v-icon color="green" class="pr-1">mdi-trending-up</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Trend</span>
                  </v-list-item>
                  <v-list-item to="/cliplist">
                    <v-icon color="blue" class="pr-1">mdi-playlist-check</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Cliplist</span>
                  </v-list-item>
                  <v-list-item to="/liked">
                    <v-icon color="red" class="pa-0 ma-0 pr-1">mdi-heart</v-icon>
                    <span class="text-subtitle-2 text-lg-body-1 pr-1">Liked</span>
                  </v-list-item>
                  <div class="text-caption pl-5 pt-8">User</div>
                  <v-divider class="my-3"></v-divider>
                  <v-card flat>
                    <v-card-text v-if="$store.state.userInfo">
                      <v-avatar
                      size="24">
                        <img
                          :src="$store.state.userInfo.photoURL" lazy-src="@/assets/img/404.jpg">
                      </v-avatar>
                    <span class="text-subtitle px-3">{{$store.state.userInfo.displayName}}</span>
                    <div class="d-flex justify-center px-10 pt-5">
                      <v-btn width="100%" color="error">Logout</v-btn>
                    </div>
                    </v-card-text>
                  </v-card>
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
        <v-spacer></v-spacer>
        <div class="d-flex justify-end" v-if="$vuetify.breakpoint.mdAndUp">
          <SearchBar v-show="$route.path !== '/'"></SearchBar>
        </div>
        <div class="d-flex justify-end" v-else>
          <v-dialog
            v-model="dialog"
            max-width="500px"
            transition="dialog-transition"
          >
          <template v-slot:activator="{on, attrs}">
            <v-icon v-bind="attrs" v-on="on">mdi-magnify</v-icon>
          </template>
          <v-card>
            <v-card-text class="pt-5 mx-auto pt-10">
             <SearchBar @close="closeDialog" class="mx-auto"></SearchBar>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn small color="error" text @click="dialog = false">close</v-btn>
              <v-btn small color="success" text @click="searchChannel($store.state.searchString)">Search</v-btn>
            </v-card-actions>
          </v-card>
          </v-dialog>
        </div>
      </v-row>
    </v-container>
    <v-menu offset-y v-if="$store.state.userInfo">
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-card tile>
        <v-card-title class="px-3 d-flex justify-center">
          <v-avatar
            size="48"
          >
            <img
            :src="$store.state.userInfo.photoURL" lazy-src="@/assets/img/404.jpg">
          </v-avatar>
          <span class="text-subtitle px-3">{{$store.state.userInfo.displayName}}</span>
        </v-card-title>
        <v-divider class="mx-3"></v-divider>
        <v-card-text class="ma-0 pa-0">
          <v-list>
            <v-list-item>
              <router-link class="ma-0 pa-0" to="/cliplist">
                <v-icon class="pr-2">mdi-playlist-check</v-icon>
                <span class="text-button">클립목록</span>
              </router-link>
            </v-list-item>
            <v-list-item>
              <v-icon class="pr-2">mdi-account-group</v-icon>
              <span class="text-button">팔로우</span>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider class="mx-3"></v-divider>
        <v-card-actions class="d-flex justify-center">
          <v-list-item>
            <v-icon class="pr-1">mdi-logout</v-icon>
            <span @click="logOut" class="text-subtitle-2 text-lg-body-1 pr-1">로그아웃</span>
          </v-list-item>
        </v-card-actions>
      </v-card>
    </v-menu>
    <SignInDialog :type="{parent:'appbar'}" v-else></SignInDialog>
    <template v-slot:extension v-if="$vuetify.breakpoint.mdAndUp">
      <router-link to="/trending">
      <div class="px-2 rounded-pill" :style="{background: $route.path === '/trending' ? 'rgb(119,44,232,0.4)' : ''}">
         <v-icon color="green" class="pr-1">mdi-trending-up</v-icon>
          <span class="text-subtitle-2 text-lg-body-1 pr-1">Trend</span>
      </div>
      </router-link>
      <router-link to="/cliplist">
      <div class="px-2 rounded-pill" :style="{background: $route.path.substr(1,8) === 'cliplist' ? 'rgb(119,44,232,0.4)' : ''}">
        <v-icon color="blue" class="pr-1">mdi-playlist-check</v-icon>
        <span class="text-subtitle-2 text-lg-body-1 pr-1">Cliplist</span>
      </div>
      </router-link>
      <router-link class="ma-0 pa-0" to="/liked">
      <div class="px-2 rounded-pill"
      :style="{
        background: $route.path === '/liked' ? 'rgb(119,44,232,0.4)' : '',
        font: $route.path === '/liked' ? '1rem' : '3rem'
      }"
      >
        <v-icon color="red" class="pa-0 ma-0 pr-1">mdi-heart</v-icon>
        <span class="text-subtitle-2 text-lg-body-1 pr-1">Liked</span>
      </div>
      </router-link>
    </template>
    <template v-slot:extension v-else>
    </template>
  </v-app-bar>
</template>
<script>

import SearchBar from '@/components/SearchBar.vue';
import SignInDialog from '@/components/dialog/SignInDialog.vue';

export default {
  components: {
    SearchBar,
    SignInDialog,
  },
  data() {
    return {
      drawer: false,
      dialog: false,
    };
  },
  methods: {
    logOut(){
      this.$firebase.auth().signOut().then( () => console.log('log Out success'));
      this.$store.commit('SET_UserInfo', null);
      if(this.$route.path !== '/'){
        this.$router.push({path:'/'})
      }
      this.$store.commit('SET_SnackBar',{type: 'error', text:'로그아웃', value:true})
    },
    closeDialog(){
      this.dialog = false;
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
      this.dialog = false;
    },
  },
  created() {
  },
};
</script>
<style lang="scss">
.v-toolbar__content{
  padding-top: 20px !important;
  padding-bottom: 0px !important;
}
.v-toolbar__extension{
  padding-top: 0px !important;
}

#app-bar{
  position: sticky;
  top: 0;
  margin-left: 15%;
  margin-right: 15%;
}
.v-dialog.drawer{
  border-radius: 5px;
  margin: 24px;
  overflow-y: auto;
  pointer-events: auto;
  transition: 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 100%;
  z-index: inherit;
  box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);
}
.v-dialog--fullscreen.drawer{
  border-radius: 5px;
  margin: 0;
  height: 70vh;
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
  height: 50vh;
  position: fixed;
  overflow-y: auto;
  top: 50%;
  left: 0;
  width: 100%;
}

}
</style>
