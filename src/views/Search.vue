<template>
<v-container fluid >
  <v-row class="align-center pt-10 pl-3 pb-3">
    <span class="text-h5 font-weight-bold">Search : {{this.$route.query.q}} </span>
  </v-row>
  <v-divider></v-divider>
  <v-row
  v-if="$store.state.searchList.length > 0 && !dataLoading"
  class="pa-0 pt-3 d-flex">
    <v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in $store.state.searchList"
    :key="item.id">
      <v-card outlined class="rounded-xl" width="400px">
        <v-card-title>
          <router-link class="d-flex" :to="{name: 'Channel', query:{
            q: item.broadcaster_login}}">
            <div aria-label="avatar" class="flex-direction: column">
              <v-badge
                v-if="item.broadcaster_type == 'partner'"
                bordered
                color="rgb(119,44,232)"
                icon="mdi-check"
                overlap>
                <v-avatar
                outline
                color="black"
                size="40">
                    <v-img :src="item.thumbnail_url" alt="profile_img"></v-img>
                </v-avatar>
                </v-badge>
              <v-avatar size="40" v-else>
                <v-img :src="item.thumbnail_url" alt="profile_img"></v-img>
              </v-avatar>
              <div class="black rounded-xl d-flex justify-center" v-if="item.is_live">
                <v-icon size="13" color="red">mdi-broadcast</v-icon>
                <span class="red--text text-caption">LIVE</span>
              </div>
              <div class="black rounded-xl d-flex justify-center" v-else>
                <v-icon  size="13" color="blue">mdi-broadcast-off</v-icon>
                <span class="blue--text text-caption">OFF</span>
              </div>
            </div>
            <div aria-label="streamer info" class="pl-3" style="max-width:130px">
              <div class="text-truncate">
                {{item.display_name}}
              </div>
              <div class="text-caption text-truncate">
              Followers: {{kFormatter(item.follower_count)}}
              </div>
            </div>
          </router-link>
          <v-spacer></v-spacer>
          <div>
            <v-btn v-if="$store.state.likedStreamer.find(ele =>
                ele.id == item.id)" icon @click="deleteFav({index:$store.state.likedStreamer.findIndex(el => el.id == item.id), display_name: item.display_name})">
                <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
              </v-btn>
            <v-btn v-else icon @click="like({id:item.id ,login: item.broadcaster_login, display_name: item.display_name, thumbnail:item.thumbnail_url, broadcaster_type:item.broadcaster_type, follower_count: item.follower_count, is_checked:false,})">
                <v-icon>mdi-star</v-icon>
            </v-btn>
          </div>
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else class="absolute-center">
    <v-progress-circular indeterminate></v-progress-circular>
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
      this.dataLoading = true;
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
      this.dataLoading = false;
      this.$store.commit('SET_SearchList', lists);
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
