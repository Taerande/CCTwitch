<template>
<v-container fluid>
  <v-row class="pt-5">
    <v-divider></v-divider>
  </v-row>
  <v-row
  class="pa-1 justify-space-between align-baseline"
  v-if="this.cliplist.length > 0">
    <v-row class="col-12 pa-1 d-flex justify-space-between align-baseline">
      <div class="d-flex align-baseline">
      <h1>Clips</h1>
      </div>
    </v-row>
    <v-row class="d-flex col-12" v-for="(chunk, index) in cliplistChunk" :key="index">
      <v-col
      style="min-width:250px;"
        cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2"
        v-for="(item,startIndex) in chunk.slice(0,index%7+4)"
        :key="item.id+startIndex"
        >
        <v-card class="ma-0 pa-0" flat style="width:inherit">
          <v-card-text class="d-flex justify-center pa-0 ma-0">
            <clipIframeDialog :clipData="item" :listData="listData"></clipIframeDialog>
          </v-card-text>
        </v-card>
        <div class="d-flex justify-center pt-2" style="width:inherit">{{item.title}}</div>
      </v-col>
      <v-col
        v-if="chunk.length > index%7+4"
        style="min-width:250px;"
        class="pa-0 ma-0"
        cols="12" xl="3" lg="4" md="4" sm="6">
         <InArticleAdsense
          data-ad-client="ca-pub-8597405222136575"
          data-ad-slot="9638127425"
          data-ad-format="fluid"
          ins-style="display:inline-block;width:100%;"
          ></InArticleAdsense>
      </v-col>
      <v-col
        style="min-width:250px;"
        cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2"
        v-for="(item,endIndex) in chunk.slice(index%7+4)"
        :key="item.id+endIndex+index%7+4"
        >
        <v-card class="ma-0 pa-0" elevation="0">
        <v-card-text class="d-flex justify-center pa-0 ma-0">
            <clipIframeDialog :clipData="item" :listData="listData"></clipIframeDialog>
          </v-card-text>
        </v-card>
        <div class="d-flex justify-center pt-2" style="width:inherit">{{item.title}}</div>
      </v-col>
    </v-row>
  </v-row>
  <infinite-loading @infinite="channelInfiniteHandler" spinner="spiral"></infinite-loading>
</v-container>
</template>
<script>
import axios from 'axios';
import infiniteLoading from 'vue-infinite-loading';
import clipIframeDialog from '@/components/dialog/ClipIframeDialog';
import chunk from 'lodash/chunk';

export default {
  props: ['clips','listData'],
  components: {
    clipIframeDialog,
    infiniteLoading,
  },
  data() {
    return {
      limit: 0,
      cliplist: [],
      pinned: false,
      overlay: false,
      currentId: '',
      dialog: false,
      paginationCursor: '',
      infiniteData: {
        data:{},
      },
      userInfo: '',
    };
  },
  computed:{
    cliplistChunk(){
      return chunk(Object.values(this.cliplist),11);
    }
  },
  methods: {
    async channelInfiniteHandler($state) {
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/clips',
          params: {
            broadcaster_id: this.infiniteData.broadcaster_id,
            started_at: this.infiniteData.started_at,
            first: this.infiniteData.first,
            after: this.paginationCursor,
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      await axios(axiosOption).then((res) => {
        this.paginationCursor = res.data.pagination.cursor;
        if (res.data.data.length === 0) {
          $state.complete();
        } else if (res.data.pagination.cursor === undefined && res.data.data.length > 0) {
          res.data.data.map((el) => {
            if (el.video_id === this.infiniteData.video_id) {
              this.cliplist.push(el);
            } else if( this.$moment(el.created_at).isBefore(this.infiniteData.broadcast_end) && el.video_id === ''){
              this.cliplist.push(el);
            }
          });
          $state.complete();
        } else {
          res.data.data.map((el) => {
            if (el.video_id === this.infiniteData.video_id) {
              this.cliplist.push(el);
            } else if( this.$moment(el.created_at).isBefore(this.infiniteData.broadcast_end) && el.video_id === ''){
              this.cliplist.push(el);
            }
          });
          $state.loaded();
        }
      }).catch(async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.channelInfiniteHandler($state);
        }
      });
    },
     hmsToSec(el){
       if(el.includes('h')){
         const hour = el.split('h')[0];
         const min = el.split('h')[1].split('m')[0];
         const sec = el.split('s')[1];
         return hour*3600 + min*60 + sec;
       } else if(el.includes('m')){
         const min = el.split('m')[0];
         const sec = el.split('s')[1];
         return min*60 + sec;
       } else {
         const sec = el.split('s')[0];
         return sec;
       }
    }
  },
  mounted() {
    this.infiniteData = {
      broadcast_end: this.$moment(this.clips.data.created_at).add(this.hmsToSec(this.clips.data.duration),'seconds').toISOString(),
      broadcaster_id: this.clips.data.user_id,
      started_at: this.clips.data.created_at,
      first: 24,
      video_id: this.clips.data.id,
      viewalbe: this.clips.data.viewalbe,
    };
  },
};
</script>
<style lang="scss" scoped>
</style>
