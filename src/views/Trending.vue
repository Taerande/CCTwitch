<template>
<v-container>
  <v-row v-if="$store.state.likedStreamer.length > 0">
    <v-row v-for="(item, index) in userInfo" :key="index" class="d-flex justify-center pt-7">
      <v-badge
        v-if="item.broadcaster_type == 'partner'"
        bordered
        color="rgb(119,44,232)"
        icon="mdi-check"
        overlap
        >
        <v-avatar
        size="80">
            <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
        </v-avatar>
        </v-badge>
        <v-avatar
        size="80"
        v-else>
            <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
        </v-avatar>
        <div class="d-flex flex-column justify-center pl-5">
          <div class="d-flex align-center">
            <span class="text-h5">{{item.display_name}}</span>
            <v-btn v-if="$store.state.likedStreamer.find(ele => ele.id === item.id)" icon @click="deleteFav($store.state.likedStreamer.findIndex(el => el.id == item.id))">
              <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
            </v-btn>
            <v-btn v-else icon @click="like({id:item.id ,login: item.login, display_name: item.display_name})">
              <v-icon>mdi-star</v-icon>
            </v-btn>
          </div>
        </div>
    </v-row>
    <v-row>
      <clips :clips="{
        'clips': clips,
        'page': 'trending',
      }"></clips>
    </v-row>
  </v-row>
  <v-row v-else>
    <v-col>
      <span>there is no clip</span>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';
import clips from '@/components/clips.vue';

export default {
  components: {
    clips,
  },
  data() {
    return {
      clips: [],
      userInfo: [],
      dataLoading: false,
    };
  },
  methods: {
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 48 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    getStartDate(el) {
      const endedAt = new Date(el).getTime();
      const startedAt = new Date(endedAt - 7 * 24 * 60 * 60 * 1000);
      return startedAt.toISOString();
    },

    deleteFav(el) {
      this.$store.commit('DELETE_LikedStreamer', el);
    },
    like(el) {
      this.$store.commit('SET_LikedStreamer', el);
    },
    async getUserInfo(element) {
      await axios.get('https://api.twitch.tv/helix/users', {
        headers: this.$store.state.headerConfig,
        params: {
          id: element.id,
        },
      }).then((res) => {
        this.userInfo.push(res.data.data[0]);
      }).catch((error) => console.log(error));
    },
    async getClip(target) {
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          broadcaster_id: target.id,
          started_at: this.getStartDate(this.getTodayDate),
          ended_at: this.getTodayDate,
          first: 50,
        },
      }).then((resp) => {
        resp.data.data.forEach((el) => {
          this.clips.push(el);
          this.clips.sort((a, b) => b.view_count - a.view_count);
        });
      }).catch((error) => console.log(error));
    },
    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },
    async process() {
      const promise = this.$store.state.likedStreamer.map(this.getClip);
      const promise2 = this.$store.state.likedStreamer.map(this.getUserInfo);
      await Promise.all([...promise, ...promise2]);
    },

  },
  computed: {
    getTodayDate() {
      return new Date().toISOString();
    },
  },
  created() {
    this.process();
  },
};
</script>
<style>
.v-progress-circular {
  margin: 1rem;
}
</style>
