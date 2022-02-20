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
      lg="3"
      md="4"
      sm="12"
      class="pa-1"
      :class="item.broadcaster_id"

      >
      <v-sheet class="fill-height">
        <v-lazy
          :options="{ threshold: 0.5}">
          <v-card>
            <v-card-title class="pa-0">
              <v-container>
              <v-row class="d-flex justify-space-between align-center">
                <v-avatar v-if="clips.page == 'trending'" size="30">
                  <v-img :src="$store.state.likedStreamer.find( ele => ele.id == item.broadcaster_id).thumbnail" alt="profile_img"></v-img>
                  </v-avatar>
                  <v-btn
                    v-if="$store.state.pinnedClips.find( ele => ele == item.id)"
                    @click="$store.commit('DELETE_pinnedClip',item.id)"
                    icon
                    >
                    <v-icon size="20" color="red">mdi-pin</v-icon>
                  </v-btn>
                  <v-btn v-else icon
                    @click="$store.commit('ADD_pinnedClip',item.id)">
                    <v-icon size="20" color="twitch">mdi-pin-outline</v-icon>
                  </v-btn>
              </v-row>
              <v-row class="d-flex justify-center">
                <span class="text-body-2">{{item.title.length >18 ? `${item.title.substr(0,17)}...` : item.title }}</span>
              </v-row>
              </v-container>

            </v-card-title>
            <v-card-text class="d-flex justify-center align-center pa-0">
          <v-dialog
            :v-model="item.id === currentId"
            @click:outside="currentId = null"
            width="1280"
          >
          <template v-slot:activator="{ on, attrs }">
            <v-img
            width="275"
            height="156"
            id="clip-thumbnail"
            @click="changeId(item.id)"
            v-bind="attrs"
            v-on="on"
            lazy-src="@/assets/img/404.jpg"
            :src="item.thumbnail_url"></v-img>
          </template>
            <iframe
            v-if="item.id === currentId"
            :src="`https://clips.twitch.tv/embed?clip=${item.id}&parent=twitch-hotclip-tracker.netlify.app&autoplay=true`" parent="twitch-hotclip-tracker.netlify.app"
            preload="auto"
            frameborder="0"
            height="720"
            allowfullscreen="true"></iframe>
          </v-dialog>

            </v-card-text>
            <div class="d-flex justify-space-between">
          <span class="text-caption">{{setDate(item.created_at)}}</span>
          <span class="text-caption">views:{{item.view_count}}</span>
            </div>
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

export default {
  props: ['clips'],
  components: {
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
      infiniteData: {},
      userInfo: '',
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
        if (res.data.pagination.cursor == null || this.cliplist.length > 100) {
          $state.complete();
        } else {
          if (this.clips.page === 'channel') {
            res.data.data.forEach((el) => {
              if (el.video_id === this.infiniteData.data.video_id) {
                this.cliplist.push(el);
              }
            });
          } else {
            this.cliplist.push(...res.data.data);
          }
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
    };
  },
  computed: {
    getTodayDate() {
      return new Date().toISOString();
    },
  },
};
</script>
<style>
#clip-thumbnail{
  cursor: pointer;
  border-radius: 3%;
}
.v-dialog{
  box-shadow: none !important;
}

</style>
