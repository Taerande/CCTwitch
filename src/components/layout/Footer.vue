<template>
 <v-footer
    padless>
    <v-divider></v-divider>
    <v-card
      class="py-2 app-container"
      flat
      tile>
      <v-card-text class="d-flex pa-0 py-2 white--text align-center justify-center">
        <v-btn
          v-for="(icon,index) in icons"
          :key="index"
          class="mx-4"
          icon
        >
          <v-icon>
            {{ icon.icon }}
          </v-icon>
        </v-btn>
        <div>
          <v-btn
          icon
          v-if="!$vuetify.theme.dark"
          @click="toggleDarkTheme()">
            <v-icon color="yellow darken-3">mdi-weather-night</v-icon>

          </v-btn>
          <v-btn v-else
          icon
          @click="toggleDarkTheme()">
            <v-icon color="red">mdi-weather-sunny</v-icon></v-btn>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text>
        {{ new Date().getFullYear() }} — <strong>Twitch Hot Clip Tracker</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>
<script>
export default {
  data() {
    return {
      icons: [
        { icon: 'mdi-home' },
        { icon: 'mdi-email' },
        { icon: 'mdi-twitch' },
        { icon: 'mdi-play' },
      ],
    };
  },
  methods: {
    toggleDarkTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('dark', this.$vuetify.theme.dark);
    },
  },

};
</script>
<style lang="scss" scoped>
.v-card{
  display: block;
  width: 100%;
  justify-content: center;
}

</style>
