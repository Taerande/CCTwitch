<template >
  <v-container class="d-flex align-center justify-center">
    <v-form
    class="d-flex align-center justify-center"
    @submit.prevent="searchChannel($store.state.searchString)">
      <v-text-field
      v-model="$store.state.searchString"
      outlined
      color="twitch"
      @click:append="searchChannel($store.state.searchString)"
      append-icon="mdi-magnify"
      hide-details
      height="20"
      label="Search your Streamer">
    </v-text-field>
    </v-form>
  </v-container>
</template>
<script>

export default {
  data() {
    return {
      lists: [],

    };
  },

  methods: {
    async searchChannel(el) {
      this.$emit('closeDialog');
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
    },

  },
};
</script>
<style lang="scss" scoped>
#input-368{
  padding: 0;
}

</style>
