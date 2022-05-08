<template>
  <v-container>
    <v-row class="py-5">
      <span class="text-h3 font-weight-bold pr-3">Channel : {{userInfo.data.display_name}}</span>
      <span>{{$vuetify.breakpoint.mobile}}</span>
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
              >{{ kFormatter(this.userInfo.follower_count) }}
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
                  follower_count: userInfo.data.follower_count,
                  is_checked: false,
                })
              "
            >
              <v-icon>mdi-star</v-icon>
            </v-btn>
          </div>
          <div v-if="this.userInfo.is_live">
            <v-icon color="red">mdi-broadcast</v-icon>
            <span class="red--text text-body-2 pa-1">LIVE</span>
            <span class="red--text text-caption">
              {{ viewerkFormatter(this.userInfo.viewer_count) }}
            </span>
          </div>
          <div v-else>
            <v-icon color="blue">mdi-broadcast-off</v-icon>
            <span class="blue--text text-body-2 pa-1">OFF</span>
          </div>
        </div>
        <v-dialog
          height="100%"
          :content-class="$vuetify.breakpoint.smAndUp ? '' : 'clipIframe'"
          v-model="dialog"
        >
          <v-card>
            <v-card-title class="info">
              <span class="text-h5"
                >{{ userInfo.data.display_name }}님의 Video List</span
              >
            </v-card-title>
            <div class="d-flex justify-center align-center pa-3" v-if="vidLists.length > 0">
              <span>
                {{setDate(vidLists[vidLists.length-1].data.created_at)}} ~
                {{setDate(vidLists[0].data.created_at)}}
              </span>
            </div>
            <v-container class="pa-3 mx-auto">
              <v-row class="d-flex align-center">
                <v-col
                  @click="changeCarsouelId(index)"
                  class="d-flex vid-list-item overflow-x-hidden"
                  cols="12"
                  xl="3"
                  lg="3"
                  md="4"
                  sm="6"
                  xs="12"
                  v-for="(item, index) in vidLists"
                  :key="index"
                >
                  <v-img
                    :max-width="imgWidth"
                    :src="
                      setThumbnailSize(item.data.thumbnail_url) ||
                      '@/assets/img/404.jpg'
                    "
                    lazy-src="@/assets/img/404.jpg"
                  >
                  </v-img>
                  <div class="pl-2">
                    <div class="text-truncate">{{ item.data.title }}</div>
                    <div class="text-caption d-flex align-center">
                      <v-icon class="pr-1" x-small>mdi-eye</v-icon>
                      {{ viewerkFormatter(item.data.view_count) }}
                    </div>
                    <div class="text-caption">
                      {{ getDurationTime(item.data.duration) }}
                    </div>
                    <div class="text-caption">{{ setDate(item.data.created_at) }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="dialog = false">Close</v-btn>
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
      :userInfo="userInfo"
      :clipSort="clipSort"
    ></SortButton>
    <v-row class="d-block" v-if="this.clipSort === 'vids'">
      <v-row
        id="vidCarousel"
        justify="center"
        align="center"
      >
        <vids
          @openVidsListDialog="openVidsListDialog"
          :vids="vidLists"
          :carsouelId="carsouelId"
          @emitVidId="changeCarsouelId"
        ></vids>
      </v-row>
      <v-row class="pt-10">
        <v-divider></v-divider>
      </v-row>
      <v-row  v-for="(item, listIndex) in vidLists" :key="listIndex">
        <v-row v-if="carsouelId == listIndex">
          <clips
            v-if="carsouelId == listIndex"
            :listData="cliplist"
            :clips="{
              data: item.data,
            }"
          ></clips>
        </v-row>
      </v-row>
    </v-row>
    <v-row
      class="d-flex justify-center align-center pa-0"
      v-else-if="this.clipSort === 'date'"
    >
      <clipsByDate
        :listDat="cliplist"
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
    setDate(el){
      const date = this.$moment(el).format('ll');
      return date;
    },
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
    setThumbnailSize(el) {
      const width = /%{width}/
      const height = /%{height}/
      return el.replace(width, '1280').replace(height, '720')
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
          res.data.data.forEach((el) => {
            this.vidLists.push({
              data: el,
            })
          })
        })
        .catch((error) => console.log(error))
    },
    async getUserInfo(element) {
      await axios
        .get('https://api.twitch.tv/helix/users', {
          params: {
            login: element,
          },
          headers: this.$store.state.headerConfig,
        })
        .then((res) => {
          this.userInfo.data = res.data.data['0']
        })
        .then(() => {
          axios
            .get('https://api.twitch.tv/helix/users/follows', {
              params: {
                to_id: this.userInfo.data.id,
              },
              headers: this.$store.state.headerConfig,
            })
            .then((resp) => {
              this.userInfo.follower_count = resp.data.total
            })
            .then(() => {
              axios
                .get('https://api.twitch.tv/helix/streams', {
                  params: {
                    user_login: element,
                  },
                  headers: this.$store.state.headerConfig,
                })
                .then((respp) => {
                  if (respp.data.data.length === 0) {
                    this.userInfo.is_live = ''
                  } else {
                    this.userInfo.is_live = respp.data.data['0'].type
                    this.userInfo.viewer_count =
                      respp.data.data['0'].viewer_count
                  }
                })
            })
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
      await this.getUserInfo(this.$route.query.q)
      await this.getVid(this.userInfo.data.id)
      this.dataLoading = true
    }
  },
  computed:{
    imgWidth(){
      if(this.$vuetify.breakpoint.mobile){
        return '100px';
      } else {
        return '150px';
      }
    }
  },
  created() {

  },
  async created() {
    await this.process();
    this.$store.commit('SET_DateSort', {
      text: null,
      start: null,
      end: null,
    })
    let tempuserInfo = this.$store.state.userinfo.userInfo;
    if(!this.$store.state.userinfo.userInfo) {
      console.log('hi');
      console.log('hi');
      await this.$firebase.auth().onAuthStateChanged(async (user) => {
        if(user){
          tempuserInfo = user;
          this.$store.commit('SET_UserInfo',user);
        }
      })
      }
      if(tempuserInfo){
        this.unsubscribe = await this.$firestore.collection('cliplist').where('authorId','==',tempuserInfo.uid).onSnapshot((sn) => {
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
