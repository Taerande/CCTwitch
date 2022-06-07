<template>
 <v-footer
    class="mt-8"
    padless>
    <v-card
      class="py-2"
      flat
      tile>
      <v-card-text class="pa-0 py-2 align-center justify-center">
        <div class="px-2">
          {{ new Date().getFullYear() }} — <strong>Clip Collector for TWITCH</strong>
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
