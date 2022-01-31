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
      <v-badge
      v-if="this.$route.params.broadcaster_type == 'partner'"
      bordered
      color="rgb(119,44,232)"
      icon="mdi-check"
      overlap
      >
    <v-avatar
    size="80">
        <v-img :src="$route.params.profile_image_url" alt="profile_img"></v-img>
    </v-avatar>
    </v-badge>
    <v-avatar
    size="80"
    v-else>
        <v-img :src="$route.params.profile_image_url" alt="profile_img"></v-img>
    </v-avatar>

    <h1 class="pl-4">
      {{$route.params.display_name}}
    </h1>
  </v-row>
  <v-row class="ma-0 palign-bottom">
    {{$route.params.description}}
  </v-row>
  <v-row
  class="ma-auto pa-0 justify-center align-center">
  <v-col
  id="vidCarousel"
  class="pa-0"
  lg="3"
  md="4"
  sm="6"
  xs="12"
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
    <div v-if="carsouelId == item.data.id">
    <v-row>
      <clips
      v-if="carsouelId == item.data.id"
      :clips="item.clips"></clips>
    </v-row>
    </div>
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
    changeCarsouelId(currentId) {
      this.carsouelId = currentId;
    },
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 24 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    getDuration() {

    },

    async getVid(userId) {
      await axios.get('https://api.twitch.tv/helix/videos', {
        headers: this.$store.state.headerConfig,
        params: {
          user_id: userId,
          first: 10,
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
          if (el.video_id === target.data.id && el.view_count > 9) {
            target.clips.push(el);
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

  },
  created() {
    if (Object.keys(this.$route.params).length === 0) { this.$router.push({ path: '/' }); }
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
