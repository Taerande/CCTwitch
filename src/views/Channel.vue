<template>
  <v-container v-if="userInfo" fluid>
    <v-row class="py-5">
      <span class="text-h3 font-weight-bold pr-3">Channel | {{userInfo.data.display_name}}</span>
    </v-row>
    <v-divider></v-divider>
    <v-row class="pt-5 align-center">
      <v-row v-if="userInfo">
        <v-badge
          v-if="userInfo.data.broadcaster_type == 'partner'"
          bordered
          color="rgb(119,44,232)"
          icon="mdi-check"
          overlap
        >
          <v-avatar size="80">
            <v-img
              :src="userInfo.data.profile_image_url"
              alt="profile_img"
            ></v-img>
          </v-avatar>
        </v-badge>
        <v-avatar size="80" v-else>
          <v-img
            :src="userInfo.data.profile_image_url"
            alt="profile_img"
          ></v-img>
        </v-avatar>
        <div class="d-flex flex-column justify-center pl-5">
          <div class="d-flex align-center">
            <span class="text-h5">{{ userInfo.data.display_name }}</span>
            <span class="grey--text pl-1"
              >{{ kFormatter(userInfo.data.follower_count) }}
            </span>
            <v-btn
              v-if="
                $store.state.likedStreamer.find(
                  (ele) => ele.id === userInfo.data.id,
                )
              "
              icon
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
          </div>
          <div v-if="userInfo.is_live">
            <v-icon color="red" small>mdi-circle</v-icon>
            <span class="red--text text-body-2 pa-1">LIVE</span>
            <span class="red--text text-caption">
              {{ viewerkFormatter(userInfo.viewer_count) }}
            </span>
          </div>
          <div v-else>
            <v-icon color="blue" small>mdi-circle</v-icon>
            <span class="blue--text text-body-2 pa-1">OFF</span>
          </div>
        </div>
        <v-dialog
          height="100%"
          scrollable
          width="80%"
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
              <v-container class="pa-2 mx-auto">
                <v-row class="align-center">
                  <v-col
                    @click="changeCarsouelId(index)"
                    class="d-flex vid-list-item text-truncate"
                    cols="12"
                    xl="3"
                    lg="4"
                    md="4"
                    sm="6"
                    xs="12"
                    v-for="(item, index) in vidLists"
                    :key="index"
                  >
                    <v-img
                      :max-width="imgWidth"
                      :src="
                        item.data.thumbnail_url ||
                        '@/assets/img/404.jpg'
                      "
                      lazy-src="@/assets/img/404.jpg"
                    >
                    </v-img>
                    <div class="pl-2 text-truncate" style="width:inherit">
                      <div class="text-truncate">{{ item.data.title }}</div>
                      <div class="text-caption d-flex align-center">
                        <v-icon class="pr-1" x-small>mdi-eye</v-icon>
                        {{ item.data.view_count === -1 ? 'No Archive' : viewerkFormatter(item.data.view_count) }}
                      </div>
                      <div class="text-caption">
                        {{ getDurationTime(item.data.duration) }}
                      </div>
                      <div class="text-caption">{{ $moment(item.data.created_at).format('ll') }}</div>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </v-row>
    <v-row class="d-flex pt-3 align-baseline">
      {{ userInfo.data.description }}
    </v-row>
    <SortButton
      @changeSort="changeDateSort"
      @openVidsListDialog="openVidsListDialog"
      :userInfo="userInfo"
      :clipSort="clipSort"
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
  </v-container>
</template>
<script>
import axios from 'axios'
import clips from '../components/ChannelClip.vue'
import clipsByDate from '../components/ChannelClipByDate.vue'
import vids from '../components/vids.vue'
import SortButton from '../components/Channel/SortButton'

export default {
  components: {
    clips,
    vids,
    clipsByDate,
    SortButton,
  },
  data() {
    return {
      unsubscribe: null,
      dialog: false,
      dataLoading: false,
      cliplist:[],
      vidLists: [],
      streamData:{},
      carsouelId: 0,
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
    viewerkFormatter(el) {
      const num = el.toString()
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(
          num.length - 9,
          -6,
        )},${num.slice(num.length - 6, -3)},${num.slice(-3)}`
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(
          num.length - 6,
          -3,
        )},${num.slice(-3)}`
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`
      }
      return Math.abs(num)
    },
    openVidsListDialog() {
      this.dialog = true
    },
    changeDateSort(el) {
      this.clipSort = el
    },
    changeCarsouelId(currentId) {
      this.carsouelId = currentId
      this.dialog = false
    },
    getDurationTime(el) {
      const regex = /h|m|s/
      const duration = el.split(regex)
      if (duration.length === 4) {
        if (duration[1] === '0') {
          return `${duration[0]}시간`
        }
        return `${duration[0]}시간 ${duration[1]}분`
      }
      if (duration.length === 3) {
        return `${duration[0]}분`
      }

      return '1분 미만'
    },
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
    },
    async getVid(userId) {
      await axios
        .get('https://api.twitch.tv/helix/videos', {
          headers: this.$store.state.headerConfig,
          params: {
            user_id: userId,
            first: 100,
            type: 'archive',
          },
        })
        .then((res) => {
          if(res.data.data.length > 0){
            const width = /%{width}/;
            const height = /%{height}/;
            this.vidLists = res.data.data.map((v) => {
              v.thumbnail_url = v.thumbnail_url.replace(width, '480').replace(height, '272');
              return {
                data:v,
              }
            })
            if(this.userInfo.is_live && this.vidLists[0].data.thumbnail_url === ''){
              this.vidLists[0].data.thumbnail_url = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${this.userInfo.data.login}-480x272.jpg`;
              this.vidLists[0].data.is_live = this.userInfo.is_live;
              this.vidLists[0].data.viewer_count = this.userInfo.viewer_count;
            } else if(this.userInfo.is_live && this.vidLists[0].data.thumbnail_url !== ''){
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
        })
        .catch((error) => console.log(error))
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
            document.title = `${res.data.data['0'].display_name} | Channel - CCTWIICH`
          }).catch(()=>{
            this.$router.push({path:'/'}).catch(()=>{});
            this.$store.commit('SET_SnackBar',{
              type:'error',
              text:'스트리머를 찾을 수 없습니다.',
              value:true,

            })
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
    async process() {
      await this.getUserInfo(this.$route.query)
      await this.getFollower()
      await this.getStreamData(this.userInfo.data.login)
      await this.getVid(this.userInfo.data.id)
      this.dataLoading = true
    }
  },
  computed:{
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
    if(!this.$route.query.q){
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
              description: item.description,
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
