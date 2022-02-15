<template>
  <v-app>
    <v-app-bar
      app
    >
      <v-container
      app
      id="app-bar"
      class="d-flex align-center justify-center">
        <v-row class="d-flex justify-space-between">
          <v-col class="d-flex">
          <router-link class="d-flex" :to="{name: 'Home'}">
            <v-img
              alt="Vuetify Logo"
              class="shrink mr-2"
              contain
              src="@/assets/img/TwitchGlitchBlackOps.png"
              transition="scale-transition"
              width="40"
            />
          <h1
            class="pl-3">Twitch Hot Clip Trakcer</h1>
          </router-link>
          </v-col>
          <v-col class="d-flex">
            <SearchBar v-show="true"></SearchBar>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <bookmark app></bookmark>
    <v-main id="container" app>
      <router-view :key="$route.fullPath"/>
    </v-main>
      <v-btn
      v-if="!this.$vuetify.theme.dark"
      id="dark-mode-switch"
      dark
      fab
      large
      bottom
      left
      @click="toggleDarkTheme()"
      class="v-btn--example"
      >
        <v-icon color="yellow">mdi-weather-night</v-icon>
      </v-btn>
      <v-btn v-else
      id="dark-mode-switch"
      light
      fab
      large
      bottom
      left
      @click="toggleDarkTheme()"
      class="v-btn--example">
        <v-icon color="red">mdi-weather-sunny</v-icon></v-btn>
  </v-app>
</template>

<script>
import bookmark from '@/components/layout/bookmark.vue';
import SearchBar from '@/components/SearchBar.vue';

export default {
  name: 'App',
  components: {
    SearchBar,
    bookmark,
  },
  data() {
    return {

    };
  },
  methods: {
    searchBarToggle() {
      this.$store.commit('TOGGLE_SearchBar');
    },
    resetData() {
      this.searchString = null;
    },
    toggleDarkTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('dark', this.$vuetify.theme.dark);
    },

  },
  mounted() {
    this.resetData();
    this.$store.state.likedStreamer = JSON.parse(localStorage.getItem('alllikes'));
    this.$vuetify.theme.dark = JSON.parse(localStorage.getItem('dark'));
  },
};
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap');
:root {
  --twitch-color: rgb(119,44,232);
}
header{
  height: fit-content;
  padding-left: 20%;
  padding-right: 20%;
  // background: rgb(119,44,232);
  // background: linear-gradient(90deg, rgba(119,44,232,1) 0%, rgba(119,44,232,0.8911939775910365) 74%, rgba(119,44,232,0.7203256302521008) 100%);
}
.col, .row, .container{
  padding: 0 !important;
  margin: 0 !important;
}
html, body{
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
}
#app{
  font-family: 'Noto Sans KR', sans-serif;

}
#app-bar{
  position: sticky;
  top: 0;
  margin-left: 20%;
  margin-right: 20%;
}
#container{
  margin-left: 20%;
  margin-right: 20%;
}
a{
  text-decoration: none !important;
  color: inherit !important;
}
#dark-mode-switch{
  position: fixed;
  top: 90%;
  left: 5%;
}

</style>
