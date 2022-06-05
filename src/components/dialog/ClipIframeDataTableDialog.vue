<template>
<v-dialog
  scrollable
  :content-class="$vuetify.breakpoint.smAndDown ? 'iframeTop' : ''"
  max-width="1080"
  v-model="dialog">
  <template v-slot:activator="{ on }" class="d-flex">
    <v-card @mouseenter="hovering = true" @mouseleave="hovering = false" class="d-flex ma-0 pa-0" flat>
      <v-card-title class="justify-center ma-0 pa-0" style="width:3rem;">
        <span class="handle" v-if="$store.state.userinfo.userInfo && $store.state.userinfo.userInfo.uid === clipListData.authorId && hovering"> <v-icon>mdi-drag-horizontal-variant</v-icon></span>
        <span v-else class="text-caption font-weight-bold">{{index+1}}</span>
      </v-card-title>
      <v-card-text class="d-flex align-center ma-0 pa-0 text-truncate">
        <v-img
        :max-width="imgWidth"
        :aspect-ratio="16/9"
        v-on="on"
        class="pa-0 thumbnailImg ma-0 rounded-lg"
        @click="getVidOffset(clipData)"
        lazy-src="@/assets/img/404.jpg"
        :src="clipData.thumbnail_url">
          <v-container fluid fill-height class="d-flex align-content-space-between flex-wrap">
            <v-row class="d-flex justify-start pa-1">
              <span class="rounded-md text-caption white--text mx-1 px-1 rounded-lg" style="background-color: rgba( 0, 0, 0, 0.5 )">{{$moment(clipData.created_at).fromNow()}}</span>
            </v-row>
            <v-row class="d-flex justify-end pa-1">
              <span class="text-caption white--text px-1 mx-1 rounded-lg" style="background-color: rgba( 0, 0, 0, 0.5 )"><v-icon class="white--text pr-1" x-small>mdi-eye</v-icon>{{viewerkFormatter(clipData.view_count)}}</span>
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
    <v-card-title class="d-block pa-0 ma-0 copyBody">
      <div class="d-flex justify-end align-center">
        <span class="white--text pl-2">{{this.$moment(clipData.created_at).format('ll')}}</span>
        <v-spacer></v-spacer>
        <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </v-card-title>
    <v-card-text class="pa-0 ma-0">
    <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndDown ? 1/1 : 4/3" height="100%">
      <iframe
        v-if="dialog"
        :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=false&muted=false&preload=auto`"
        preload="auto"
        frameborder="0"
        height="100%"
        width="100%"
        allowfullscreen="true"></iframe>
    </v-responsive>
    </v-card-text>
     <div class="d-flex justify-center align-center pa-2">
      <div class="px-1 mx-1">
        <v-btn class="d-flex mx-auto" :disabled="clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.videoOffsetSeconds)}`,clipData.title, setTimeHMSformat(clipData.videoOffsetSeconds))"><v-icon>mdi-twitch</v-icon></v-btn>
        <div>다시보기</div>
      </div>
      <div class="px-1 mx-1">
        <v-btn class="d-flex mx-auto" color="error" icon @click="copyClip(clipData)">
          <v-icon>mdi-clipboard-multiple-outline</v-icon>
        </v-btn>
        <div>URL 복사</div>
      </div>
      <div class="px-1 mx-1">
        <v-btn class="d-flex mx-auto" color="error" icon @click="downloadClip(clipData)">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <div>다운로드</div>
      </div>
      <div class="px-1 mx-1">
        <pinClip class="d-flex mx-auto" v-if="$store.state.userinfo.userInfo" name="channelClipPin" :clipData="{data:clipData}" :listData="listData"></pinClip>
        <v-btn class="d-flex mx-auto" v-else color="error" icon @click.stop="$store.commit('SET_SignInDialog',true)"><v-icon>mdi-plus-box-multiple</v-icon>
        </v-btn>
        <div>추가하기</div>
      </div>
    </div>
  </v-card>
</v-dialog>
</template>
<script>
import axios from 'axios';
import pinClip from '@/components/pinClip.vue';
import clipMenuVue from '@/components/cliplist/clipMenu.vue';
export default {
  props:['clipData','listData','clipListData','index'],
  components:{
    pinClip,
    clipMenuVue,
  },
  data() {
    return {
      hovering: false,
      dialog:false,
    }
  },
  methods: {
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
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
    },
    pushToTwitchVids(url, title, time) {
      if (window.confirm(`${title}[${time}] 영상으로 이동하시겠습니까?`)) {
        window.open(url, '_blank');
      }
    },
    async getVidOffset(element){
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
      })
    },
  },
  computed:{
    imgWidth(){
      if(this.$vuetify.breakpoint.lgAndUp){
        return '200';
      } else if(this.$vuetify.breakpoint.md) {
        return '175';
      } else if(this.$vuetify.breakpoint.sm) {
        return '150';
      } else if (this.$vuetify.breakpoint.xs) {
        return '100';
      } else {
        return '100';
      }
    },
    imgHeight(){
      if(this.$vuetify.breakpoint.lgAndUp){
        return '112.5';
      } else if(this.$vuetify.breakpoint.md) {
        return '98.5';
      } else if(this.$vuetify.breakpoint.sm) {
        return '84';
      } else if (this.$vuetify.breakpoint.xs) {
        return '56';
      } else {
        return '56';
      }
    },
    titleWidth(){
      if(this.$vuetify.breakpoint.xs) {
        return '11rem';
      } else if (this.$vuetify.breakpoint.sm) {
        return '18rem';
      } else if (this.$vuetify.breakpoint.md) {
        return '25rem';
      } else {
        return ''
      }
    }
  },

  mounted(){
  }
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
