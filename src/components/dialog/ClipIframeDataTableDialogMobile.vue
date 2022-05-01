<template>
<v-dialog
  content-class="clipIframe"
  max-width="1280"
  v-model="dialog">
  <template v-slot:activator="{ on }">
   <v-row class="d-flex align-center justify-start">
      <v-col class="d-flex overflow-x-hidden">
        <v-img
          v-on="on"
          class="clip-thumbnail"
          max-width="160"
          :src="clipData.thumbnail_url || '@/assets/img/404.jpg'"
          lazy-src="@/assets/img/404.jpg">
          <span class="duration grey darken-4 pa-1 text-caption text-weight-bold align-center">{{clipData.duration}}</span>
          </v-img>
          <div class="pl-2" style="width:20rem;">
            <div class="text-truncate">{{clipData.title}}</div>
            <div class="text-truncate">{{clipData.broadcaster_name}}</div>
            <div class="text-caption d-flex align-center"><v-icon class="pr-1" x-small>mdi-eye</v-icon> {{viewerkFormatter(clipData.view_count)}}</div>
            <div class="text-caption">{{setDate(clipData.created_at)}}</div>
          </div>
      </v-col>
    </v-row>
  </template>
  <div class="black d-flex justify-end">
     <v-btn :disabled="clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://m.twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.videoOffsetSeconds)}`,clipData.title, setTimeHMSformat(clipData.videoOffsetSeconds))"><v-icon>mdi-twitch</v-icon></v-btn>
    <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
  </div>
  <iframe
    id="clipIframe"
    class="black d-flex align-center"
    v-if="dialog"
    :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=false`"
    preload="auto"
    frameborder="0"
    height="300"
    width="100%"
    allowfullscreen="true"></iframe>
</v-dialog>
</template>
<script>
import axios from 'axios';
export default {
  props:['clipData'],
  data() {
    return {
      dialog:false,
    }
  },
  methods: {
    setDate(el){
      return this.$moment(el).fromNow();
    },
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
    },
    pushToTwitchVids(url, title,time) {
      if (window.confirm(`${title}[${time}]으로 이동하시겠습니까?`)) {
        window.open(url, '_blank');
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
.clip-thumbnail{
  cursor: pointer;
}
.duration{
  position: inherit;
  top: 50%;
  left: 50%;
}
</style>
