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
    <v-icon>mdi-play</v-icon>
    <v-icon>mdi-play</v-icon>
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
//
//  searchChannel(el) {
//       axios.get('https://api.twitch.tv/helix/search/channels', {
//         params: {
//           query: el,
//         },
//         headers: this.$store.state.headerConfig,
//       }).then((res) => {
//         this.lists = [];
//         res.data.data.forEach((element) => {
//           if (element.title.length > 0 && element.game_id > 0) {
//             axios.get('https://api.twitch.tv/helix/users', {
//               params: {
//                 id: element.id,
//               },
//               headers: this.$store.state.headerConfig,
//             }).then((resp) => {
//               resp.data.data.forEach((ele) => {
//                 this.lists.push(ele);
//               });
//               this.lists.sort((a, b) => b.view_count - a.view_count);
//             });
//           }
//         });
//         this.$store.commit('SET_SearchList', this.lists);
//       }).then(() => this.$router.push({
//         path: '/search',
//         query: {
//           q: el,
//         },
//       })).catch((error) => console.log(error));
//     },
