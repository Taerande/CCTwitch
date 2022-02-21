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
              <v-img :src="item.thumbnail_url" alt="profile_img"></v-img>
          </v-avatar>
        </v-badge>
        <v-avatar
        size="50"
        v-else>
            <v-img :src="item.thumbnail_url" alt="profile_img"></v-img>
        </v-avatar>

       <div
       class="pl-3"
       ><router-link :to="{name: 'Channel',
     query:{
       q: item.broadcaster_login
     }
     }">
        <div class="white--text">
       {{item.display_name}} / {{kFormatter(item.follower_count)}}
        </div>
     </router-link>
        <div v-if="item.is_live">
          <v-icon color="red">mdi-broadcast</v-icon>
          <span class="red--text text-body-2 pa-1">LIVE</span>
        </div>
        <div v-else>
          <v-icon color="blue">mdi-broadcast-off</v-icon>
          <span class="blue--text text-body-2 pa-1">OFF</span>
        </div>
       </div>
       <v-btn v-if="$store.state.likedStreamer.find(ele =>
          ele.id == item.id)" icon @click="deleteFav({index:$store.state.likedStreamer.findIndex(el => el.id == item.id), display_name: item.display_name})">
          <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
        </v-btn>
       <v-btn v-else icon @click="like({id:item.id ,login: item.broadcaster_login, display_name: item.display_name, thumbnail:item.thumbnail_url, broadcaster_type:item.broadcaster_type, follower_count: item.follower_count, is_checked:true,})">
          <v-icon>mdi-star</v-icon>
        </v-btn>
       </v-card-title>
     </v-card>
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
    };
  },
  methods: {
    deleteFav(el) {
      this.$store.commit('DELETE_LikedStreamer', el);
    },
    like(el) {
      this.$store.commit('SET_LikedStreamer', el);
    },
    async searchChannel(el) {
      const lists = [];
      await axios.get('https://api.twitch.tv/helix/search/channels', {
        params: {
          query: el,
        },
        headers: this.$store.state.headerConfig,
      }).then((res) => {
        res.data.data.forEach((element) => {
          const data = element;
          if (element.title.length > 0 && element.game_id > 0) {
            axios.get('https://api.twitch.tv/helix/users', {
              params: {
                id: element.id,
              },
              headers: this.$store.state.headerConfig,
            }).then((resp) => {
              data.broadcaster_type = resp.data.data[0].broadcaster_type;
            }).then(() => {
              axios.get('https://api.twitch.tv/helix/users/follows', {
                params: {
                  to_id: element.id,
                },
                headers: this.$store.state.headerConfig,
              }).then((respp) => {
                data.follower_count = respp.data.total;
                lists.push(data);
                lists.sort((a, b) => b.follower_count - a.follower_count);
              });
            });
          }
        });
      }).catch((error) => console.log(error));
      this.$store.commit('SET_SearchList', lists);
      this.dataLoading = true;
    },
    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },

  },
  mounted() {
    this.searchChannel(this.$route.query.q);
  },
};
</script>
<style>
.v-progress-circular {
  margin: 1rem;
}
</style>
