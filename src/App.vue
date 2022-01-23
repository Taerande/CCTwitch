<template>
  <v-app>
    <v-app-bar
      id="app-bar"
      class="d-flex align-center justify-center"
      app
      dark
    >
    <v-row>
      <div
      class="d-flex align-center justify-center">
      <router-link :to="{name: 'Home'}">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="@/assets/img/TwitchGlitchBlackOps.png"
          transition="scale-transition"
          width="40"
        />
      </router-link>
      <h1
        class="pl-3">Twitch Hot Clip Trakcer</h1>
      </div>
      <v-spacer></v-spacer>
      <div
      class="pl-5">
      <v-btn
      @click="searchBarToggle()"
      icon>
        <v-icon
        size="50">mdi-magnify</v-icon>
      </v-btn>
      </div>
    </v-row>
    </v-app-bar>
    <v-main>
      <SearchBar></SearchBar>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue';

export default {
  name: 'App',

  components: {
    SearchBar,
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

  },
  mounted() {
    this.resetData();
  },
};
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap');

html, body{
  font-family: 'Noto Sans KR', sans-serif;
}
#app{
  font-family: 'Noto Sans KR', sans-serif;

}
#app-bar{
  background: rgb(119,44,232);
  background: linear-gradient(90deg, rgba(119,44,232,1) 0%, rgba(119,44,232,0.8911939775910365) 74%, rgba(119,44,232,0.7203256302521008) 100%);
}

</style>
