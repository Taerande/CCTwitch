<template>
 <v-dialog
  content-class="clipIframe"
  v-model="dialog"
  height="720"
  max-width="1280">
  <template v-slot:activator="{ on, attrs }">
    <v-img
    :aspect-ratio="16/9"
    max-width="300"
    id="clip-thumbnail"
    @click="dialog = true"
    v-bind="attrs"
    v-on="on"
    lazy-src="@/assets/img/404.jpg"
    :src="clipData.thumbnail_url">
      <v-container fluid fill-height class="d-flex align-content-space-between">
        <v-row class="d-flex justify-space-between align-center pl-1" style="background-color: rgba( 0, 0, 0, 0.5 )">
          <v-avatar size="25">
            <v-img :src="$attrs.userProfileImg" lazy-src="@/assets/img/404.jpg" alt="profile_img"></v-img>
          </v-avatar>
          <span style="max-width: 150px;" class="white--text text-body-2 text-truncate">{{clipData.title}}</span>
          <pinClip name="channelClipPin" :clipData="{data:clipData}"></pinClip>
        </v-row>
        <v-row class="d-flex justify-space-between">
          <span class="text-caption white--text ma-2 px-1" style="background-color: rgba( 0, 0, 0, 0.5 )">{{setDate(clipData.created_at)}}</span>
          <span class="text-caption white--text ma-2 px-1" style="background-color: rgba( 0, 0, 0, 0.5 )"><v-icon class="white--text px-1" x-small>mdi-eye</v-icon>{{viewerkFormatter(clipData.view_count)}}</span>
        </v-row>
      </v-container>
    </v-img>
  </template>
    <div class="black d-flex justify-end">
      <v-btn :disabled="clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.videoOffsetSeconds)}`,clipData.title, setTimeHMSformat(clipData.videoOffsetSeconds))"><v-icon>mdi-twitch</v-icon></v-btn>
      <pinClip name="channelClipPin" :clipData="{data:clipData}"></pinClip>
      <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
    </div>
      <iframe
      id="clipIframe"
      @keydown.esc="dialog = false"
      v-if="dialog"
      class="black d-flex align-center"
      :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=false&muted=false&preload=auto`"
      preload="auto"
      frameborder="0"
      :height="$vuetify.breakpoint.smAndUp ? 720 : 300"
      width="100%"
      allowfullscreen="true"></iframe>
</v-dialog>
</template>
<script>
import pinClip from '@/components/pinClip.vue';
import axios from 'axios';
export default {
  components:{
    pinClip,
  },
  props:['clipData'],
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
    pushToTwitchVids(url, title, time) {
      // const iframe = document.querySelector('iframe');
      // iframe.contentWindow.document.querySelector('video').pause();
      if (window.confirm(`${title}[${time}]으로 이동하시겠습니까?`)) {
        window.open(url, '_blank');
      }
    },
    setDate(el) {
      // const time = new Date(el).getTime();
      // const krTime = time + 9 * 60 * 60 * 1000;
      // const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      // return dateFormatted;
      const c = this.$moment(el).fromNow();

      return c;
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
      }
  },
  mounted(){
    if(this.clipData.video_id){
      this.getVidOffset(this.clipData);
    }
  }
}
</script>
<style lang="scss" scoped>
#clip-thumbnail{
  cursor: pointer;
}
</style>
