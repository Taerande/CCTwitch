<template>
<v-container fluid v-if="loading">
  <v-row class="d-flex align-center py-5">
    <div class="text-h3 font-weight-bold pr-3">
      Hot Clip |
    </div>
    <div class="text-h4 font-weight-bold" v-if="hotClipData.title">
      {{hotClipData.title}}
    </div>
  </v-row>
  <v-divider class="my-2"></v-divider>
  <v-row class="d-flex col-12 justify-center pt-7">
    <v-col cols="12" xl="9" lg="9" md="9" sm="12" class="copyBody pa-0">
      <v-card class="pa-0 ma-0 black">
        <v-card-text class="pa-0 ma-0 d-flex justify-center">
          <video
            :onerror="hello()"
            v-if="$store.state.lang === 'ko'" :id="`${hotClipData.clipData.id}`" width="100%" controls
            :src="`${hotClipData.clipData.thumbnail_url.split('-preview')[0]}.mp4`">
          </video>
          <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndDown ? 1/1 : 16/11" height="100%" v-else>
          <iframe
              allow="autoplay"
              :src="`https://clips.twitch.tv/embed?clip=${hotClipData.id}&parent=${$store.state.embedUrl}&preload=auto`"
              preload="auto"
              frameborder="0"
              height="100%"
              width="100%"
              allowfullscreen="true"></iframe>
          </v-responsive>
        </v-card-text>
        <div class="ma-0 px-1 py-2">
          <Adsense data-ad-client="ca-pub-8597405222136575" data-ad-slot="8940370849"
            :ins-style="`display:inline-block;width:100%;height:90px;min-wdith:250px;`"></Adsense>
        </div>
        <div class="d-flex flex-wrap justify-center align-center pa-0 pb-4 white--text">
          <div class="px-1 mx-1">
            <v-btn :loading="getvidLoading" dark class="d-flex mx-auto" :disabled="hotClipData.clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${hotClipData.clipData.video_id}?t=${setTimeHMSformat(hotClipData.clipData.vod_offset)}`, setTimeHMSformat(hotClipData.clipData.vod_offset))"><v-icon>mdi-twitch</v-icon></v-btn>
            <div class="text-caption">다시보기</div>
          </div>
          <div class="px-1 mx-1">
            <v-btn class="d-flex mx-auto" color="error" icon @click="copyClip(hotClipData.clipData)">
              <v-icon>mdi-clipboard-multiple-outline</v-icon>
            </v-btn>
            <div class="text-caption">URL 복사</div>
          </div>
          <div class="px-1 mx-1">
            <v-btn class="d-flex mx-auto" color="error" icon @click="downloadClip(hotClipData.clipData)">
              <v-icon>mdi-download</v-icon>
            </v-btn>
            <div class="text-caption">다운로드</div>
          </div>
          <div class="px-1 mx-1">
            <pinClip class="d-flex mx-auto" v-if="$store.state.userinfo.userInfo" name="channelClipPin" :clipData="{data:hotClipData.clipData}" :listData="cliplist"></pinClip>
            <v-btn class="d-flex mx-auto" v-else color="error" icon @click.stop="$store.commit('SET_SignInDialog',true)"><v-icon>mdi-plus-box-multiple</v-icon>
            </v-btn>
            <div class="text-caption">추가하기</div>
          </div>
          <div class="px-1 mx-1" v-if="$store.state.lang === 'ko'">
            <v-btn :loading="m3u8Loading" dark class="d-flex mx-auto" :disabled="hotClipData.clipData.video_id === ''" color="error" icon
              @click="getm3u8()"><v-icon>mdi-file-download-outline</v-icon></v-btn>
            <div class="text-caption">.m3u8</div>
          </div>
          <div class="px-1 mx-" v-if="$store.state.lang === 'ko'">
            <v-btn :loading="mineLoad" dark class="d-flex mx-auto" color="error" icon
              @click="mining()"><v-icon>mdi-pickaxe</v-icon></v-btn>
            <div class="text-caption">발굴하기</div>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
  <v-row class="d-flex justify-center">
    <hotclipInfoVue :hotClipData="hotClipData" @changeInfo="changeInfo"></hotclipInfoVue>
  </v-row>
  <v-row class="d-flex justify-center">
    <hotclipCommentsVue @updateCommentCount="updateCommentCount" :hotClipData="hotClipData"></hotclipCommentsVue>
  </v-row>
</v-container>
<v-container v-else>
  <v-row class="d-flex align-center py-5">
    <div class="text-h3 font-weight-bold pr-3">
      Hot Clip
    </div>
  </v-row>
  <v-row class="absolute-center">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
</v-container>
</template>
<script>
import axios from 'axios';
import pinClip from '../components/pinClip.vue';
import hotclipInfoVue from '../components/HotClip/hotclipInfo.vue';
import hotclipCommentsVue from '../components/HotClip/hotclipComments.vue';

export default {
  components:{
    pinClip,
    hotclipCommentsVue,
    hotclipInfoVue,
  },
  data() {
    return {
      loading: false,
      getvidLoading: false,
      vidInfo: null,
      cliplist: [],
      unsubscribe: null,
      m3u8Loading: false,
      mineLoad: false,
      hotClipData:{
        id:'',
        authorId:'',
        author:{},
        createdAt:null,
        title:'',
        clipData: {},
        commentCount:0,
        viewCount:0,
        likeCount:0,
        title:'',
        tags:[],
        dateLabel:'',
        likeUids:[],
        broadcaster:{},
      }
    }
  },
  methods: {
    hello() {
      const storageRef = this.$storage.ref(`clips/${this.hotClipData.clipData.broadcaster_id}/${this.hotClipData.clipData.id}.mp4`);
      storageRef.getDownloadURL().then((url) => {
        document.getElementById(`${this.hotClipData.clipData.id}`).setAttribute('src', url);
      }).catch(() => {});
    },
    async mining() {
      this.mineLoad = true;
      const storageRef = this.$storage.ref(`clips/${this.hotClipData.clipData.broadcaster_id}/${this.hotClipData.clipData.id}.mp4`);
      storageRef.getDownloadURL().then((url) => {
        this.mineLoad = false;
        document.getElementById(`${this.hotClipData.clipData.id}`).setAttribute('src', url);
      }).catch(async () => {
        await axios.post('https://asia-northeast2-twitchhotclip.cloudfunctions.net/clipDownload/clips', {
          broadcaster_id: this.hotClipData.clipData.broadcaster_id,
          id: this.hotClipData.clipData.id,
          title: this.hotClipData.clipData.title,
          created_at: this.hotClipData.clipData.created_at,
          thumbnail_url: this.hotClipData.clipData.thumbnail_url,
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          this.mineLoad = false;
          setTimeout(() => {
            document.getElementById(`${this.hotClipData.clipData.id}`).setAttribute('src', res.data.url);
          }, 0);
          this.$store.commit('SET_SnackBar', { type: 'success', text: ' We only support 480p', value: true });
        }).catch(() => {
          this.$store.commit('SET_SnackBar', { type: 'error', text: 'Not supported', value: true });
        });
      });
    },
    async getm3u8() {
      if (this.vidInfo === null) {
        this.m3u8Loading = true;
        await this.getVidInfo();
        this.m3u8Loading = false;
      }
      if (this.vidInfo.thumbnail_url.split('/')[5] === undefined) { return window.alert("Can't create .m3u8 file") }
      if (this.$store.state.lang === 'ko' && window.confirm(`${this.vidInfo.title}으로 이동하시겠습니까?\r\n Clip timestamp: ${this.setTimeHMSformat(this.hotClipData.clipData.vod_offset)}`)) {
        const vid = document.getElementsByTagName('video')[0];
        vid.pause()
        const m3u8 = 'https://d3vd9lfkzbru3h.cloudfront.net/' + this.vidInfo.thumbnail_url.split('/')[5] + '/chunked/index-dvr.m3u8';
        window.open(m3u8, '_blank');
      }
    },
    updateCommentCount(el){
      this.hotClipData.commentCount += el;
    },
    changeInfo(el){
      this.hotClipData.title = el.title;
      this.hotClipData.tags = el.tags;
      document.title = `${el.title} | Hot Clip - CCTwitch`;
    },
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
    },
    copyClip(el) {
      const tempArea2 = document.createElement('textarea');
      document.getElementsByClassName('copyBody')[0].appendChild(tempArea2);
      tempArea2.value = el.url;
      tempArea2.select();
      document.execCommand('copy');
      document.getElementsByClassName('copyBody')[0].removeChild(tempArea2);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Clip URL : ${el.title} 가 복사되었습니다.`, value: true });
    },
    async getVidInfo() {
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/videos',
          params: {
            id: this.hotClipData.clipData.video_id,
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      await axios(axiosOption).then((res) => {
        this.vidInfo = res.data.data[0];
      }).catch(async (e) => {
        if (e.response.status === 401) {
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getVidInfo();
        }
      })
    },
    async pushToTwitchVids(url, time) {
      if (this.vidInfo === null) {
        this.getvidLoading = true;
        await this.getVidInfo();
        this.getvidLoading = false;
      }
      if (window.confirm(`[${this.$moment(this.vidInfo.created_at).fromNow()}] ${this.vidInfo.title}\n[${time}]으로 이동하시겠습니까?`)) {
        window.open(url, '_blank');
      }
    },
    downloadClip(el) {
      let target = `${el.thumbnail_url.split('-preview')[0]}.mp4`;
      let a = document.createElement('A');
      a.href = target;
      a.download = target.substr(target.lastIndexOf('/') + 1);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    async getBroadcasterInfo(el){
      return await axios.get('https://api.twitch.tv/helix/users', {
        headers: this.$store.state.headerConfig,
        params: { id: el }
      }).then((res) =>{
        return res.data.data[0];
      }).catch(async (e) => {
        if (e.response.status === 401) {
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getBroadcasterInfo(el);
        }
      })
    },
    async getClipInfo(el) {
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/clips',
          params: {
            id: el
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      return await axios(axiosOption).then((res) =>{
        return res.data.data[0];
      }).catch(async (e) => {
        if (e.response.status === 401) {
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getClipInfo(el);
        }
      })
    }
  },
  async created() {
    if(this.unsubscribe) this.unsubscribe()
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
       });
    }

    const sn = await this.$firestore.collection('hotclip').doc(this.$route.params.id);
    await sn.update({viewCount: this.$firebase.firestore.FieldValue.increment(1)});

    await sn.get().then( async (doc) => {

      const item = doc.data();


      document.title = `${item.title} | Hot Clip - CCTwitch`;
      if(doc.exists){
        this.hotClipData.id = doc.id;
        this.hotClipData.authorId = item.authorId,
        this.hotClipData.author = await this.getBroadcasterInfo(item.authorId.split('twitch:')[1]);
        this.hotClipData.clipData = await this.getClipInfo(doc.id);
        this.hotClipData.broadcaster = await this.getBroadcasterInfo(item.broadcaster_id);
        this.hotClipData.commentCount = item.commentCount;
        this.hotClipData.likeCount = item.likeCount;
        this.hotClipData.likeUids = item.likeUids;
        this.hotClipData.viewCount = item.viewCount;
        this.hotClipData.dateLabel = item.dateLabel;
        this.hotClipData.tags = item.tags;
        this.hotClipData.title = item.title;
        this.hotClipData.createdAt = item.createdAt.toDate();
      }

    })

    this.loading = true;
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
  },

}
</script>
<style lang="scss" scoped>
</style>
