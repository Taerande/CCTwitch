<template>
  <v-carousel
    @change="emitVidsId(vids[$event])"
    height="250"
    width="250"
    hide-delimiters
    v-if="vidlist.length > 0"
  >
    <v-carousel-item
      v-for="(item, index) in vidlist"
      :key="index"
      lazy-src="@/assets/img/404.jpg"
      :src="setThumbnailSize(item.data.thumbnail_url, index) || '@/assets/img/404.jpg'"

    @mouseover="hoverOpen = true"
    @mouseout="hoverOpen = false"
    >
    <v-sheet
    class="pa-5"
    color="rgba(0,0,0,0.3)">
      <div class="white--text">
        <div>
        {{item.data.title}}
        </div>
        <div class="d-flex justify-between align-baseline pt-1">
          <span>({{setDate(item.data.created_at)}})</span>
          <span v-if="item.data.is_live" class="pl-1 red--text text-caption">OnAir</span>
          <v-spacer></v-spacer>
          <v-btn v-if="item.data.is_live"
          v-show="hoverOpen"
          outlined
          small
          depressed
          id="urlBtn"
          @click="pushToTwitchVids(`https://www.twitch.tv/${item.data.user_login}`)">이동</v-btn>
          <v-btn v-else
          v-show="hoverOpen"
          outlined
          small
          depressed
          id="urlBtn"
          @click="pushToTwitchVids(item.data.url)">이동</v-btn>
        </div>
      </div>
    </v-sheet>
    </v-carousel-item>
  </v-carousel>
  <div v-else class="d-flex align-center justify-center text-h4">
    😅There is no Vids
  </div>
</template>
<script>
import axios from 'axios';

export default {
  props: ['vids'],
  data() {
    return {
      vidlist: [],
      hoverOpen: false,
      currentId: '',
      currentPage: null,
    };
  },
  methods: {
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    emitVidsId(el) {
      this.currentId = el.data.id;
      this.$emit('emitVidId', el.data.id);
    },
    setThumbnailSize(el, index) {
      if (el === '') {
        this.getLiveThumbnail(this.vidlist[index], index);
        return this.vidlist[index].data.thumbnail_url;
      }
      const width = /%{width}/;
      const height = /%{height}/;
      return el.replace(width, '600').replace(height, '400');
    },
    pushToTwitchVids(url) {
      // eslint-disable-next-line no-alert
      if (window.confirm('해당 영상으로 이동하시겠습니까?')) {
        window.open(url);
      }
    },
    async getLiveThumbnail(el, index) {
      await axios.get('https://api.twitch.tv/helix/streams', {
        params: {
          user_login: el.data.user_login,
        },
        headers: this.$store.state.headerConfig,
      }).then((res) => {
        const width2 = /{width}/;
        const height2 = /{height}/;
        const convert = res.data.data[0].thumbnail_url.replace(width2, '600').replace(height2, '400');
        this.vidlist[index].data.thumbnail_url = convert;
        this.vidlist[index].data.is_live = res.data.data[0].type;
      });
    },
  },
  mounted() {
    this.vidlist = this.vids;
  },

};
</script>
<style>
#urlBtn{
  padding: 0%;
  background: none;
  font-size: 0.8rem;
  color: var(--twitch-color);
}
</style>
