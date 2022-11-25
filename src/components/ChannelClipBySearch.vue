<template>
<v-container fluid>
  <v-row class="pt-5">
    <v-divider></v-divider>
  </v-row>
  <v-row class="col-12 pa-1 d-flex align-baseline">
    <div class="d-flex align-center">
      <h1 class="pr-2">Keyword : </h1>
    </div>
    <v-chip small text-color="white" class="mx-1" v-for="(item, idx) in $store.state.searchKeywords" :key="item" :color="color[idx]">
      {{item}}
    </v-chip>
  </v-row>
  <v-row
  class="d-flex pa-1 align-baseline col-12"
  v-if="this.cliplist.length > 0">
    <v-row class="d-flex pa-0 col-12" v-for="(chunk, index) in cliplistChunk" :key="index"
    >
    <v-col
      style="min-width:250px;"
      v-for="(item,startIndex) in chunk.slice(0,index%7+4)"
      :key="item.id+startIndex"
      cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2"
      >
       <v-card class="ma-0 pa-0 pb-3" style="width:inherit" flat>
        <v-card-text class="d-flex justify-center pa-0 ma-0">
          <clipIframeDialog :clipData="item" :listData="listData"></clipIframeDialog>
        </v-card-text>
      </v-card>
      <div class="d-flex justify-center" style="width:inherit">
        <span v-html="$options.filters.highlight(item.title, highlightStyle)"></span>
      </div>
    </v-col>
    <v-col
      style="min-width:250px;"
      class="pa-1 ma-0"
      cols="12" xl="3" lg="4" md="4" sm="6" >
        <InArticleAdsense
        data-ad-client="ca-pub-8597405222136575"
        data-ad-slot="1875328416"
        data-ad-format="fluid"
        ins-style="display:inline-block;width:100%;"
        ></InArticleAdsense>
    </v-col>
    <v-col
     v-for="(item,endIndex) in chunk.slice(index%7+4)"
      style="min-width:250px;"
      :key="item.id+endIndex"
      cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2"
      >
       <v-card class="ma-0 pa-0 pb-3" style="width:inherit" flat>
        <v-card-text class="d-flex justify-center pa-0 ma-0">
          <clipIframeDialog :clipData="item" :listData="listData"></clipIframeDialog>
        </v-card-text>
      </v-card>
      <div class="d-flex justify-center" style="width:inherit">
        <span v-html="$options.filters.highlight(item.title, highlightStyle)"></span>
      </div>
    </v-col>
    </v-row>
  </v-row>
  <infinite-loading style="min-height:10vh;" v-if="loading" @infinite="channelInfiniteHandler" spinner="spiral"></infinite-loading>
  <v-row class="d-flex justify-center align-center col-12" style="position:fixed; bottom:30px; left:50%;transform: translate(-50%, -50%); z-index:5; max-width:300px;" v-if="!loaded">
    <v-btn v-ripple color="twitch" block @click="scrolltoBottom()" class="d-flex pa-0 ma-0" width="300" max-width="300" dark>
      <span style="width:208px;" class="d-flex align-center">
        <v-icon v-if="loading" size="24" color="white" class="px-1">mdi-pause</v-icon>
        <v-icon v-else size="24" color="white" class="px-1">mdi-play</v-icon>
        <span class="text-truncate text-caption">
          Keyword : <span class="pr-1">"{{$store.state.searchKeywords[0]}}" (총{{$store.state.searchKeywords.length}}개)</span>
        </span>
      </span>
      <span style="width:92px;" class="text-truncate text-caption">({{cliplist.length}}/{{searchCount}})</span>
    </v-btn>
  </v-row>
</v-container>
</template>
<script>
import axios from 'axios';
import clipIframeDialog from '@/components/dialog/ClipIframeDialog';
import infiniteLoading from 'vue-infinite-loading';
import { chunk } from 'lodash';

export default {
  props: ['listData','userData'],
  components: {
    clipIframeDialog,
    infiniteLoading,
  },
  data() {
    return {
      highlightStyle:[],
      searchCount:0,
      cliplist: [],
      loaded:false,
      loading:true,
      afterCursor:null,
      color: ['teal', 'purple', 'indigo', 'cyan', 'orange'],
    };
  },
  methods: {
    scrolltoBottom(){
      if(!this.loading){
        window.scrollTo(0, document.body.scrollHeight);
      }
      this.loading = !this.loading;
    },
    async channelInfiniteHandler($state) {
      this.loaded = false;
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          broadcaster_id: this.userData.id,
          first: 100,
          after: this.afterCursor,
          started_at: this.$store.state.dateSort.start,
          ended_at: this.$store.state.dateSort.end,
        },
      }).then((res) => {
        this.afterCursor = res.data.pagination.cursor;
        this.searchCount += res.data.data.length;
        res.data.data.map((el) => {
          this.$store.state.searchKeywords.forEach(element => {
            if(this.cliplist.findIndex((val)=> val.id === el.id) === -1){
              if(el.title.toUpperCase().includes(element) && el.view_count > 1){
                this.cliplist.push(el);
              }
            }
          })
        });
        if (res.data.pagination.cursor === undefined || res.data.data.length === 0 || res.data.data[res.data.data.length-1].view_count < 2) {
          this.loaded = true;
          $state.complete();
        } else {
          $state.loaded();
        }
      }).catch(async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.channelInfiniteHandler($state);
        }
      });
    },
  },
  filters:{
    highlight: function(words, queries){
      let result = words;
      queries.forEach((query) => {
        let targetReg = query.text;
        let regex = new RegExp(targetReg, 'gi');
        result = result.replace(regex, '<span class="'+query.color+'--text">' + query.text + '</span>');
      })
      return result;
    }
  },
  computed: {
    cliplistChunk(){
      return chunk(Object.values(this.cliplist),11);
    },
  },
  created(){
    this.highlightStyle = this.$store.state.searchKeywords.map((v, idx) => {
      return {
        text: v,
        'background':'none',
        color: this.color[idx],
      }
    })
    this.highlightStyle.sort((a,b) => b.text.length - a.text.length);
  },
};
</script>
<style lang="scss" scoped>

</style>
