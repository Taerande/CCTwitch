<template>
  <v-app-bar app
  flat>
    <v-container
    id="app-bar"
    class="align-center justify-center">
      <v-row class="d-flex align-center">
        <div class="d-flex">
          <router-link class="d-flex" :to="{name: 'Home'}">
            <v-img
              class="shrink mr-1"
              contain
              src="@/assets/img/TwitchGlitchBlackOps.png"
              transition="scale-transition"
              width="30"
            />
          <div
            class="text-lg-h3 text-h6 font-weight-bold d-flex align-center pl-3">Twitch Clip Collector</div>
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
            <v-card-title class="info">
              Find Your Streamer
            </v-card-title>
            <v-card-text class="pt-5 mx-auto">
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
    <template v-slot:extension>
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
      <router-link class="ma-0 pa-0" to="/analysis">
      <div class="px-2 rounded-pill"
      :style="{
        background: $route.path === '/analysis' ? 'rgb(119,44,232,0.4)' : '',
        font: $route.path === '/analysis' ? '1rem' : '3rem'
      }"
      >
        <v-icon color="cyan" class="pa-0 ma-0 pr-1">mdi-timeline</v-icon>
        <span class="text-subtitle-2 text-lg-body-1 pr-1">Timeline</span>
      </div>
      </router-link>
      <router-link class="ma-0 pa-0" to="/random">
      <div class="px-2 rounded-pill"
      :style="{
        background: $route.path === '/random' ? 'rgb(119,44,232,0.4)' : '',
        font: $route.path === '/random' ? '1rem' : '3rem'
      }"
      >
        <v-icon color="orange" class="pa-0 ma-0 pr-1">mdi-shuffle</v-icon>
        <span class="text-subtitle-2 text-lg-body-1 pr-1">Random</span>
      </div>
      </router-link>
    </template>
    <SingInDialog></SingInDialog>
    <v-btn color="success" @click="logOut">logOut</v-btn>
  </v-app-bar>
</template>
<script>

import SearchBar from '@/components/SearchBar.vue';
import SingInDialog from '@/components/dialog/SingInDialog.vue';

export default {
  components: {
    SearchBar,
    SingInDialog,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    logOut(){
      this.$firebase.auth().signOut().then( () => console.log('log Out success'));
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
</style>
