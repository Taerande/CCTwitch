<template >
  <v-container>
    <v-row
    class="d-flex align-center justify-end">
    <v-form
    class="d-flex align-center justify-center"
      @submit.prevent="searchChannel($store.state.searchString)">
          <v-text-field
          v-model="$store.state.searchString"
          full-width
          outlined
          color="twitch"
          @click:append="searchChannel($store.state.searchString)"
          append-icon="mdi-magnify"
          hide-details="true"
          label="Search your Streamer">
        </v-text-field>
    </v-form>
    </v-row>
  </v-container>
</template>
<script>
// import axios from 'axios';

export default {
  data() {
    return {
      lists: [],

    };
  },

  methods: {
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
    },

  },
};
</script>
<style lang="scss" scoped>
#input-368{
  padding: 0;
}

</style>
