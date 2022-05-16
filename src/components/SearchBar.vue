<template>
  <v-form
    v-if="$vuetify.breakpoint.mdAndUp"
    class="d-flex align-center justify-center"
    @submit.prevent="searchChannel($store.state.searchString)">
      <v-text-field
      v-model="$store.state.searchString"
      outlined
      color="twitch"
      @click:append="searchChannel($store.state.searchString)"
      hide-details
      solo
      dense
      size="20"
      label="Search your Streamer" append-icon="mdi-magnify">
    </v-text-field>
  </v-form>
  <v-dialog
    v-else
    v-model="dialog"
    max-width="500px"
    transition="dialog-transition"
  >
  <template v-slot:activator="{on}">
    <v-icon large v-on="on">mdi-magnify</v-icon>
  </template>
  <v-card>
    <v-card-title class="ma-3">
      Search Streamer
    </v-card-title>
    <v-card-text>
      <v-form
       @submit.prevent="searchChannel($store.state.searchString)">
        <v-text-field
          v-model="$store.state.searchString"
          outlined
          :rules="[rule.required]"
          color="twitch"
          @click:append="searchChannel($store.state.searchString)"
          full-width
          label="Search your Streamer" append-icon="mdi-magnify">
        </v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="dialog=false">close</v-btn>
      <v-btn color="success" @click="searchChannel($store.state.searchString)"
      :disabled="$store.state.searchString === ''"
      text>search</v-btn>
    </v-card-actions>

  </v-card>

  </v-dialog>
</template>
<script>

export default {
  data() {
    return {
      dialog: false,
      rule:{
        required: (value) => !!value || 'Required.',
      }
    };
  },

  methods: {
    async searchChannel(el) {
      if(el === '' || null){ return }
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
      this.dialog = false;
    },

  },
};
</script>
<style lang="scss" scoped>
#input-368{
  padding: 0;
}

</style>
