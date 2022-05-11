<template>
<v-dialog
  content-class="clipIframe"
  max-width="1280"
  v-model="dialog">
  <template v-slot:activator="{ on }" class="d-flex">
    <v-card @mouseenter="hovering = true" @mouseleave="hovering = false" max-height="100" class="d-flex" flat>
      <v-card-title class="justify-center ma-0 pa-0 mx-auto" style="width:3rem;">
        <span v-if="$store.state.userinfo.userInfo && $store.state.userinfo.userInfo.uid === clipListData.authorId" class="handle"> <v-icon>mdi-drag-horizontal-variant</v-icon></span>
        <span v-else class="text-caption font-weight-bold">{{index+1}}</span>
      </v-card-title>
      <v-card-text class="d-flex align-center ma-0 pa-0">
        <v-img
        v-on="on"
        class="pa-0 thumbnailImg ma-0 rounded-lg"
        @click="getVidOffset(clipData)"
        height="100%"
        :max-width="imgWidth"
        lazy-src="@/assets/img/404.jpg"
        :src="clipData.thumbnail_url">
        <div v-if="hovering" class="d-flex justify-center hoveringImg" style="height:100%;">
          <v-icon size="50" color="white">mdi-play</v-icon>
        </div>
        </v-img>
        <div class="pl-4 d-flex">
          <div class="d-flex flex-column">
            <div class="text-truncate" style="width:10rem;">{{clipData.title}}</div>
            <div class="d-flex">
              <span>{{$moment(clipData.created_at).format('ll')}}</span>
              <span class="d-flex px-3 align-center"><v-icon small class="pr-1">mdi-eye</v-icon>{{clipData.view_count}}</span>
            </div>
            <div class="pa-3 twitch--text">
              <router-link class="d-flex" :to="{name: 'Channel', query:{
              id: clipData.broadcaster_id}}">
              <div>{{clipData.broadcaster_name}}</div>
              </router-link>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <clipMenuVue :clip="{clipData:clipData, listData:clipListData}" :listData="listData"></clipMenuVue>
      </v-card-actions>
    </v-card>
  </template>
  <div class="black d-flex justify-end">
    <span class="white--text pl-5">{{this.$moment(clipData.created_at).format('ll')}}</span>
    <v-spacer></v-spacer>
    <pinClip :clipData="{data:clipData}" :listData="listData"></pinClip>
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
        return '125';
      } else {
        return '100';
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
  background: rgba(0,0,0,0.2);
}
.handle{
  cursor: grab;
}
</style>
