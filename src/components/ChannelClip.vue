<template>
<v-container>
  <v-row
  class="pa-1 justify-space-between align-baseline"
  v-if="this.cliplist.length > 0">
    <v-row class="col-12 pa-1 d-flex justify-space-between align-baseline">
      <div class="d-flex align-baseline">
      <h1>Clips</h1>
      <span class="pl-2 text-caption">(동영상별 최대 100개의 클립을 가져옵니다.)</span>
      </div>
      <div>
        <v-icon @click="refresh">mdi-refresh</v-icon>
        <v-icon @click="shuffle">mdi-shuffle</v-icon>
      </div>
    </v-row>
  <v-row>
    <v-col
      v-for="(item, index) in this.cliplist"
      :key="index"
      cols="12" lg="3" md="4" sm="6" xs="12"
      class="pa-3 clip-item"
      :class="item.broadcaster_id"

      >
      <v-sheet
       class="fill-height">
        <v-lazy
          v-model="item.id"
          :options="{ threshold: 0.5}">
          <v-card>
            <v-card-title class="pa-0">
            </v-card-title>
            <v-card-text class="d-flex justify-center align-center pa-0">
          <v-dialog
            :v-model="item.id === currentId"
            @click:outside="currentId = null"
            max-width="1280"
          >
          <template v-slot:activator="{ on, attrs }">
            <v-img
            :aspect-ratio="16/9"
            width="400"
            id="clip-thumbnail"
            @click="currentId = null, currentId = item.id"
            v-bind="attrs"
            v-on="on"
            lazy-src="@/assets/img/404.jpg"
            :src="item.thumbnail_url">
              <v-container fluid fill-height class="d-flex align-content-space-between">
                <v-row class="d-flex justify-space-between align-center pl-1" style="background-color: rgba( 0, 0, 0, 0.5 )">
                  <v-avatar size="25">
                    <v-img :src="userProfileImg" lazy-src="@/assets/img/404.jpg" alt="profile_img"></v-img>
                  </v-avatar>
                  <span style="max-width: 150px;" class="white--text text-body-2 text-truncate">{{item.title}}</span>
                  <pinClip name="channelClipPin" :clipData="{data:item}"></pinClip>
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
            :src="`https://clips.twitch.tv/embed?clip=${currentId}&parent=localhost&autoplay=true&muted=false&preload=auto`"
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
    <infinite-loading @infinite="channelInfiniteHandler" spinner="spiral"></infinite-loading>
</v-container>
</template>
<script>
import axios from 'axios';
import infiniteLoading from 'vue-infinite-loading';
import pinClip from '@/components/pinClip.vue';

export default {
  props: ['clips','userProfileImg'],
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
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 5 * 24 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },

    async channelInfiniteHandler($state) {
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          broadcaster_id: this.infiniteData.data.broadcaster_id,
          started_at: this.infiniteData.data.started_at,
          ended_at: this.infiniteData.data.ended_at,
          first: this.infiniteData.data.first,
          after: this.paginationCursor,
        },
      }).then((res) => {
        this.paginationCursor = res.data.pagination.cursor;
        if (this.cliplist.length >= 100 || res.data.data.length === 0) {
          $state.complete();
        } else if (res.data.pagination.cursor === undefined && res.data.data.length > 0) {
          res.data.data.forEach((el) => {
            if (el.video_id === this.infiniteData.data.video_id && this.cliplist.length < 100) {
              this.cliplist.push(el);
            }
          });
          $state.complete();
        } else {
          res.data.data.forEach((el) => {
            if (el.video_id === this.infiniteData.data.video_id && this.cliplist.length < 100) {
              this.cliplist.push(el);
            }
          });
          $state.loaded();
        }
      });
    },

  },
  created() {
    this.infiniteData.data = {
      broadcaster_id: this.clips.data.user_id,
      started_at: this.clips.data.created_at,
      ended_at: this.getEndDate(this.clips.data.created_at),
      first: 20,
      video_id: this.clips.data.id,
      viewalbe: this.clips.data.viewalbe,
    };
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
  border-radius: 3px;
}
</style>
