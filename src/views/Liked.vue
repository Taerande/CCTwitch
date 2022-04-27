<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold">Streamer</span>
  </v-row>
  <v-row class="d-flex justify-start pb-5">
    <v-subheader>Recent Streamer</v-subheader>
    <v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="(item, index) in currlist"
    :key="item.id">
      <v-card outlined class="rounded-xl" width="400px">
        <v-card-title>
          <router-link class="d-flex" :to="{name: 'Channel', query:{
            q: item.login}}">
            <div aria-label="avatar" class="flex-direction: column">
              <v-badge
                v-if="item.broadcaster_type == 'partner'"
                bordered
                color="rgb(119,44,232)"
                icon="mdi-check"
                overlap>
                <v-avatar
                outline
                size="40">
                    <v-img :src="item.thumbnail" alt="profile_img"></v-img>
                </v-avatar>
              </v-badge>
              <v-avatar size="40" v-else>
                <v-img :src="item.thumbnail" alt="profile_img"></v-img>
              </v-avatar>
              <div class="rounded-xl d-flex justify-center" v-if="item.is_live">
                <v-icon size="13" color="red">mdi-broadcast</v-icon>
                <span class="red--text text-caption">LIVE</span>
              </div>
              <div class="rounded-xl d-flex justify-center" v-else>
                <v-icon  size="13" color="blue">mdi-broadcast-off</v-icon>
                <span class="blue--text text-caption">OFF</span>
              </div>
            </div>
            <div aria-label="streamer info" class="pl-3" style="max-width:130px">
              <div class="d-flex text-truncate align-center">
                {{item.display_name}}
                <span v-if="item.viewer_count*1 > 0" class=" pl-1 red--text text-caption">{{
                  viewerkFormatter(item.viewer_count)}}</span>
              </div>
              <div class="text-caption text-truncate">
              Followers: {{kFormatter(item.follower_count)}}
              </div>
            </div>
          </router-link>
          <v-spacer></v-spacer>
          <div>
            <StarBtnDialogVue :liked="{data:item, index:index}"></StarBtnDialogVue>
          </div>
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
  <v-subheader>Follow Streamer On Live</v-subheader>
  <v-row class="d-flex justify-start pb-5" v-if="islogin">
    <v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in streamerList.stream"
    :key="item.id">
      <v-card outlined class="rounded-xl pa-0" width="280px">
        <v-card-text class="d-flex align-center justify-space-between pa-2">
          <div>
            <v-avatar
              size="36"
            >
              <img :src="item.userInfo.profile_image_url" alt="alt">
            </v-avatar>
          </div>
          <div class="text-truncate" style="width:150px;">
            <div class="text-truncate" style="width:150px;">{{item.userInfo.display_name}}
              <span class="text-caption">
                ({{item.title}})
              </span>
            </div>
            <div class="text-truncate text-caption" style="width:150px;">{{item.game_name}}</div>
          </div>
          <div>
            <div class="error--text text-caption"><v-icon color="error" x-small class="pr-1">mdi-circle</v-icon>{{viewerkFormatter(item.viewer_count)}}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else class="d-flex justify-center">
    <v-alert type="error">
      <div>
        로그인이 필수입니다.
      </div>
    </v-alert>
  </v-row>
  <v-subheader>Follow All</v-subheader>
  <v-row class="d-flex justify-start pb-5" v-if="islogin">
    <v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in streamerList.follow"
    :key="item.to_id">
    <v-card class="rounded-xl" outlined>
      <v-card-title>
        <v-avatar
          size="40"
        >
          <img :src="item.profile_image_url" alt="alt">
        </v-avatar>
        <span>{{item.display_name}}</span>
      </v-card-title>
    </v-card>
    </v-col>
  </v-row>
  <v-row v-else class="d-flex justify-center">
    <v-alert type="error">
      <div>
        로그인이 필수입니다.
      </div>
    </v-alert>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';
import StarBtnDialogVue from '../components/dialog/StarBtnDialog.vue';

export default {
  components: {
    StarBtnDialogVue,
  },
  data() {
    return {
      currlist:[],
      clips: [],
      streamerList:{
        follow:[],
        stream:[],
        liked:[],
      },
      followList:[],
      streamFollowList:[],
      islogin: false,
    };
  },
  methods: {
    setThumbnailSize(el, index) {
      if (el === '') {
        this.getLiveThumbnail(this.vidlist[index], index);
        return this.vidlist[index].data.thumbnail_url;
      }
      const width = /%{width}/;
      const height = /%{height}/;
      return el.replace(width, '1280').replace(height, '720');
    },
    sortByFollower(element){
      return element.sort((a,b) => b.follower_count - a.follower_count);
    },
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
    viewerkFormatter(el) {
      const num = el.toString();
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(num.length - 9, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`;
      }
      return Math.abs(num);
    },
    like(el) {
      this.$store.commit('SET_LikedStreamer', el);
    },

    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },
    getUserInfo(element) {
      return axios.get('https://api.twitch.tv/helix/users',{
        params: {
          id : element,
        },
        headers:this.$store.state.headerConfig,
      });
    },
    async getFollowList(userInfo){
     await axios.get('https://api.twitch.tv/helix/users/follows',{
        params:{
          from_id: userInfo.uid.split('twitch:')[1],
          first: 100,
        },
        headers:this.$store.state.headerConfig,
      }).then( async (res) => {
        console.log(res.data.data);
        this.followList = res.data.data.map( v => {
          return v.to_id;
        })
        const result = await this.getUserInfo([...this.followList]);
        this.streamerList.follow = result.data.data.sort((a,b) => b.view_count - a.view_count);
    })
    },
    async getStreamFollowList(userInfo){
      const token = localStorage.getItem('twitchAuthToken');
      await axios.get('https://api.twitch.tv/helix/streams/followed',{
        params:{
          user_id: userInfo.uid.split('twitch:')[1]
        },
        headers:{
          Authorization: `Bearer ${token.split(/"/)[1]}`,
          'client-id': process.env.VUE_APP_TWITCH_CLIENT_ID,
        }
      }).then(async (res) => {
        this.streamFollowList = res.data.data.map( v => {
          return v.user_id;
        });
        const result = await this.getUserInfo([...this.streamFollowList]);
        res.data.data.forEach((element) => {
          const index = result.data.data.findIndex((v) => v.id === element.user_id);
          element.userInfo = result.data.data[index];
        })
        this.streamerList.stream = res.data.data;
        })
      },
    async postProcess(){
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if(userInfo){
        this.islogin = true;
        await this.getStreamFollowList(userInfo);
        await this.getFollowList(userInfo);
      }
    },
        // Authoriation: `Bearer ${this.$store.state.twitchAuthToken}`
  },
  computed: {
    getTodayDate() {
      return new Date().toISOString();
    },
  },
  async mounted() {
    await this.postProcess();
  }

};
</script>
<style lang="scss">
.v-progress-circular {
  margin: 1rem;
}
#checkedIcon_partner, #checkedIcon_none{
  display: flex;
  background-color: rgb(0,0,0,0.3);
  width: inherit;
  > i {
    width: -webkit-fill-available;
  }
  :hover{
    cursor: pointer;
  }
}
.v-avatar:hover{
  cursor: pointer;
}
.custom5cols {
  width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}
</style>
