<template>
<v-card>
   <v-app-bar
   flat>
      <v-container
      id="app-bar"
      class="align-center justify-center">
        <v-row class="d-flex align-center justify-space-between">
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
            <SearchBar v-show="$route.path !== '/'"></SearchBar>
          </v-col>
        </v-row>
      </v-container>
        <template v-slot:extension>
        <v-tabs align-with-title>
          <v-tab to="/trending">Trending</v-tab>
          <v-tab to="/cliplist">My Cliplist</v-tab>
          <v-tab>Analyze</v-tab>
        </v-tabs>
        <v-spacer></v-spacer>
        <div>
          <v-btn
        v-if="!$vuetify.theme.dark"
        id="dark-mode-switch"
        dark
        fab
        bottom
        left
        @click="toggleDarkTheme()"
        class="v-btn--example"
        >
          <v-icon color="yellow">mdi-weather-night</v-icon>

        </v-btn>
        <v-btn v-else
        id="dark-mode-switch"
        dark
        fab
        bottom
        left
        @click="toggleDarkTheme()"
        class="v-btn--example">
          <v-icon color="red">mdi-weather-sunny</v-icon></v-btn>
        </div>
      </template>
    </v-app-bar>
</v-card>
</template>
<script>

import SearchBar from '@/components/SearchBar.vue';

export default {
  components: {
    SearchBar,
  },
  data() {
    return {

    };
  },
  methods: {
    toggleDarkTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('dark', this.$vuetify.theme.dark);
    },
  },
  created() {
  },
};
</script>
<style lang="scss">

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
</style>
