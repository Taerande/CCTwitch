<template>
<v-container fluid >
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold pr-3">Search | {{this.$route.query.q}}</span>
  </v-row>
  <v-divider></v-divider>
  <v-row
  v-if="searchList.length > 0 && !dataLoading"
  class="pa-0 pt-3 d-flex">
    <v-col cols="12" xl="2" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in searchList"
    :key="item.id">
      <v-card outlined class="rounded-lg d-flex flex-row" style="width:400px;" :to="{name: 'Channel',
        query:{
            q: item.broadcaster_login
          },
        params:{
          data:item
        }
      }">
        <v-card-title style="width:inherit">
          <div aria-label="avatar" class="d-flex">
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
            <div aria-label="streamer info" class="pl-3">
              <div class="text-truncate" style="width:inherit">
                {{item.display_name}}
              </div>
              <div class="text-caption text-truncate">
                Followers: {{kFormatter(item.follower_count)}}
              </div>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="d-flex align-center justify-end pa-0 ma-0">
          <v-icon small :color="item.is_live ? 'error' : 'blue'">mdi-circle</v-icon>
        <div>
          <v-btn v-if="$store.state.likedStreamer.find(ele =>
              ele.id == item.id)" icon @click.prevent="deleteFav({index:$store.state.likedStreamer.findIndex(el => el.id == item.id), display_name: item.display_name})">
              <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
            </v-btn>
          <v-btn v-else icon @click.prevent="like({id:item.id ,login: item.broadcaster_login, display_name: item.display_name, thumbnail:item.thumbnail_url, broadcaster_type:item.broadcaster_type})">
              <v-icon>mdi-star</v-icon>
          </v-btn>
        </div>
        </v-card-text>
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
      searchList:[],
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
                this.searchList.push(data);
                this.searchList.sort((a, b) => b.follower_count - a.follower_count);
              });
            });
          }
        });
      }).catch((error) => console.log(error));
      this.dataLoading = false;
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
    document.title = `${this.$route.query.q} | Search - CCTWITCH`
    this.searchChannel(this.$route.query.q);
  },
};
</script>
<style>
.v-progress-circular {
  margin: 1rem;
}
</style>
