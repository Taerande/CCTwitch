<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold">Streamer</span>
  </v-row>
  <v-divider></v-divider>
  <v-subheader>Like</v-subheader>
  <v-row v-if="loading.liked" class="d-flex justify-center align-center pa-10">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-row>
  <v-row class="d-flex justify-start pb-5" v-if="currlist.length > 0 && !loading.liked">
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
  <v-row v-else-if="currlist.length === 0 && !loading.liked" class="d-flex justify-center pa-10">
    <v-alert type="error">
      <div>
        좋아요를 누른 스트리머가 없습니다.
      </div>
    </v-alert>
  </v-row>
  <v-divider></v-divider>
  <v-subheader>On Live</v-subheader>
  <v-row v-if="loading.stream" class="d-flex justify-center align-center pa-10">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-row>
  <v-row class="d-flex justify-start pa-10" v-if="streamerList.stream.length > 0 && !loading.stream">
    <v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in streamerList.stream"
    :key="item.id">
      <v-card dark outlined class="rounded-xl pa-0" width="280px">
        <v-card-text class="d-flex align-center justify-space-between pa-2">
          <div>
            <v-badge
            v-if="item.userInfo.broadcaster_type === 'partner'"
            color="twitch"
            icon="mdi-check"
            overlap
            >
              <v-avatar
                size="36"
              >
                <img :src="item.userInfo.profile_image_url" alt="alt">
              </v-avatar>
            </v-badge>
            <v-avatar
              v-else
              size="36"
            >
              <img :src="item.userInfo.profile_image_url" alt="alt">
            </v-avatar>
          </div>
          <div class="text-truncate pl-2" style="width:150px;">
            <div class="text-truncate" style="width:150px;">{{item.userInfo.display_name}}
              <span class="text-caption">
                {{item.title}}
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
  <v-row v-else-if="streamerList.stream.length === 0 && !loading.stream" class="d-flex justify-center pa-10">
    <v-alert type="error">
      <div>
        생방송중인 스트리머가 없습니다.
      </div>
    </v-alert>
  </v-row>
  <v-divider></v-divider>
  <v-subheader>All</v-subheader>
  <v-row v-if="loading.follow" class="d-flex justify-center align-center pa-10">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-row>
  <v-row class="d-flex justify-start pa-10" v-if="streamerList.follow.length > 0 && !loading.follow">
    <v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in streamerList.follow"
    :key="item.to_id">
      <v-hover v-slot="{ hover }">
        <v-card dark class="rounded-xl pa-0" outlined width="280px"
        :style="{'filter': hover ? 'grayscale(10%)' : 'none', 'opacity': hover ? '0.8' : '1'}"
        :img="item.offline_image_url">
          <v-card-text class="d-flex align-center justify-space-between pa-2">
            <v-expand-x-transition>
              <div
                v-if="hover"
                class="d-flex pa-0 ma-0 transition-slow-in-fast-out v-card--reveal white--text"
                style="height: 100%; filter:none;"
              >
              <v-icon color="twitch" @click="pushToTwitchVids(`https://www.twitch.tv/${item.login}`,item.display_name)">mdi-twitch</v-icon>
              <router-link :to="`/channel?q=${item.login}`">
                <v-icon>mdi-magnify</v-icon>
              </router-link>
              </div>
            </v-expand-x-transition>
            <div>
              <v-badge
                x-small
                v-if="item.broadcaster_type === 'partner'"
                color="twitch"
                icon="mdi-check"
                overlap
                outline
                >
                  <v-avatar
                    size="36"
                  >
                    <img :src="item.profile_image_url" alt="alt">
                  </v-avatar>
              </v-badge>
              <v-avatar
                v-else
                size="36"
              >
                <img :src="item.profile_image_url" alt="alt">
              </v-avatar>
            </div>
            <span class="text-weight-bold white--text text-stroke">{{item.display_name}}</span>
          </v-card-text>
        </v-card>
      </v-hover>
    </v-col>
  </v-row>
  <v-row v-else-if="streamerList.follow.length === 0 && !loading.follow" class="d-flex justify-center pa-10">
    <v-alert type="error">
      <div>
        팔로우중인 스트리머가 없습니다.
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
      loading:{
        follow: false,
        stream: false,
        liked: false,
      },
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
    pushToTwitchVids(url, title) {
      if (window.confirm(`${title} 영상으로 이동하시겠습니까?`)) {
        window.open(url);
      }
    },
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
    async getUserInfo(element) {
      return await axios.get('https://api.twitch.tv/helix/users',{
        params: {
          id : element,
        },
        headers:this.$store.state.headerConfig,
      });
    },
    async getFollowList(userInfo){
      this.loading.follow = true;
     await axios.get('https://api.twitch.tv/helix/users/follows',{
        params:{
          from_id: userInfo.uid.split('twitch:')[1],
          first: 100,
        },
        headers:this.$store.state.headerConfig,
      }).then( async (res) => {
        if(res.data.data.length > 0){
          this.followList = await res.data.data.map( v => {
            return v.to_id;
          })
          const result = await this.getUserInfo([...this.followList]);
          this.streamerList.follow = result.data.data.sort((a,b) => b.view_count - a.view_count);
        } else {
          this.streamerList.follow = [];
        }
    }).then(() => {
      this.loading.follow = false;
    })
    },
    async getStreamFollowList(userInfo){
      this.loading.stream = true;
      const token = JSON.parse(localStorage.getItem('twitchOAuthToken'));
      await axios.get('https://api.twitch.tv/helix/streams/followed',{
        params:{
          user_id: userInfo.uid.split('twitch:')[1]
        },
        headers:{
          Authorization: `Bearer ${token.access_token}`,
          'client-id': process.env.VUE_APP_TWITCH_CLIENT_ID,
        }
      }).then(async (res) => {
        this.streamFollowList = await res.data.data.map( v => {
          return v.user_id;
        });
        if(res.data.data.length > 0){
          const result = await this.getUserInfo([...this.streamFollowList]);
          res.data.data.forEach((element) => {
            const index = result.data.data.findIndex((v) => v.id === element.user_id);
            element.userInfo = result.data.data[index];
          })
        }
        this.streamerList.stream = res.data.data;
        })
        .then(() => {
          this.loading.stream = false;
        }).catch(() => {
          // 에러 발생, refresh token으로 OAuth Token 재발급
          axios.post(`${this.$store.state.backendUrl}/twitchOauthToken/oauthtoken/issue`,
          {
            refresh_token : token.refresh_token
          }
          ,{
            headers: { 'Content-Type': 'application/json'}
          }).then(async (res) => {
            await localStorage.setItem('twitchOAuthToken', JSON.stringify(res.data));
            this.getStreamFollowList(userInfo);
          }).catch(() => {
            // refresh token도 망가졌음, 로그아웃 후 새롭게 로그인 유도
            this.logOut();
          });
        })
      },
    async logOut(){
      await this.$firebase.auth().signOut().then(() =>{
        this.$store.commit('SET_UserInfo', null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('twitchOAuthToken');
        if(this.$route.path !== '/'){
          this.$router.push({path:'/'})
        }
      });
    },
    async postProcess(){
      try{
        await this.$firebase.auth().onAuthStateChanged((user) => {
          // const user = this.$store.state.userinfo.userInfo;
          const twitchOAuthToken = JSON.parse(localStorage.getItem('twitchOAuthToken'));
          if(user && twitchOAuthToken){
            this.islogin = true;
            this.getStreamFollowList(user);
            this.getFollowList(user);
          } else {
            this.$store.commit('SET_SnackBar', {type:'error', text:'로그인 정보가 잘못되었습니다. 다시 로그인 해주세요', value:true});
          }
        });
      } catch {
        (err) => {
          console.log(err.message);
        }

      }
    },
  },
  computed: {
    getTodayDate() {
      return new Date().toISOString();
    },
  },
  async mounted() {
    console.log('hi');
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
.text-stroke {
  text-shadow:
  -1px -1px 0 #000,
  1px -1px 0 #000,
  -1px 1px 0 #000,
  1px 1px 0 #000;
}
.v-card--reveal {
  align-items: center;
  bottom: 0;
  filter: none;
  justify-content: center;
  position: absolute;
  width: 100%;
}
</style>
