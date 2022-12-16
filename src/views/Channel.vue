<template>
  <v-container v-if="userInfo" fluid>
    <v-row class="py-5 col-12">
      <span class="text-h3 text-truncate font-weight-bold pr-3">Channel | {{userInfo.data.display_name}}</span>
    </v-row>
    <v-divider></v-divider>
    <v-row class="col-12 d-flex pt-5 align-center text-truncate">
      <div class="d-flex align-center py-3 text-truncate">
        <div class="d-flex align-baseline mx-2">
          <v-badge
          v-if="userInfo.data.broadcaster_type == 'partner'"
          bordered
          color="rgb(119,44,232)"
          icon="mdi-check"
          overlap
        >
          <v-avatar :size="$vuetify.breakpoint.smAndDown ? 48 : 80">
            <v-img
              :src="userInfo.data.profile_image_url"
              alt="profile_img"
            ></v-img>
          </v-avatar>
        </v-badge>
        <v-avatar :size="$vuetify.breakpoint.smAndDown ? 48 : 80" v-else>
          <v-img
            :src="userInfo.data.profile_image_url"
            alt="profile_img"
          ></v-img>
        </v-avatar>
        </div>
        <div class="pl-2 text-truncate">
          <span>
            {{userInfo.data.display_name}} ({{userInfo.data.login}})
          </span>
          <span class="grey--text text-caption">
            {{ kFormatter(userInfo.data.follower_count) }}
          </span>
          <div class="d-flex align-center pa-0 ma-0">
            <div v-if="userInfo.is_live">
              <v-icon color="red" small>mdi-circle</v-icon>
              <span class="red--text text-body-2 pa-1">LIVE</span>
              <span class="red--text text-caption">
                {{ userInfo.viewer_count | commaCase }}
              </span>
            </div>
            <div v-else>
              <v-icon color="blue" small>mdi-circle</v-icon>
              <span class="blue--text text-body-2 pa-1">OFF</span>
            </div>
            <span v-if="dataLoading" class="px-1">
              <v-btn
                v-if="
                  $store.state.likedStreamer.find(
                    (ele) => ele.id === userInfo.data.id,
                  )
                "
                icon
                small
                @click="
                  deleteFav({
                    index: $store.state.likedStreamer.findIndex(
                      (el) => el.id == userInfo.data.id,
                    ),
                    display_name: userInfo.data.display_name,
                  })
                "
              >
                <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
              </v-btn>
              <v-btn
                v-else
                icon
                small
                @click="
                  like({
                    id: userInfo.data.id,
                    login: userInfo.data.login,
                    display_name: userInfo.data.display_name,
                    thumbnail: userInfo.data.profile_image_url,
                    broadcaster_type: userInfo.data.broadcaster_type,
                  })
                "
              >
                <v-icon>mdi-star</v-icon>
              </v-btn>
              <v-badge
              overlap
              borderd
              offset-x="20"
              offset-y="20"
              icon="mdi-exclamation-thick"
              :value="badge"
              color="error"
              >
                <v-btn v-if="isSubscribe" :disabled="subsLoading" color="twitch" @click="unsubNotification(userInfo.data.id)" icon><v-icon>mdi-bell</v-icon></v-btn>
                <v-btn v-else :disabled="subsLoading" icon @click="subNotification(userInfo.data.id)"><v-icon>mdi-bell</v-icon></v-btn>
              </v-badge>
            </span>
          </div>
        </div>
      </div>
    </v-row>
    <v-row class="d-flex pt-3 align-baseline">
      {{ userInfo.data.description }}
    </v-row>
    <v-dialog
      height="100%"
      scrollable
      max-width="90%"
      :content-class="$vuetify.breakpoint.smAndUp ? '' : 'clipIframe'"
      v-model="dialog"
    >
      <v-card>
        <v-card-title class="twitch">
          <span class="text-h5 white--text"
            >{{ userInfo.data.display_name }}님의 Archive</span
          >
        </v-card-title>
        <v-card-text class="pa-0 ma-0">
          <div class="d-flex justify-center align-center pa-3" v-if="vidLists.length > 0">
            <span>
              {{$moment(vidLists[vidLists.length-1].data.created_at).format('ll')}} ~
              {{$moment(vidLists[0].data.created_at).format('ll')}}
            </span>
          </div>
          <v-container class="pa-0 mx-auto">
            <v-row class="align-center">
              <v-col
                @click="changeCarsouelId(index)"
                class="d-flex vid-list-item text-truncate pa-1 align-center"
                cols="12"
                xl="3"
                lg="4"
                md="4"
                sm="6"
                xs="12"
                v-for="(item, index) in vidLists"
                :key="index"
              >
              <v-responsive :aspect-ratio="16/9" height="100%">
                <v-img
                  :max-width="imgWidth"
                  :src="
                    item.data.thumbnail_url ||
                    '@/assets/img/404.jpg'
                  "
                  lazy-src="@/assets/img/404.jpg"
                >
                </v-img>
              </v-responsive>
                <div class="pl-2 text-truncate" style="width:inherit">
                  <div class="text-truncate">{{ item.data.title }}</div>
                  <div class="text-caption d-flex align-center">
                    <v-icon class="pr-1" x-small>mdi-eye</v-icon>
                    {{ item.data.view_count === -1 ? 'No Archive' : item.data.view_count | commaCase }}
                  </div>
                  <div class="text-caption">
                    {{ item.data.duration | getDurationTime}}
                  </div>
                  <div class="text-caption">{{ $moment(item.data.created_at).format('ll') }}</div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text class="text-caption" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SortButton
      @changeSort="changeSort"
      @openVidsListDialog="openVidsListDialog"
      :userInfo="userInfo"
      :clipSort="clipSort"
      :vidInfo="vidLists[carsouelId]"
    ></SortButton>
    <v-row class="d-block" v-if="this.clipSort === 'vids'">
      <v-row
        :style="{height:`${imgHeight}px`}"
        id="vidCarousel"
        justify="center"
        align="center"
      >
        <vids
        v-if="vidLists.length > 0 && dataLoading"
          @openVidsListDialog="openVidsListDialog"
          :vids="vidLists"
          :carsouelId="carsouelId"
          @emitVidId="changeCarsouelId"
        ></vids>
        <div v-else-if="dataLoading && vidLists.length === 0" class="d-flex align-center" style="height: 30vh;">
          <v-alert v-if="vidLists.length === 0" type="error">
            😟다시보기가 없고 생방송중이 아닙니다.
          </v-alert>
        </div>
        <div class="d-flex justify-center" v-else>
          <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
      </v-row>
      <v-row  v-for="(item, listIndex) in vidLists" :key="listIndex">
        <clips
          v-if="carsouelId == listIndex"
          :listData="cliplist"
          :clips="{
            data: item.data,
          }"
        ></clips>
      </v-row>
    </v-row>
    <v-row
      class="d-flex justify-center align-center pa-0"
      v-else-if="this.clipSort === 'date'"
    >
      <clipsByDate
        :listData="cliplist"
        :clips="{ user_id: userInfo.data.id }"
      ></clipsByDate>
    </v-row>
    <v-row
      class="d-flex justify-center align-center pa-0"
      v-else-if="this.clipSort === 'search'">
      <ChannelClipBySearchVue
      :listData="cliplist"
      :userData="userInfo.data"
      ></ChannelClipBySearchVue>
    </v-row>
  </v-container>
</template>
<script>
import axios from 'axios'
import clips from '../components/ChannelClip.vue'
import clipsByDate from '../components/ChannelClipByDate.vue'
import vids from '../components/vids.vue'
import SortButton from '../components/Channel/SortButton'
import ChannelClipBySearchVue from '../components/ChannelClipBySearch.vue'
export default {
  components: {
    clips,
    vids,
    ChannelClipBySearchVue,
    clipsByDate,
    SortButton,
  },
  data() {
    return {
      unsubscribe: null,
      isSubscribe: false,
      dialog: false,
      dataLoading: false,
      cliplist:[],
      vidLists: [],
      streamData:{},
      carsouelId: 0,
      subsLoading:false,
      userInfo: {
        data: '',
        follower_count: '',
        is_live: '',
        viewer_count: '',
      },
      clipSort: 'vids',
    }
  },
  methods: {
    openVidsListDialog() {
      this.dialog = true
    },
    changeSort(el) {
      this.clipSort = el
    },
    changeCarsouelId(currentId) {
      this.carsouelId = currentId
      this.dialog = false
    },
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
    },
    async getVid(userId) {
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/videos',
          params: {
            user_id: userId,
            first: 100,
            type: 'archive',
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      await axios(axiosOption).then((res) => {
          if(res.data.data.length > 0){
            const width = /%{width}/;
            const height = /%{height}/;
            this.vidLists = res.data.data.map((v) => {
              v.thumbnail_url = v.thumbnail_url.replace(width, '480').replace(height, '272');
              return {
                data:v,
              }
            })
            if(this.userInfo.is_live && this.vidLists[0].data.stream_id !== this.streamData.id){
              this.vidLists.unshift({
                data:{
                  id: new Date().getTime(),
                  is_live: 'live',
                  viewer_count: this.streamData.viewer_count,
                  user_login: this.streamData.user_login,
                  user_id: this.streamData.user_id,
                  created_at: this.streamData.started_at,
                  view_count: -1,
                  thumbnail_url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${this.streamData.user_login}-480x272.jpg`,
                  title: this.streamData.title,
                  duration: this.setTimeHMSformat(this.$moment().diff(this.streamData.started_at,'seconds')),
                }
              })
            } else if(this.userInfo.is_live && this.vidLists[0].data.stream_id === this.streamData.id){
              this.vidLists[0] = {
                data:{
                  id: res.data.data[0].id,
                  is_live: 'live',
                  viewer_count: this.streamData.viewer_count,
                  user_login: this.streamData.user_login,
                  user_id: this.streamData.user_id,
                  created_at: res.data.data[0].created_at,
                  view_count: res.data.data[0].view_count,
                  thumbnail_url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${this.streamData.user_login}-480x272.jpg`,
                  title: this.streamData.title,
                  duration: this.setTimeHMSformat(this.$moment().diff(res.data.data[0].created_at,'seconds')),
                }
              }
            }
          } else {
            if(this.streamData){
              this.vidLists.push({
                data:{
                  id: new Date().getTime(),
                  is_live: 'live',
                  viewer_count: this.streamData.viewer_count,
                  user_login: this.streamData.user_login,
                  user_id: this.streamData.user_id,
                  created_at: this.streamData.started_at,
                  view_count: -1,
                  thumbnail_url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${this.streamData.user_login}-480x272.jpg`,
                  title: this.streamData.title,
                  duration: this.setTimeHMSformat(this.$moment().diff(this.streamData.started_at,'seconds')),
                }
              })
            }
          }
        }).catch(async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getVid(userId);
        }
      })
    },
    async getUserInfo(element) {
      try{
        await axios
          .get('https://api.twitch.tv/helix/users', {
            params: {
              login: element.q,
              id: element.id,
            },
            headers: this.$store.state.headerConfig,
          })
          .then((res) => {
            this.userInfo.data = res.data.data['0']
            document.title = `${res.data.data['0'].display_name} | Channel - CCTwitch`
          }).catch( async (e)=>{
            if(e.response.status === 401){
              await this.$store.dispatch('setNewTwitchAppToken');
              await this.getUserInfo(element);
            }else{
              this.$router.push({path:'/'}).catch(()=>{});
              this.$store.commit('SET_SnackBar',{
                type:'error',
                text:'스트리머를 찾을 수 없습니다.',
                value:true,
              })
            }
          })
      }
      catch{(err) => {
        console.log(err);
        }
      }
    },
    async getFollower() {
      axios
        .get('https://api.twitch.tv/helix/users/follows', {
          params: {
            to_id: this.userInfo.data.id,
          },
          headers: this.$store.state.headerConfig,
        })
        .then((res) => {
          this.userInfo.data.follower_count = res.data.total
        })
    },
    async getStreamData(element){
      await axios
        .get('https://api.twitch.tv/helix/streams', {
          params: {
            user_login: element,
          },
          headers: this.$store.state.headerConfig,
        })
        .then((res) => {
          this.streamData = res.data.data[0]
          if(res.data.data.length > 0){
            this.userInfo.is_live = res.data.data[0].type
            this.userInfo.viewer_count =
              res.data.data[0].viewer_count
          } else {
            this.userInfo.is_live = ''
            this.userInfo.viewer_count = null
          }
        })
    },
    like(el) {
      this.$store.commit('SET_LikedStreamer', el)
    },
    deleteFav(el) {
      this.$store.commit('DELETE_LikedStreamer', el)
    },
    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`
      }
      if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`
      }
      return Math.abs(el)
    },
    async isNotificated(){
      if(this.$store.state.userinfo.userInfo){
        let starCountRef = await this.$firertdb.ref('notification/' + this.userInfo.data.id + '/subscribers/' + this.$store.state.userinfo.userInfo.uid);
        starCountRef.on('value', (snapshot) => {
          this.isSubscribe = snapshot.val();
        });
      }
    },
    async subNotification(broadcaster_id){
      if(!this.$store.state.isListed){
        this.$store.commit('SET_SnackBar',{type:'error',text:'현재 기기는 등록되지 않은 상태로 알람이 가지 않습니다.',value:true});
      }
      if(this.$store.state.userinfo.userInfo){
        this.subsLoading = true;
        await this.$firertdb.ref(`/notification/${broadcaster_id}`).get().then( async (sn) => {
          if(!sn.exists()){
            this.subscribe(broadcaster_id);
          }
        });
        await this.$firertdb.ref(`/notification/${broadcaster_id}/subscribers`).update({
          [this.$store.state.userinfo.userInfo.uid] : true
        }).then(() => {
          this.$store.commit('SET_SnackBar',{type:'success', text:`${this.userInfo.data.display_name}님을 알람에 추가합니다.`, value:true})
          this.subsLoading = false;
        }).catch((err) => {
          console.log(err)
        })
      } else {
        this.$store.commit('SET_SignInDialog',true);
      }
    },
    async unsubNotification(broadcaster_id){
      if(this.$store.state.userinfo.userInfo){
      this.subsLoading = true;
      await this.$firertdb.ref(`/notification/${broadcaster_id}/subscribers`).update({
        [this.$store.state.userinfo.userInfo.uid] : false
      }).then(() => {
        this.$store.commit('SET_SnackBar',{type:'error', text:`${this.userInfo.data.display_name}님을 알람에서 제거합니다.`, value:true})
        this.subsLoading = false;
      }).catch((err) => {
        console.log(err)
      })
      } else {
        this.$store.commit('SET_SignInDialog',true);
      }
    },
    async subscribe(id){
      let type = ['stream.offline','channel.update','stream.online'];
      const token = JSON.parse(localStorage.getItem('twitchAppAccessToken'));
      for(let i = 0; i < type.length; i++){
        let error;
        await axios.post(`${this.$store.state.backendUrl}/twitchWebHook/createWebhook`,{
          id: id,
          token: token,
          type: type[i],
        },
        {
          'Content-Type':'application/json',
        }
        ).then((res) => {
          error = res.data.error;
        });
        if(error !== undefined){
          break;
        };
      }
    },
    async process() {
      await this.getUserInfo(this.$route.query)
      await this.getFollower()
      await this.isNotificated()
      await this.getStreamData(this.userInfo.data.login)
      await this.getVid(this.userInfo.data.id)
      this.dataLoading = true
    }
  },
  computed:{
    badge(){
      if(!this.$store.state.userinfo.userInfo){
        return false;
      }else{
        return !this.$store.state.isListed
      }
    },
    imgHeight(){
      if(this.$vuetify.breakpoint.mobile){
        return `${285*9/16+50}`;
      } else {
        return `${480*9/16+50}`;
      }
    },
    imgWidth(){
      if(this.$vuetify.breakpoint.mobile){
        return '100px';
      } else {
        return '150px';
      }
    }
  },
  async created() {
    if(!this.$route.query){
      this.$router.push({path:'/'}).catch(()=>{});
    }
    let tempuserInfo = this.$store.state.userinfo.userInfo;
    if(!this.$store.state.userinfo.userInfo) {
      await this.$firebase.auth().onAuthStateChanged(async (user) => {
        if(user){
          this.$store.commit('SET_UserInfo',user);
        }
      })
    }
    if(tempuserInfo){
      this.unsubscribe = await this.$firestore.collection('cliplist').orderBy("createdAt","desc").where('authorId','==',tempuserInfo.uid).onSnapshot((sn) => {
        if(sn.empty){
          this.cliplist = [];
          return
          }
          this.cliplist = sn.docs.map( v => {
            const item = v.data()
            return {
              id: v.id,
              title: item.title,
              createdAt: item.createdAt,
              color: item.color,
              clipCount: item.clipCount,
              clipIds: item.clipIds,
            }
          })
        })
    }
    await this.process();
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
  },
}
</script>
<style lang="scss" scoped>
.no-clips {
  position: absolute !important;
  top: 50% !important;
  right: 50% !important;
}
.vid-list-item:hover {
  cursor: pointer;
  background: var(--twitch-color);
}
.vid-list-item:hover div {
  color: white;
}
.vid-list-item:hover i {
  color: white;
}
</style>
