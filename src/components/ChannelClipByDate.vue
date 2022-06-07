<template>
<v-container fluid>
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
  <infinite-loading @infinite="channelInfiniteHandler" spinner="spiral"></infinite-loading>
</v-container>
</template>
<script>
import axios from 'axios';
import infiniteLoading from 'vue-infinite-loading';
import clipIframeDialog from '@/components/dialog/ClipIframeDialog';
import { chunk } from 'lodash';

export default {

  props: ['clips','listData'],
  components: {
    infiniteLoading,
    clipIframeDialog,
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
      infiniteData: {},
    };
  },
  methods: {
    changeId(el) {
      this.currentId = el;
    },
    getStartDate(el) {
      const endedAt = new Date(el).getTime();
      const startedAt = new Date(endedAt - 7 * 24 * 60 * 60 * 1000);
      return startedAt.toISOString();
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
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
    async channelInfiniteHandler($state) {
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          broadcaster_id: this.clips.user_id,
          started_at: this.$store.state.dateSort.start,
          ended_at: this.$store.state.dateSort.end,
          first: 20,
          after: this.paginationCursor,
        },
      }).then((res) => {
        this.paginationCursor = res.data.pagination.cursor;
        if (res.data.data.length === 0) {
          $state.complete();
        } else if (res.data.pagination.cursor === undefined && res.data.data.length > 0) {
          res.data.data.map((el) => {
            this.cliplist.push(el);
          });
          $state.complete();
        } else {
          res.data.data.map((el) => {
            this.cliplist.push(el);
          });
          $state.loaded();
        }
      });
    },

  },
  computed: {
    cliplistChunk(){
      return chunk(Object.values(this.cliplist),11);
    },
    getTodayDate() {
      return new Date().toISOString();
    },
  },
};
</script>
<style lang="scss" scoped>

</style>
