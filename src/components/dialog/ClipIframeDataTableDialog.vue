<template>
<v-dialog
  v-if="clipData.id !== undefined"
  scrollable
  :content-class="$vuetify.breakpoint.smAndDown ? 'iframeTop' : ''"
  max-width="1080"
  v-model="dialog">
  <template v-slot:activator="{ on }" class="d-flex">
    <v-card @mouseenter="hovering = true" @mouseleave="hovering = false" class="d-flex ma-0 pa-0"
    flat>
      <v-card-title class="justify-center ma-0 pa-0" style="width:3rem;">
        <span class="handle" v-if="$store.state.userinfo.userInfo && $store.state.userinfo.userInfo.uid === clipListData.authorId && hovering"> <v-icon>mdi-drag-horizontal-variant</v-icon></span>
        <span v-else class="text-caption font-weight-bold">{{index+1}}</span>
      </v-card-title>
      <v-card-text class="d-flex align-center ma-0 pa-0 text-truncate">
        <v-img
        :max-width="imgWidth"
        :aspect-ratio="16/9"
        v-on="on"
        @error="onImgError"
        :title="clipData.title"
        :src="srcImg"
        class="pa-0 thumbnailImg ma-0 rounded-lg"
        lazy-src="@/assets/img/404.jpg">
          <v-container fluid fill-height class="d-flex align-content-space-between flex-wrap">
            <v-row class="d-flex justify-start pa-1">
              <span class="rounded-md text-caption white--text mx-1 px-1 rounded-lg" style="background-color: rgba( 0, 0, 0, 0.5 )">{{$moment(clipData.created_at).fromNow()}}</span>
            </v-row>
            <v-row class="d-flex justify-end pa-1">
              <span class="text-caption white--text px-1 mx-1 rounded-lg" style="background-color: rgba( 0, 0, 0, 0.5 )"><v-icon class="white--text pr-1" x-small>mdi-eye</v-icon>{{clipData.view_count | commaCase}}</span>
            </v-row>
          </v-container>
          <div v-if="hovering" class="d-flex justify-center hoveringImg">
            <v-icon size="60" color="white">mdi-play</v-icon>
          </div>
        </v-img>
        <div class="pl-2 text-truncate">
          <div class="text-truncate">{{clipData.title}}</div>
          <div class="d-flex twitch--text">
            <router-link class="d-flex" :to="{name: 'Channel', query:{
            id: clipData.broadcaster_id}}">
            <div>{{clipData.broadcaster_name}}</div>
            </router-link>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="ma-0 pa-0">
        <clipMenuVue :clip="{clipData:clipData, listData:clipListData}" :listData="listData"></clipMenuVue>
      </v-card-actions>
    </v-card>
  </template>
  <v-card class="pa-0 ma-0 black">
    <v-card-title class="d-block pa-0 ma-0">
      <div class="d-flex justify-end align-center copyBody" v-if="dialog">
        <span class="white--text pl-1">{{this.$moment(clipData.created_at).format('ll')}}</span>
        <v-spacer></v-spacer>
        <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </v-card-title>
    <v-card-text class="pa-0 ma-0 d-flex justify-center" v-if="dialog">
        <video
        v-if="$store.state.lang === 'ko'"
            :id="`${clipData.id}`"
            width="100%"
            controls
            :onerror="hello()"
            :src="`${clipData.thumbnail_url.split('-preview')[0]}.mp4`"
            >
          </video>
        <v-responsive v-else :aspect-ratio="$vuetify.breakpoint.smAndDown ? 1/1 : 4/3" height="100%">

        <iframe
          allow="autoplay"
          :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=true&preload=auto`"
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
        <v-btn dark :loading="getvidLoading" class="d-flex mx-auto" :disabled="clipData.video_id === undefined || clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.vod_offset)}`,setTimeHMSformat(clipData.vod_offset))"><v-icon>mdi-twitch</v-icon></v-btn>
        <div class="text-caption">다시보기</div>
      </div>
      <div class="px-1 mx-1">
        <v-btn class="d-flex mx-auto" color="error" icon @click="copyClip(clipData)">
          <v-icon>mdi-clipboard-multiple-outline</v-icon>
        </v-btn>
        <div class="text-caption">URL 복사</div>
      </div>
      <div class="px-1 mx-1">
        <v-btn class="d-flex mx-auto" color="error" icon @click="downloadClip(clipData)">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <div class="text-caption">다운로드</div>
      </div>
      <div class="px-1 mx-1">
        <pinClip class="d-flex mx-auto" v-if="$store.state.userinfo.userInfo" name="channelClipPin" :clipData="{data:clipData}" :listData="listData"></pinClip>
        <v-btn class="d-flex mx-auto" v-else color="error" icon @click.stop="$store.commit('SET_SignInDialog',true)"><v-icon>mdi-plus-box-multiple</v-icon>
        </v-btn>
        <div class="text-caption">추가하기</div>
      </div>
      <AddNewHotClipDialogVue :clipData="clipData"></AddNewHotClipDialogVue>
      <div class="px-1 mx-" v-if="$store.state.lang === 'ko'">
        <v-btn :loading="m3u8Loading" dark class="d-flex mx-auto" :disabled="clipData.video_id === ''" color="error" icon
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
</v-dialog>
</template>
<script>
import axios from 'axios';
import pinClip from '@/components/pinClip.vue';
import clipMenuVue from '@/components/cliplist/clipMenu.vue';
import AddNewHotClipDialogVue from './AddNewHotClipDialog.vue';
export default {
  props:['clipData','listData','clipListData','index'],
  components:{
    pinClip,
    clipMenuVue,
    AddNewHotClipDialogVue,
  },
  data() {
    return {
      hovering: false,
      getvidLoading: false,
      dialog:false,
      vidInfo:null,
      m3u8Loading: false,
      mineLoad: false,
      imgSrc: true,
      failedImg: null,
    }
  },
  computed: {
    srcImg() {
      return !this.imgSrc ? this.failedImg : this.clipData.thumbnail_url;
    },
    imgWidth() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return '200';
      } else if (this.$vuetify.breakpoint.md) {
        return '175';
      } else if (this.$vuetify.breakpoint.sm) {
        return '150';
      } else if (this.$vuetify.breakpoint.xs) {
        return '100';
      } else {
        return '100';
      }
    },
  },
  methods: {
    hello() {
      const storageRef = this.$storage.ref(`clips/${this.clipData.broadcaster_id}/${this.clipData.id}.mp4`);
      storageRef.getDownloadURL().then((url) => {
        document.getElementById(`${this.clipData.id}`).setAttribute('src', url);
      }).catch(() => { });
    },
    async onImgError() {
      const storageRef = this.$storage.ref(`thumbnails/${this.clipData.broadcaster_id}/${this.clipData.id}.jpg`);
      await storageRef.getDownloadURL().then((url) => {
        this.failedImg = url
        this.imgSrc = false;
      }).catch(() => { });
    },
    async mining() {
      this.mineLoad = true;
      const storageRef = this.$storage.ref(`clips/${this.clipData.broadcaster_id}/${this.clipData.id}.mp4`);
      storageRef.getDownloadURL().then((url) => {
        this.mineLoad = false;
        document.getElementById(`${this.clipData.id}`).setAttribute('src', url);
      }).catch(async () => {
        await axios.post('https://asia-northeast2-twitchhotclip.cloudfunctions.net/clipDownload/clips', {
          broadcaster_id: this.clipData.broadcaster_id,
          id: this.clipData.id,
          title: this.clipData.title,
          created_at: this.clipData.created_at,
          thumbnail_url: this.clipData.thumbnail_url,
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          this.mineLoad = false;
          this.imgSrc = false;
          document.getElementById(`${this.clipData.id}`).setAttribute('src', res.data.url);
          this.failedImg = res.data.thumb;
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
      if (this.$store.state.lang === 'ko' && window.confirm(`${this.vidInfo.title}으로 이동하시겠습니까?\r\n Clip timestamp: ${this.setTimeHMSformat(this.clipData.vod_offset)}`)) {
        const vid = document.getElementsByTagName('video')[0];
        vid.pause()
        const m3u8 = 'https://d3vd9lfkzbru3h.cloudfront.net/' + this.vidInfo.thumbnail_url.split('/')[5] + '/chunked/index-dvr.m3u8';
        window.open(m3u8, '_blank');
      }
    },
    async getVidInfo() {
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/videos',
          params: {
            id: this.clipData.video_id,
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
    copyClip(el) {
      const tempArea2 = document.createElement('textarea');
      document.getElementsByClassName('copyBody')[0].appendChild(tempArea2);
      tempArea2.value = el.url;
      tempArea2.select();
      document.execCommand('copy');
      document.getElementsByClassName('copyBody')[0].removeChild(tempArea2);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Clip URL : ${el.title} 가 복사되었습니다.`, value: true });
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
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
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
  },
}
</script>
<style lang="scss" scoped>
.thumbnailImg{
  cursor: pointer;
}
.hoveringImg{
  position: absolute;
  z-index: 3;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.2);
}
.handle{
  cursor: grab;
}
</style>
