<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold">Streamer</span>
  </v-row>
  <v-divider></v-divider>
  <v-subheader>Book Mark</v-subheader>
  <DisplyaAdContainerVue></DisplyaAdContainerVue>
  <v-row class="d-flex justify-start pa-3" v-if="streamerList.liked.length > 0">
    <v-col cols="6" :class="$vuetify.breakpoint.xl ? 'custom5cols' : ''" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex flex-column  align-center"
    v-for="item in streamerList.liked"
    :key="item.id">
      <v-card outlined dark class="d-flex rounded-lg py-1" width="320px" :to="{name: 'Channel', query:{
            q: item.login}}">
        <v-card-text class="d-flex align-center pa-2">
            <div aria-label="avatar" class="flex-direction: column">
              <v-badge
                v-if="item.broadcaster_type == 'partner'"
                color="rgb(119,44,232)"
                icon="mdi-check"
                overlap>
                <v-avatar
                outline
                size="36">
                    <v-img :src="item.thumbnail" alt="profile_img"></v-img>
                </v-avatar>
              </v-badge>
              <v-avatar size="36" v-else>
                <v-img :src="item.thumbnail" alt="profile_img"></v-img>
              </v-avatar>
            </div>
            <div aria-label="streamer info" class="d-flex align-center pl-3" style="max-width:150px">
              <div class="text-caption text-truncate font-weight-black white--text">
                {{item.display_name}}
              </div>
            </div>
        </v-card-text>
        <!-- <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click.prevent="" icon><v-icon>mdi-bell</v-icon></v-btn>
          <v-btn color="success" icon><v-icon>mdi-bell-off</v-icon></v-btn>
        </v-card-actions> -->
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else-if="streamerList.liked.length === 0" class="d-flex justify-center pa-3">
    <v-alert type="error">
      <div>
        좋아요를 누른 스트리머가 없습니다.
      </div>
    </v-alert>
  </v-row>
  <v-divider class="mt-5"></v-divider>
  <v-subheader>On Live</v-subheader>
  <DisplyaAdContainerVue></DisplyaAdContainerVue>
  <v-row v-if="loading.stream" class="d-flex justify-center py-10">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-flex justify-start pa-3" v-if="streamerList.stream.length > 0 && !loading.stream">
    <v-col cols="12" :class="$vuetify.breakpoint.xl ? 'custom5cols' : ''" lg="3" md="4" sm="6" class="pa-2 d-flex justify-center"
    v-for="item in streamerList.stream"
    :key="item.id">
      <v-card outlined dark class="py-1 rounded-lg" width="320px"  :to="{name: 'Channel', query:{
            q: item.user_login}}">
        <v-card-text class="d-flex align-center pa-2">
          <div>
            <v-badge
            v-if="item.userInfo.broadcaster_type === 'partner'"
            color="twitch"
            icon="mdi-check"
            overlap
            >
              <v-avatar
                outline
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
          <div class="text-truncate pl-4">
            <div class="white--text">
                {{item.user_name}}
            </div>
            <div class="text-caption text-truncate">
              {{item.title}}
            </div>
            <div class="text-caption">{{item.game_name}}</div>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex justify-end">
            <div class="d-flex error--text text-caption"><v-icon color="error" x-small class="pr-1">mdi-circle</v-icon>{{viewerkFormatter(item.viewer_count)}}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else-if="streamerList.stream.length === 0 && !loading.stream" class="d-flex justify-center pa-3">
    <v-alert type="error" v-if="!$store.state.userinfo.userInfo">
      <div>
        로그인이 필요한 기능입니다.
      </div>
    </v-alert>
    <v-alert type="error" v-else>
      <div>
        생방송중인 스트리머가 없습니다.
      </div>
    </v-alert>
  </v-row>
  <v-divider class="mt-5"></v-divider>
  <v-subheader>All</v-subheader>
  <DisplyaAdContainerVue></DisplyaAdContainerVue>
  <v-row v-if="loading.follow" class="d-flex justify-center py-10">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-flex justify-start pa-3" v-if="streamerList.follow.length > 0 && !loading.follow">
    <v-col cols="6" :class="$vuetify.breakpoint.xl ? 'custom5cols' : ''" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in streamerList.follow"
    :key="item.to_id">
     <v-card outlined dark class="d-flex  py-1 align-center rounded-lg" width="320px" :img="reduceOfflineImgSize(item.offline_image_url)" :to="{name: 'Channel', query:{
            q: item.login}}">
        <v-card-title class="d-flex align-center justify-space-between pa-2">
          <div aria-label="avatar" class="flex-direction: column">
            <v-badge
              v-if="item.broadcaster_type == 'partner'"
              small
              color="rgb(119,44,232)"
              icon="mdi-check"
              overlap>
                <v-avatar
                outline
                size="36">
                  <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
                </v-avatar>
            </v-badge>
            <v-avatar size="36" v-else>
              <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
            </v-avatar>
          </div>
          <div aria-label="streamer info" class="d-flex align-center pl-3" style="max-width:150px">
            <div class="text-caption text-truncate font-weight-black text-stroke-2 white--text">
              {{item.display_name}}
            </div>
          </div>
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else-if="streamerList.follow.length === 0 && !loading.follow" class="d-flex justify-center pa-3">
    <v-alert type="error" v-if="!$store.state.userinfo.userInfo">
      <div>
        로그인이 필요한 기능입니다.
      </div>
    </v-alert>
    <v-alert type="error" v-else>
      <div>
        팔로우중인 스트리머가 없습니다.
      </div>
    </v-alert>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';
import DisplyaAdContainerVue from '../components/DisplyaAdContainer.vue';

export default {
  components: {
    DisplyaAdContainerVue,
  },
  data() {
    return {
      loading:{
        follow: false,
        stream: false,
        liked: false,
      },
      notiLoading: false,
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
    reduceOfflineImgSize(el){
      if(el){
        const fw = el.split('1920x1080')[0];
        const bw = el.split('1920x1080')[1];
        return fw + '320x180' + bw;
      } else {
        return null;
      }
    },
    pushToTwitchVids(url, title) {
      if (window.confirm(`${title} 영상으로 이동하시겠습니까?`)) {
        window.open(url);
      }
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
    async subNotification(broadcaster_id){
      this.notiLoading = true;
      await this.$firertdb.ref(`/notification/${broadcaster_id}/subscribers`).update({
        [this.$store.state.userinfo.userInfo.uid] : true
      }).then(()=>{
        this.notiLoading = false;
      })
    },
    async unsubNotification(broadcaster_id){
      this.notiLoading = true;
      await this.$firertdb.ref(`/notification/${broadcaster_id}/subscribers`).update({
        [this.$store.state.userinfo.userInfo.uid] : false
      }).then(()=>{
        this.notiLoading = false;
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
            element.userInfo =
            {
              broadcaster_type: result.data.data[index].broadcaster_type,
              profile_image_url: result.data.data[index].profile_image_url,
            }
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
            localStorage.setItem('twitchOAuthToken', JSON.stringify(res.data));
            await this.getStreamFollowList(userInfo);
          }).catch(() => {
            // refresh token도 망가졌음, 로그아웃 후 새롭게 로그인 유도
            this.logOut();
          });
        })
      },
    async logOut(){
      await this.$firebase.auth().signOut().then(() =>{
        localStorage.removeItem('twitchOAuthToken');
        this.$router.push({path:'/'}).catch(()=>{});
        this.$store.commit('SET_SnackBar', {type:'error', text:'로그인 정보가 잘못되었습니다. 다시 로그인 해주세요', value:true});
      });
    },
    async postProcess(){
      try{
        const user = this.$store.state.userinfo.userInfo;
        const twitchOAuthToken = JSON.parse(localStorage.getItem('twitchOAuthToken'));
        if(user && twitchOAuthToken){
          this.islogin = true;
          Promise.all([
            this.getStreamFollowList(user),
            this.getFollowList(user)
          ])
        } else if(user && twitchOAuthToken === null) {
          this.logOut();
          // this.postProcess();
        }
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
    this.streamerList.liked = JSON.parse(localStorage.getItem('alllikes')) || [];
    await this.postProcess();
  },
  created(){
    document.title = 'Streamer - CCTWITCH';
  }
};
</script>
<style lang="scss" scoped>
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
.v-card--reveal {
  align-items: center;
  bottom: 0;
  filter: none;
  justify-content: center;
  position: absolute;
  width: 100%;
}
.v-card:hover{
  z-index: 3;
  transition: all ease 0.2s 0s;
  transform: scale(1.1) !important;
  box-shadow: 5px 5px 0 var(--twitch-color);
}
</style>
