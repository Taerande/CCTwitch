<template>
<v-container>
  <v-row
    v-if="dataLoading == false"
      class="ma-auto pa-0 justify-center align-center"
      style="position:absolute; top:45%; left:48%;">
   <v-progress-circular
      indeterminate
      size="100"
      color="purple"
    ></v-progress-circular>
  </v-row>
  <v-row class="pa-10 align-center">
    <v-col cols="5" class="d-flex">
      <v-badge
      v-if="this.$route.params.broadcaster_type == 'partner'"
      bordered
      color="rgb(119,44,232)"
      icon="mdi-check"
      overlap
      >
    <v-avatar
    size="80">
        <v-img :src="$route.params.thumbnail_url" alt="profile_img"></v-img>
    </v-avatar>
    </v-badge>
    <v-avatar
    size="80"
    v-else>
        <v-img :src="$route.params.thumbnail_url" alt="profile_img"></v-img>
    </v-avatar>

    <div class="pl-4">
      <span class="text-h5">
      {{$route.params.display_name}}
      </span>
      <span class="grey--text">
        {{kFormatter($route.params.follower_count)}}
      </span>
      <div v-if="$route.params.is_live">
        <v-icon color="red">mdi-broadcast</v-icon>
        <span class="red--text text-body-2 pa-1">LIVE</span>
      </div>
      <div v-else>
        <v-icon color="blue">mdi-broadcast-off</v-icon>
        <span class="blue--text text-body-2 pa-1">OFF</span>
      </div>
      <div>
       <v-btn v-if="$store.state.likedStreamer.find(ele =>
          ele.id === $route.params.id)" icon @click="deleteFav($store.state.likedStreamer.findIndex(el => el.id == $route.params.id))">
          <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
        </v-btn>
       <v-btn v-else icon @click="like($route.params)">
          <v-icon>mdi-star</v-icon>
        </v-btn>
      </div>
    </div>
    </v-col>
    <v-col
    id="vidCarousel"
    class="pa-0"
    cols="7"
    >
    <vids
    :vids="this.vidLists"
    @emitVidId="changeCarsouelId"
    ></vids>
  </v-col>
  </v-row>

  <v-row
    v-for="item in this.vidLists"
    :key="item.data.id"
  >
    <v-row v-if="carsouelId == item.data.id">
      <clips
      v-if="carsouelId == item.data.id"
      :clips="item.clips"></clips>
    </v-row>
  </v-row>
</v-container>
</template>
<script>
import axios from 'axios';
import clips from '../components/clips.vue';
import vids from '../components/vids.vue';

export default {
  components: { clips, vids },
  data() {
    return {
      dataLoading: false,
      currentPage: 0,
      isActive: false,
      vidLists: [],
      todayDate: new Date(),
      carsouelId: 123123,

    };
  },
  methods: {
    like(el) {
      this.$store.commit('SET_LikedStreamer', el);
    },
    deleteFav(el) {
      this.$store.commit('DELETE_LikedStreamer', el);
    },
    changeCarsouelId(currentId) {
      this.carsouelId = currentId;
    },
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 48 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    getDuration() {

    },

    async getVid(userId) {
      await axios.get('https://api.twitch.tv/helix/videos', {
        headers: this.$store.state.headerConfig,
        params: {
          user_id: userId,
          first: 20,
        },
      }).then((res) => {
        res.data.data.forEach((el) => {
          this.vidLists.push({
            data: el,
            clips: [],
          });
        });
      }).catch((error) => console.log(error));
    },

    async getClip(target) {
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          broadcaster_id: target.data.user_id,
          started_at: target.data.created_at,
          ended_at: this.getEndDate(target.data.created_at),
          first: 100,
        },
      }).then((resp) => {
        resp.data.data.forEach((el) => {
          if (el.video_id === target.data.id) {
            target.clips.push(el);
            // && el.view_count > 0
          }
        });
      }).catch((error) => console.log(error));
    },

    getUserInfo(query) {
      axios.get('https://api.twitch.tv/helix/users', {
        headers: this.$store.state.headerConfig,
        params: {
          login: query,
        },
      }).then((resp) => {
        this.userInfo = resp.data.data;
      }).catch((error) => console.log(error));
    },

    async process() {
      await this.getVid(this.$route.params.id);
      const promise = this.vidLists.map(this.getClip);
      await Promise.all(promise);
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
  created() {
    if (Object.keys(this.$route.params.id).length === 0) { this.$router.push({ path: '/' }); }
    this.process();
  },
  updated() {
  },

};
</script>
<style>
#vidCarousel{
  border: 2px solid black;
}

</style>
