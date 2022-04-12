<template>
<v-container fluid fill-height class="py-10">
  <div>최근 방송을 선택해주세요.</div>
  <v-row>
    <v-col v-for="item in $store.state.likedStreamer" :key="item.id">
      <SelectVideo @changeVid="changeVid" :data="item"></SelectVideo>
    </v-col>
  </v-row>
  <v-row class="d-flex align-center justify-start">
    <v-divider></v-divider>
    <v-subheader class="text-center text-h4 mx-4">or</v-subheader>
    <v-divider></v-divider>
  </v-row>
  <v-row>
    <v-col>
      <v-text-field
      v-model="vidId"
      ></v-text-field>
      <div>{{vidId}}</div>
      <v-btn color="success" @click="getVidInfo(vidId)">getVidInfo</v-btn>
    </v-col>
  </v-row>
  <v-row v-if="vidInfo.id" class="d-flex" full-width>
    <v-img
    lazy-src="@/assets/img/404.jpg"
    :src="setThumbnailSize(vidInfo.thumbnail_url)">
    </v-img>
  </v-row>
  <v-row class="d-block success" full-width>
    <div></div>
  </v-row>
  <v-row class="d-flex align-end justify-start">
      <v-card v-for="(item,idx) in clipList" :key="idx" tile flat class="error"  :width="widthdData(item)" :height="heightData(item)" style="position:absolute;" :style="{left:relativePosition(item.videoOffsetSeconds)}" @mouseleave="clipIframe = ''" @mouseover="clipIframe = item.id">
      </v-card>
        <!-- <clipIframeDialog v-if="clipIframe" :clipData="item"></clipIframeDialog> -->
      <!-- <v-img max-width="100" :src="item.thumbnail_url"></v-img>
      <div>width   <div>{{item.title}}</div>
        <div><v-icon small>mdi-eye</v-icon>{{item.view_count}}</div>
      </div> -->
  </v-row>
  <v-row v-if="vidInfo.id" class="d-block">
    <div class="success d-flex justify-space-between">
      <span>00:00:00</span>
      <span>{{vidInfo.duration}}</span>
    </div>
    <div class="success text-center">{{vidInfo.title}}</div>
  </v-row>
  <v-row>
    <v-sparkline
    v-if="clipList.length === clipListVidOffsetArr.length"
    line-width="0.3"
    :value="clipListVidOffsetArr"
    auto-draw></v-sparkline>
  </v-row>
  <v-row>{{this.clipList.length}}</v-row>
  <v-row v-for="(item,index) in clipList" :key="index">
    {{item.id}} // {{item.view_count}}
  </v-row>
</v-container>
</template>
<script>
import axios from 'axios'
import clipIframeDialog from '@/components/dialog/ClipIframeDialog';
import SelectVideo from '@/components/dialog/SelectVideo';


export default {
  components:{
    // clipIframeDialog,
    SelectVideo,
  },
  data() {
    return {
      loading:true,
      clipIframe:'',
      clipId: '',
      vidId:'',
      vidInfo:{},
      clipList:[],
      paginationCursor: '',
      clipListVidOffsetArr:[],
    }
  },
  methods: {
    changeVid(el){
      console.log('here');
      this.clipList = [];
      this.clipListVidOffsetArr = [];
      this.paginationCursor = '';
      this.vidInfo = el;
      this.vidId = el.id;
      console.log(this.clipList.length, this.clipListVidOffsetArr.length);
      this.getClipInVid(this.vidInfo);
    },
    getDurationTime(el) {
      const regex = /h|m|s/;
      const duration = el.split(regex);
      if (duration.length === 4) {
        return duration[0]*60*60+duration[1]*60+duration[2]*1;
      }
      if (duration.length === 3) {
        return duration[0]*60+duration[1];
      }
      return duration[0];
    },
    relativePosition(el){
      return `${(el/this.getDurationTime(this.vidInfo.duration)) * 100 - 1 }%`;
    },
    setThumbnailSize(el) {
      const width = /%{width}/;
      const height = /%{height}/;
      return el.replace(width, '1280').replace(height, '720');
    },
    heightData(item){
      // const depth = Math.log2(item.view_count)+5;
      const depth = (item.view_count)/100;
      return `${depth}%`
    },
    widthdData(item){
      const depth =  (item.duration)/30;
      return `${depth}%`
    },
    getVidInfo(vidId){
      this.clipList = [];
      this.clipListVidOffsetArr = [];
      this.paginationCursor = '';
      axios.get('https://api.twitch.tv/helix/videos',{
        headers: this.$store.state.headerConfig,
        params:{
          id: vidId,
        }
      }).then(
        async(res) =>{
          this.vidInfo = res.data.data[0];
          await this.getClipInVid(this.vidInfo);
        }).catch(() =>
        this.$store.commit('SET_SnackBar',{type:'error', text:'비디오 정보를 가져올 수 없습니다.', value:true}));

    },
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 7 * 24 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    async getClipInVid(vidInfo){
      await axios.get('https://api.twitch.tv/helix/clips',{
        headers: this.$store.state.headerConfig,
        params:{
          broadcaster_id: vidInfo.user_id,
          started_at: vidInfo.created_at,
          ended_at: this.getEndDate(vidInfo.created_at),
          first: 100,
          after: this.paginationCursor,
        },
      }).then( async (res) => {
        this.paginationCursor = res.data.pagination.cursor;
        if(res.data.data){
          await res.data.data.forEach(element => {
            if(element.video_id === vidInfo.id && this.clipListVidOffsetArr.length < 100)
            {
              this.getVidOffset(element);
            }
          });
        }
      }).then( async () => {
        if(this.clipList.length < 100 && this.paginationCursor !== undefined){
          await this.getClipInVid(this.vidInfo);
        } else {
          await this.clipList.forEach(element => {
            this.clipListVidOffsetArr.push(element.view_count);
          });
          this.$store.commit('SET_SnackBar',{type:'info', text:'클립을 모두 가져왔습니다.', value:true});
        }
      })
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
      if(this.clipList.length < 100){
          element.videoOffsetSeconds = res.data.data.clip.videoOffsetSeconds;
          this.clipList.push(element);
          this.clipList.sort((a,b) => a.videoOffsetSeconds - b.videoOffsetSeconds);
        }
      })
      }
    },
    computed:{
    }
}
</script>
<style lang="scss">

</style>
