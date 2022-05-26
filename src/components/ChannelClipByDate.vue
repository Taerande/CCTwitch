<template>
<v-container>
  <v-row
  class="pa-1 justify-space-between align-baseline"
  v-if="this.cliplist.length > 0">
    <v-row class="col-12 pa-1 d-flex justify-space-between align-baseline">
      <div class="d-flex align-baseline">
      <h1>Clips</h1>
      </div>
    </v-row>
  <v-row class="d-flex col-12">
    <v-col
      v-for="(item, index) in this.cliplist"
      :key="index"
      cols="12" lg="3" md="4" sm="6" xs="12"
      class="pa-3 clip-item"
      :class="item.broadcaster_id"
      >
       <v-card class="ma-0 pa-0">
        <v-card-text class="d-flex justify-center pa-0 ma-0">
          <clipIframeDialog :clipData="item" :listData="listData"></clipIframeDialog>
        </v-card-text>
      </v-card>
      <div class="d-flex justify-center">{{item.title}}</div>
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
    shuffle() {
      const playlist = [...this.cliplist];
      let listLength = playlist.length;
      let t;
      let i;
      while (listLength) {
        i = Math.floor(Math.random() * listLength);
        listLength -= 1;
        t = playlist[listLength];
        playlist[listLength] = playlist[i];
        playlist[i] = t;
        this.cliplist = playlist;
      }
      this.$store.commit('SET_SnackBar', { type: 'info', text: 'Filter : 랜덤으로 정렬합니다.', value: true });
    },
    refresh() {
      this.cliplist.sort((a, b) => b.view_count - a.view_count);
      this.$store.commit('SET_SnackBar', { type: 'info', text: 'Filter : 조회수순으로 정렬합니다.', value: true });
    },
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
    getTodayDate() {
      return new Date().toISOString();
    },
  },
};
</script>
<style lang="scss" scoped>

</style>
