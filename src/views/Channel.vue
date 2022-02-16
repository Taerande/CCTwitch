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
      <v-row>
        <v-badge
        v-if="userInfo.broadcaster_type == 'partner'"
        bordered
        color="rgb(119,44,232)"
        icon="mdi-check"
        overlap
        >
        <v-avatar
        size="80">
            <v-img :src="userInfo.profile_image_url" alt="profile_img"></v-img>
        </v-avatar>
        </v-badge>
        <v-avatar
        size="80"
        v-else>
            <v-img :src="userInfo.profile_image_url" alt="profile_img"></v-img>
        </v-avatar>
        <div class="d-flex flex-column justify-center pl-5">
          <div class="d-flex align-center">
            <span class="text-h5">{{userInfo.display_name}}</span>
            <span span class="grey--text pl-1">{{ kFormatter(this.userInfo.follower_count) }}
            </span>
            <v-btn v-if="$store.state.likedStreamer.find(ele => ele.id === userInfo.id)" icon @click="deleteFav($store.state.likedStreamer.findIndex(el => el.id == userInfo.id))">
              <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
            </v-btn>
            <v-btn v-else icon @click="like({id:userInfo.id ,login: userInfo.login, display_name: userInfo.display_name})">
              <v-icon>mdi-star</v-icon>
            </v-btn>
          </div>
          <div v-if="userInfo.is_live">
            <v-icon color="red">mdi-broadcast</v-icon>
            <span class="red--text text-body-2 pa-1">LIVE</span>
            <span class="red--text text-caption"> {{ viewerkFormatter(this.userInfo.viewer_count) }} </span>
          </div>
          <div v-else>
            <v-icon color="blue">mdi-broadcast-off</v-icon>
            <span class="blue--text text-body-2 pa-1">OFF</span>
          </div>
        </div>
      </v-row>
    </v-col>
    <v-col
    id="vidCarousel"
    class="pa-0"
    cols="7">
    <vids
    :vids="this.vidLists"
    @emitVidId="changeCarsouelId"></vids>
    </v-col>
  </v-row>
  <v-row
    v-for="item in this.vidLists"
    :key="item.data.id">
    <v-row v-if="carsouelId == item.data.id">
      <clips
      v-if="carsouelId == item.data.id"
      :clips="{
        'clips': item.clips,
        'page': 'channel',
      }"></clips>
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
      userInfo: '',

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

    async getUserInfo(element) {
      await axios.get('https://api.twitch.tv/helix/users', {
        params: {
          login: element,
        },
        headers: this.$store.state.headerConfig,
      }).then((res) => {
        this.userInfo = res.data.data['0'];
        axios.get('https://api.twitch.tv/helix/users/follows', {
          params: {
            to_id: this.userInfo.id,
          },
          headers: this.$store.state.headerConfig,
        }).then((resp) => {
          this.userInfo.follower_count = resp.data.total;
          axios.get('https://api.twitch.tv/helix/streams', {
            params: {
              user_login: element,
            },
            headers: this.$store.state.headerConfig,
          }).then((respp) => {
            if (respp.data.data.length === 0) {
              this.userInfo.is_live = '';
            } else {
              this.userInfo.is_live = respp.data.data['0'].type;
              this.userInfo.viewer_count = respp.data.data['0'].viewer_count;
            }
          });
        });
      });
    },
    async setUserInfo() {
      if (this.$route.params.id === undefined) {
        await this.getUserInfo(this.$route.query.q);
      } else {
        await this.getUserInfo(this.$route.query.q);
        // this.userInfo = this.$route.params;
      }
    },
    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },
    viewerkFormatter(el) {
      const num = el.toString();
      if (el > 999999999) {
        return `${num.slice(0, -9)},${num.slice(num.length - 9, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (el > 999999) {
        return `${num.slice(0, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (el > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`;
      }
      return Math.abs(el);
    },
    async process() {
      await this.setUserInfo();
      await this.getVid(this.userInfo.id);
      const promise = this.vidLists.map(this.getClip);
      await Promise.all(promise);
      this.dataLoading = true;
    },

  },
  created() {
    this.process();
  },
};
</script>
<style>
#vidCarousel{
  border: 2px solid black;
}

</style>
