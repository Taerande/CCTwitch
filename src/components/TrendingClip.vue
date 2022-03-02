<template>
<v-container>
  <v-row
  class="pa-1 d-flex justify-space-between align-baseline"
  v-if="this.cliplist.length > 0">
    <v-row class="col-12 pa-1 d-flex justify-space-between align-baseline">
      <div class="d-flex align-baseline">
       <h1>Trending Clips</h1>
      <span class="text-caption pl-2">(최근 7일간 100개의 클립을 가져옵니다.)</span>
      </div>
      <div>
        <v-icon @click="refresh">mdi-refresh</v-icon>
        <v-icon @click="sortByName">mdi-play</v-icon>
        <v-icon @click="isShuffled = !isShuffled, shuffle()">mdi-shuffle</v-icon>
      </div>
    </v-row>
  <v-row>
    <v-col
      v-for="(item, index) in this.cliplist"
      :key="index"
      lg="3"
      md="6"
      sm="6"
      xs="12"
      class="pa-3 clip-item"
      :class="[item.broadcaster_id, $store.state.likedStreamer.find( ele => ele.id == item.broadcaster_id) === undefined ? 'hidden': '']"
      >
        <v-sheet v-if="$store.state.likedStreamer.find( ele => ele.id == item.broadcaster_id)">
          <v-lazy
            :options="{ threshold: 0.1}">
            <v-card>
              <v-card-title class="pa-0">
              </v-card-title>
              <v-card-text class="d-flex justify-center align-center pa-0">
            <v-dialog
              :v-model="item.id === currentId"
              @click:outside="currentId = null"
              width="1280"
            >
            <template v-slot:activator="{ on, attrs }">
              <v-img
              :aspect-ratio="16/9"
              width="400"
              id="clip-thumbnail"
              @click="changeId(item.id)"
              v-bind="attrs"
              v-on="on"
              lazy-src="@/assets/img/404.jpg"
              :src="item.thumbnail_url">
              <v-container fluid fill-height class="d-flex align-content-space-between">
                <v-row class="d-flex justify-space-between align-center pl-1 py-2" style="background-color: rgba( 0, 0, 0, 0.5 )">
                  <v-avatar size="25">
                    <v-img :src="$store.state.likedStreamer.find( ele => ele.id == item.broadcaster_id).thumbnail" lazy-src="@/assets/img/404.jpg" alt="profile_img"></v-img>
                  </v-avatar>
                  <div style="max-width: 150px;" class="white--text text-body-2 text-truncate">{{item.title}}</div>
                  <pinClip name="channelClipPin" :clipData="item"></pinClip>
                </v-row>
                <v-row class="d-flex justify-space-between">
                  <span class="text-caption white--text ma-2 px-1" style="background-color: rgba( 0, 0, 0, 0.5 )">{{setDate(item.created_at)}}</span>
                  <span class="text-caption white--text ma-2 px-1" style="background-color: rgba( 0, 0, 0, 0.5 )">views:{{viewerkFormatter(item.view_count)}}</span>
                </v-row>
              </v-container>
              </v-img>
            </template>
              <iframe
              class="black d-flex align-center"
              v-if="item.id === currentId"
              :src="`https://clips.twitch.tv/embed?clip=${currentId}&parent=localhost&autoplay=true`" parent="localhost"
              preload="auto"
              frameborder="0"
              height="720"
              allowfullscreen="true"></iframe>
            </v-dialog>
            </v-card-text>
            </v-card>
          </v-lazy>
        </v-sheet>
    </v-col>
  </v-row>
  </v-row>
  <v-row v-else class="justify-center align-center">
    <v-col class="justify-center align-center">
      <span class="text-h4">😫There is no Clips</span>
    </v-col>
  </v-row>
    <infinite-loading v-if="$store.state.likedStreamer.length > 0" @infinite="trendingInfiniteHandler" spinner="spiral"></infinite-loading>
</v-container>
</template>
<script>
import axios from 'axios';
import infiniteLoading from 'vue-infinite-loading';
import pinClip from '@/components/pinClip.vue';

export default {
  props: ['clips'],
  components: {
    infiniteLoading,
    pinClip,
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
      userInfo: '',
      isShuffled: false,
      nameSort:'',
    };
  },
  methods: {
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
      }
      this.cliplist = playlist;
      this.$store.commit('SET_SnackBar', { type: 'info', text: 'Filter : 랜덤으로 정렬합니다.', value: true });
    },
    refresh() {
      console.time('messuer');
      this.cliplist.sort((a, b) => b.view_count - a.view_count);
      console.timeEnd('meusussre end');
      this.$store.commit('SET_SnackBar', { type: 'info', text: 'Filter : 조회수순으로 정렬합니다.', value: true });
    },
    sortByName(){
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.cliplist, type: 'name', order: 'desc' });
      } else {
        this.nameSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.cliplist, type: 'name', order: 'asc' });
      }
    },
    changeId(el) {
      this.currentId = el;
    },
    getStartDate(el) {
      const endedAt = new Date(el).getTime();
      const startedAt = new Date(endedAt - 7 * 24 * 60 * 60 * 1000);
      return startedAt.toISOString();
    },
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 48 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },

    async trendingGetClipInfinite(target, index) {
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          broadcaster_id: target.id,
          started_at: this.getStartDate(this.getTodayDate),
          ended_at: this.getTodayDate,
          first: 4,
          after: this.$store.state.likedStreamer[index].pagination,
        },
      }).then((resp) => {
        this.$store.commit('SET_Pagination', { data: target, pagination: resp.data.pagination.cursor });
        resp.data.data.forEach((el) => {
          if (this.cliplist.length < 100 && el.view_count > 2) {
            this.cliplist.push(el);
          }
        });
      }).catch((error) => console.log(error));
    },

    async trendingInfiniteHandler($state) {
      if (this.cliplist.length >= 100) {
        $state.complete();
      } else if (this.paginationCursor === undefined && this.cliplist.length > 0) {
        const promise = this.$store.state.likedStreamer.map(this.trendingGetClipInfinite);
        await Promise.all(promise);
        $state.complete();
      } else {
        const promise = this.$store.state.likedStreamer.map(this.trendingGetClipInfinite);
        await Promise.all(promise);
        $state.loaded();
      }
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
#clip-thumbnail{
  cursor: pointer;
}
</style>
