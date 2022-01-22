<template>
<v-container>
  <v-row class="pa-10">
      <v-badge
      v-if="this.$route.params.broadcaster_type == 'partner'"
      bordered
      color="rgb(119,44,232)"
      icon="mdi-check"
      overlap
      >
    <v-avatar
    size="100">
        <v-img :src="$route.params.profile_image_url" alt="profile_img"></v-img>
    </v-avatar>
    </v-badge>
    <v-avatar
    size="100"
    v-else>
        <v-img :src="$route.params.profile_image_url" alt="profile_img"></v-img>
    </v-avatar>

    <span>
      {{$route.params.display_name}}
    </span>
  </v-row>
  <v-row>
    <v-btn @click="()=>{ currentPage -= 1
        }">이전으로
      </v-btn>
      <v-btn @click="()=>{ currentPage += 1
        }">다음으로
      </v-btn>
  </v-row>
  <v-row
  class="pb-15"
    v-for="(item, i) in this.vidLists"
    :key="item.data.id"
  >
    <div
    v-if="currentPage == i">

    <v-row>
      <div>{{item.data.title}}</div>
      <div>{{item.data.created_at}}</div>
      <div>{{item.data.thumbnail_url}}</div>
    </v-row>
    <v-row>
      <clips
      v-if="currentPage == i"
      :clips="item.clips"></clips>
    </v-row>
    </div>
  </v-row>
<v-row>
  <div class="twitch-video">
   <!-- <iframe src="https://clips.twitch.tv/embed?clip=HorribleBlatantSwordNerfBlueBlaster&parent=localhost" parent="localhost" frameborder="0" allowfullscreen="false" scrolling="yes" height="720" width="1280"></iframe> -->
  </div>
</v-row>
</v-container>
</template>
<script>
import axios from 'axios';
import clips from '../components/clips.vue';

export default {
  components: { clips },
  data() {
    return {
      currentPage: 0,
      isActive: false,
      vidLists: [],
      todayDate: new Date(),

    };
  },
  methods: {
    async getVid(userId) {
      await axios.get('https://api.twitch.tv/helix/videos', {
        headers: this.$store.state.headerConfig,
        params: {
          user_id: userId,
          first: 7,
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
          first: 50,
        },
      }).then((resp) => {
        resp.data.data.forEach((el) => {
          if (el.video_id === target.data.id && target.clips.length < 20) {
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

</style>
