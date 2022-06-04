<template>
 <v-footer
    class="mt-16"
    padless>
    <v-card
      class="py-2 app-container"
      flat
      tile>
      <v-card-text class="pa-0 py-2 align-center justify-center">
        <div>
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
        </div>
        <div class="px-2">
          {{ new Date().getFullYear() }} — <strong>Clip Collector for TWITCH</strong>
        </div>
      </v-card-text>
      <v-divider></v-divider>
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
