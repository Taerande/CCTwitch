<template>
  <div class="d-flex">
    <v-form
    class="d-flex align-center justify-center"
    @submit.prevent="searchChannel($store.state.searchString)">
      <v-text-field
      v-model="$store.state.searchString"
      full-width
      color="rgb(119,44,232)"
      @click:append="searchChannel($store.state.searchString)"
      outlined
      size="50"
      height="50"
      label="Search your Streamer" prepend-icon="mdi-twitch" append-icon="mdi-magnify">
      </v-text-field>
    </v-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
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
<style lang="scss">

</style>
