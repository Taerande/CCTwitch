<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold">Streamer</span>
  </v-row>
  <v-divider></v-divider>
  <v-subheader>Book Mark</v-subheader>
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
                    <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
                </v-avatar>
              </v-badge>
              <v-avatar size="36" v-else>
                <v-img :src="item.profile_image_url" alt="profile_img"></v-img>
              </v-avatar>
            </div>
            <div aria-label="streamer info" class="d-flex align-center pl-3" style="max-width:150px">
              <div class="text-caption text-truncate font-weight-black white--text">
                {{item.display_name}}
              </div>
            </div>
        </v-card-text>
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
  <InArticleAdContainerVue></InArticleAdContainerVue>
  <v-divider class="mt-5"></v-divider>
  <v-subheader>On Live</v-subheader>
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
            <div class="d-flex error--text text-caption"><v-icon color="error" x-small class="pr-1">mdi-circle</v-icon>{{item.viewer_count | commaCase}}</div>
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
  <v-row v-if="loading.follow" class="d-flex justify-center py-10">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-flex justify-start pa-3" v-if="streamerList.follow.length > 0 && !loading.follow">
    <v-col cols="6" :class="$vuetify.breakpoint.xl ? 'custom5cols' : ''" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="item in streamerList.follow"
    :key="item.to_id">
     <v-card outlined dark class="d-flex  py-1 align-center rounded-lg" width="320px" :to="{name: 'Channel', query:{
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
  <InArticleAdContainerVue></InArticleAdContainerVue>
</v-container>
</template>

<script>
import axios from 'axios';
import InArticleAdContainerVue from '../components/InArticleAdContainer.vue';

export default {
  components: {
    InArticleAdContainerVue,
  },
  data() {
    return {
      loading:{
        follow: false,
        stream: false,
        liked: false,
      },
      streamerList:{
        follow:[],
        stream:[],
        liked:[],
      },
      followList:[],
      streamFollowList:[],
    };
  },
  methods: {
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
        }).catch( async (e) => {
          if(e.response.status === 401){
            await this.$store.dispatch('setNewTwitchAppToken');
            await this.getFollowList(userInfo);
          }
        });
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
      }).then(() => {
        this.loading.stream = false;
      }).catch( async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchOAuthToken');
          await this.getStreamFollowList(userInfo);
        } else {
          this.logOut()
        }
      });
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
          Promise.all([
            this.getStreamFollowList(user),
            this.getFollowList(user)
          ])
        } else if(user && twitchOAuthToken === null) {
          this.logOut();
        }
      } catch {
        (err) => {
          console.log(err.message);
        }

      }
    },
  },
  computed: {
  },
  async created() {
    document.title = 'Streamer - CCTWITCH';
    this.streamerList.liked = JSON.parse(localStorage.getItem('alllikes')) || [];
    const ids = this.streamerList.liked.map(v => v.id);
    if (ids.length > 0) {
      const result = await this.getUserInfo(ids);
      this.streamerList.liked = result.data.data;
     }
    await this.postProcess();
  },
};
</script>
<style lang="scss" scoped>
.v-avatar:hover{
  cursor: pointer;
}
</style>
