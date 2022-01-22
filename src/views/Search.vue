<template>
<v-container>
  <v-row>
    <v-col v-for="item in $store.state.searchList"
     :key="item.id"
     class="col-4"
     >
     <router-link :to="{name: 'Channel',
     query:{
       q: item.login
     },
       params: item,
     }">
     <v-card>
       <v-card-title>{{item.display_name}}</v-card-title>
       <v-avatar>
         <img :src="item.profile_image_url" :alt="item.login">
       </v-avatar>
       <v-card-subtitle>{{item.title}}</v-card-subtitle>
       <v-card-subtitle>{{item.id}}</v-card-subtitle>
       <v-card-subtitle>조회수 : {{item.view_count}}</v-card-subtitle>
     </v-card>
     </router-link>

    </v-col>
  </v-row>
  <v-row>
  </v-row>
  <v-row>
    {{$store.state.searchList.length}}
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      lists: [],
      userInfoLists: [],
    };
  },
  methods: {
    searchChannel() {
      axios.get('https://api.twitch.tv/helix/search/channels', {
        params: {
          query: this.$route.query.q,
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
      }).catch((error) => console.log(error));
    },
  },
  created() {
    console.log(this.$route.query);
    this.searchChannel();
  },
};
</script>
<style>

</style>
