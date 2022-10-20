<template>
<v-container fluid>
  <v-row class="col-12 pa-1 d-flex justify-space-between align-baseline">
    <div class="d-flex align-baseline">
      <h1>Clips | Keyword : {{$store.state.clipKeyword}}</h1>
    </div>
  </v-row>
  <v-row
  class="pa-1 justify-space-between align-baseline"
  v-if="this.cliplist.length > 0">
    <v-row class="d-flex col-12" v-for="(chunk, index) in cliplistChunk" :key="index">
    <v-col
    style="min-width:250px;"
     v-for="(item,startIndex) in chunk.slice(0,index%7+4)"
          :key="item.id+startIndex"
      cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2"
      :class="item.broadcaster_id"
      >
       <v-card class="ma-0 pa-0" flat style="width:inherit">
        <v-card-text class="d-flex justify-center pa-0 ma-0">
          <clipIframeDialog :clipData="item" :listData="listData"></clipIframeDialog>
        </v-card-text>
      </v-card>
      <div class="d-flex justify-center pt-2" style="width:inherit">{{item.title}}</div>
    </v-col>
    <v-col
      style="min-width:250px;"
      v-if="chunk.length > index%7+4"
      class="pa-0 ma-0"
      cols="12" xl="3" lg="4" md="4" sm="6">
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
      :class="item.broadcaster_id"
      >
       <v-card class="ma-0 pa-0" flat style="width:inherit">
        <v-card-text class="d-flex justify-center pa-0 ma-0">
          <clipIframeDialog :clipData="item" :listData="listData"></clipIframeDialog>
        </v-card-text>
      </v-card>
      <div class="d-flex justify-center pt-2" style="width:inherit">{{item.title}}</div>
    </v-col>
    </v-row>
  </v-row>
  <infinite-loading v-if="loading" @infinite="channelInfiniteHandler" spinner="spiral"></infinite-loading>
  <v-row class="d-flex justify-center align-center" style="position:fixed; bottom:30px; left:50%;transform: translate(-50%, -50%); z-index:5;">
    <v-btn v-ripple dark color="twitch" block @click="scrolltoBottom()" class="d-flex pa-0 ma-0" width="300" max-width="300">
      <span style="width:208px;" class="d-flex align-center">
        <v-icon v-if="loading" size="24" class="px-1">mdi-pause</v-icon>
        <v-icon v-else size="24" class="px-1">mdi-play</v-icon>
        <span class="text-truncate text-caption ">
          Keyword : {{$store.state.clipKeyword}}
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
      searchCount:0,
      cliplist: [],
      loading:true,
      afterCursor:null,
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
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          broadcaster_id: this.userData.id,
          first: 100,
          after: this.afterCursor,
        },
      }).then((res) => {
        if(!this.loading || res.data.data[res.data.data.length-1].view_count < 10) {
          $state.loaded();
        } else if (res.data.data.length === 0) {
          $state.complete();
        } else if (res.data.pagination.cursor === undefined && res.data.data.length > 0) {
          res.data.data.map((el) => {
            if(el.title.toLowerCase().includes(this.$store.state.clipKeyword.toLowerCase()) && el.view_count > 9){
              this.cliplist.push(el)
            }
          });
          $state.complete();
        } else {
          res.data.data.map((el) => {
            if(el.title.toLowerCase().includes(this.$store.state.clipKeyword.toLowerCase()) && el.view_count > 9){
              this.cliplist.push(el)
            }
          });
          $state.loaded();
        }
        this.afterCursor = res.data.pagination.cursor;
        this.searchCount += res.data.data.length;
      }).catch(async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.channelInfiniteHandler($state);
        }
      });
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
  },
  computed: {
    cliplistChunk(){
      return chunk(Object.values(this.cliplist),11);
    },
  },
  created() {
  },
};
</script>
<style lang="scss" scoped>

</style>
