<template>
 <v-footer
    class="mt-8"
    padless>
    <v-card
      class="py-2"
      flat
      tile>
      <v-card-text class="pa-0 py-2 my-5 align-center justify-center">
        <div class="px-2">
          {{ new Date().getFullYear() }} — <strong>Clip Collector for TWITCH</strong>
        </div>
        <div class="d-flex px-2 pt-3 align-center">
          <v-icon small>mdi-email</v-icon>
          <span class="pr-3">Contact:</span>
          <a class="twitch--text" href = "mailto: cctwitchxyz@gmail.com">cctwitchxyz@gmail.com</a>
        </div>
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
      ],
    };
  },
  methods: {
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
