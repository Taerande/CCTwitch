<template>
<v-dialog
  content-class="clipIframe"
  max-width="1280"
  v-model="dialog">
  <template v-slot:activator="{ on }" class="d-flex">
    <v-img
    class="pa-0"
    v-on="on"
    height="100%"
    :max-width="imgWidth"
    lazy-src="@/assets/img/404.jpg"
    :src="clipData.thumbnail_url"></v-img>
    <div v-on="on" class="pl-1">
      <span>{{clipData.title}}</span>
      <span>{{clipData.created_at}}</span>
      <span>{{clipData.view_count}}</span>
    </div>
  </template>
  <div class="black d-flex justify-end">
     <v-btn dark :disabled="clipData.video_id.length === 0" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.videoOffsetSeconds)}`,clipData.title, setTimeHMSformat(clipData.videoOffsetSeconds))"><v-icon>mdi-twitch</v-icon></v-btn>
    <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
  </div>
  <iframe
    class="black d-flex align-center"
    v-if="dialog"
    :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=true`"
    preload="auto"
    frameborder="0"
    :height="$vuetify.breakpoint.smAndUp ? 720 : 400"
    width="1280"
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
        return '250';
      } else if(this.$vuetify.breakpoint.smAndUp) {
        return '200';
      } else if (this.$vuetify.breakpoint.mobile) {
        return '100';
      } else {
        return '250';
      }
    }
  },

  mounted(){
    if(this.clipData.video_id){
      this.getVidOffset(this.clipData);
    };
    console.log(this.$vuetify.breakpoint);

  }
}
</script>
<style lang="scss" scoped>
#clip-thumbnail{
  cursor: pointer;
}
</style>
