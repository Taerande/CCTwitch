<template>
<v-container>
  <v-row
    v-if="dataLoading == false"
      class="ma-auto pa-0 justify-center align-center"
      style="position:absolute; top:25%; left:48%;">
   <v-progress-circular
      indeterminate
      size="100"
      color="purple"
    ></v-progress-circular>
  </v-row>
  <v-row
  class="ma-auto pa-0 justify-center align-center"
  v-for="item in $store.state.searchList"
  :key="item.id">
  <v-col cols="6">
     <router-link :to="{name: 'Channel',
     query:{
       q: item.login
     },
       params: item,
     }">
     <v-card
     dark>
       <v-card-title>
        <v-badge
      v-if="item.broadcaster_type == 'partner'"
      bordered
      color="rgb(119,44,232)"
      icon="mdi-check"
      overlap
      >
    <v-avatar
    size="50">
        <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
    </v-avatar>
    </v-badge>
    <v-avatar
    size="50"
    v-else>
        <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
    </v-avatar>

       <span
       class="pl-3"
       >
       {{item.display_name}}
       </span>
       </v-card-title>
       <v-card-subtitle>조회수 : {{item.view_count}}</v-card-subtitle>
     </v-card>
     </router-link>
  </v-col>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      dataLoading: false,
      lists: [],
      userInfoLists: [],
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
        this.dataLoading = true;
      }).catch((error) => console.log(error));
    },
  },
  created() {
    // console.log('store', this.$store.state.searchQuery);
    // console.log('router : ', this.$router);
    // console.log('router : ', this.$router.currentRoute.query.q);
    this.searchChannel(this.$store.state.searchQuery || this.$router.currentRoute.query.q);
  },
  watch: {
    'this.$store.state.searchQuery': 'searchChannel(this.$store.state.searchQuery || this.$router.currentRoute.query.q)',
  },
};
</script>
<style>
.v-progress-circular {
  margin: 1rem;
}
</style>
