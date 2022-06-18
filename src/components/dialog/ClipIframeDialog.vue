<template>
 <v-dialog
  scrollable
  :content-class="$vuetify.breakpoint.smAndDown ? 'iframeTop' : ''"
  v-model="dialog"
  max-width="1080">
  <template v-slot:activator="{ on, attrs }">
    <v-img
    :aspect-ratio="16/9"
    class="rounded-lg clip-thumbnail"
    @click="getVidOffset(clipData)"
    v-bind="attrs"
    v-on="on"
    lazy-src="@/assets/img/404.jpg"
    :src="clipData.thumbnail_url">
      <v-container fluid fill-height class="d-flex align-content-space-between">
        <v-row class="d-flex justify-space-between align-center pl-1">
          <v-spacer></v-spacer>
          <pinClip v-if="$store.state.userinfo.userInfo" name="channelClipPin" :clipData="{data:clipData}" :listData="listData"></pinClip>
          <v-btn v-else color="error" icon @click.stop="$store.commit('SET_SignInDialog',true)"><v-icon>mdi-plus-box-multiple</v-icon></v-btn>
        </v-row>
        <v-row class="d-flex justify-space-between">
          <span class="text-caption white--text ma-2 px-1" style="background-color: rgba( 0, 0, 0, 0.5 )">{{$moment(clipData.created_at).fromNow()}}</span>
          <span class="text-caption white--text ma-2 px-1" style="background-color: rgba( 0, 0, 0, 0.5 )"><v-icon class="white--text px-1" x-small>mdi-eye</v-icon>{{viewerkFormatter(clipData.view_count)}}</span>
        </v-row>
      </v-container>
    </v-img>
  </template>
  <v-card class="pa-0 ma-0 black">
    <v-card-title class="d-block pa-0 ma-0">
      <div class="d-flex justify-end align-center copyBody" v-if="dialog">
        <span class="white--text pl-1">{{$moment(clipData.created_at).format('ll')}}</span>
        <v-spacer></v-spacer>
        <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </v-card-title>
    <v-card-text class="pa-0 ma-0">
      <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndDown ? 1/1 : 4/3" height="100%">
          <iframe
          allow="autoplay"
          v-if="dialog"
          :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=true&preload=auto`"
          preload="auto"
          frameborder="0"
          height="100%"
          width="100%"
          allowfullscreen="true"></iframe>
      </v-responsive>
    </v-card-text>
    <div class="d-flex justify-center align-center pa-0 pb-4 white--text">
      <div class="px-1 mx-1">
        <v-btn dark class="d-flex mx-auto" :disabled="clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.videoOffsetSeconds)}`,clipData.title, setTimeHMSformat(clipData.videoOffsetSeconds))"><v-icon>mdi-twitch</v-icon></v-btn>
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
    </div>
  </v-card>
</v-dialog>
</template>
<script>
import pinClip from '@/components/pinClip.vue';
import axios from 'axios';
import AddNewHotClipDialogVue from './AddNewHotClipDialog.vue';
export default {
  components:{
    pinClip,
    AddNewHotClipDialogVue,
  },
  props:['clipData','listData'],
  data() {
    return {
      dialog:false,
    }
  },
  methods: {
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
    pushToTwitchVids(url, title, time) {
      if (window.confirm(`${title}[${time}]으로 이동하시겠습니까?`)) {
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
    async getVidOffset(element){
      if(!element.video_id){
        return this.dialog = true;
      }
      const json = JSON.stringify(
        {
          operationName: "ClipsFullVideoButton",
          variables: {
            slug: element.id
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash: "d519a5a70419d97a3523be18fe6be81eeb93429e0a41c3baa9441fc3b1dffebf"
              }
          }
        })
      await axios.post('https://gql.twitch.tv/gql',json, {
        headers: {
          'Client-id' : 'kimne78kx3ncx6brgo4mv6wki5h1ko'
        },

      }).then((res) => {
          element.videoOffsetSeconds = res.data.data.clip.videoOffsetSeconds;
          this.dialog = true;
      })
      }
  },
  computed:{
  },
  mounted(){
  }
}
</script>
<style lang="scss" scoped>
.clip-thumbnail{
  cursor: pointer;
}
</style>
