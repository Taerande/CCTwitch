<template>
<v-container>
  <v-row class="pa-10 align-center">
    <v-col cols="5" class="d-flex">
      <v-row v-if="userInfo">
        <v-badge
        v-if="userInfo.data.broadcaster_type == 'partner'"
        bordered
        color="rgb(119,44,232)"
        icon="mdi-check"
        overlap
        >
        <v-avatar
        size="80">
            <v-img :src="userInfo.data.profile_image_url" alt="profile_img"></v-img>
        </v-avatar>
        </v-badge>
        <v-avatar
        size="80"
        v-else>
            <v-img :src="userInfo.data.profile_image_url" alt="profile_img"></v-img>
        </v-avatar>
        <div class="d-flex flex-column justify-center pl-5">
          <div class="d-flex align-center">
            <span class="text-h5">{{userInfo.data.display_name}}</span>
            <span class="grey--text pl-1">{{ kFormatter(this.userInfo.follower_count) }}
            </span>
            <v-btn v-if="$store.state.likedStreamer.find(ele => ele.id === userInfo.data.id)" icon @click="deleteFav({index: $store.state.likedStreamer.findIndex(el => el.id == userInfo.data.id), display_name:userInfo.data.display_name})">
              <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
            </v-btn>
            <v-btn v-else icon @click="like({id:userInfo.data.id ,login: userInfo.data.login, display_name: userInfo.data.display_name, thumbnail:userInfo.data.profile_image_url,broadcaster_type:userInfo.data.broadcaster_type, follower_count:userInfo.data.follower_count, is_checked:true,})">
              <v-icon>mdi-star</v-icon>
            </v-btn>
          </div>
          <div v-if="this.userInfo.is_live">
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
          'data': item.data,
        }"></clips>
      </v-row>
    </v-row>
    <v-row class="d-flex align-center justify-center no-clips" v-if="this.vidLists.length === 0">
      <div class="text-h4">
        😫There is no Clips
      </div>
    </v-row>
</v-container>
</template>
<script>
import axios from 'axios';
import clips from '../components/ChannelClip.vue';
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
      userInfo: {
        data: '',
        follower_count: '',
        is_live: '',
        viewer_count: '',
      },

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

    async getVid(userId) {
      await axios.get('https://api.twitch.tv/helix/videos', {
        headers: this.$store.state.headerConfig,
        params: {
          user_id: userId,
          first: 100,
          type: 'archive',
        },
      }).then((res) => {
        res.data.data.forEach((el) => {
          this.vidLists.push({
            data: el,
          });
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
        this.userInfo.data = res.data.data['0'];
      }).then(() => {
        axios.get('https://api.twitch.tv/helix/users/follows', {
          params: {
            to_id: this.userInfo.data.id,
          },
          headers: this.$store.state.headerConfig,
        }).then((resp) => {
          this.userInfo.follower_count = resp.data.total;
        }).then(() => {
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
      await this.getUserInfo(this.$route.query.q);
      await this.getVid(this.userInfo.data.id);
      this.dataLoading = true;
    },

  },
  created() {
    this.process();
  },
};
</script>
<style lang="scss" scoped>
.no-clips{
  position: absolute !important;
  top: 50% !important;
  right: 50% !important;
}

</style>
