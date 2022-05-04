<template>
<v-dialog
  content-class="clipIframe"
  max-width="1280"
  v-model="dialog">
  <template v-slot:activator="{ on }">
    <td
    class="ma-2 canSort table-thumbnail"
    v-on="on"
    >
      <v-img
      class="mx-auto"
      max-width="100"
      lazy-src="@/assets/img/404.jpg"
      :src="clipData.thumbnail_url"></v-img>
    </td>
  </template>
  <div class="black d-flex justify-end">
     <v-btn dark :disabled="clipData.video_id.length === 0" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.videoOffsetSeconds)}`,clipData.title, setTimeHMSformat(clipData.videoOffsetSeconds))"><v-icon>mdi-twitch</v-icon></v-btn>
    <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
  </div>
  <iframe
    class="black d-flex align-center"
    v-if="dialog"
    :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=false`"
    preload="auto"
    frameborder="0"
    height="720"
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
