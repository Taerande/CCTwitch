<template >
  <v-container
  v-show="this.$store.state.searchBar">
    <v-row
    class="d-flex align-center justify-center">
    <v-col
    class="col-4">
    <v-form
      @submit.prevent="searchChannel(searchString)">
      <v-text-field
      v-model="searchString"
      label="Input Streamer Id"
      hide-details="auto">
    <v-btn
    type="submit"
    slot="append"
    icon>
      <v-icon
      color="green">
        mdi-magnify
      </v-icon>
    </v-btn>
    </v-text-field>
    </v-form>
    </v-col>
    </v-row>
  </v-container>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      searchString: null,
      lists: [],

    };
  },

  methods: {
    searchChannel(el) {
      axios.get('https://api.twitch.tv/helix/search/channels', {
        params: {
          query: el,
        },
        headers: this.$store.state.headerConfig,
      }).then((res) => {
        this.lists = [];
        res.data.data.forEach((element) => {
          if (element.title.length > 0 && element.game_id > 0) {
            axios.get('https://api.twitch.tv/helix/users', {
              params: {
                id: element.id,
              },
              headers: this.$store.state.headerConfig,
            }).then((resp) => {
              resp.data.data.forEach((ele) => {
                this.lists.push(ele);
              });
              this.lists.sort((a, b) => b.view_count - a.view_count);
            });
          }
        });
        this.$store.commit('SET_SearchList', this.lists);
      }).then(() => this.$router.push({
        path: '/search',
        query: {
          q: el,
        },
      })).catch((error) => console.log(error));
    },
  },
};
</script>
<style >

</style>
