<template>
  <v-carousel
    @change="emitVidsId(vids[$event])"
    height="250"
    hide-delimiters
    show-arrows-on-hover
  >
    <v-carousel-item
      v-for="(item, i) in vids"
      :key="i"
      lazy-src="@/assets/img/404.jpg"
      :src="setThumbnailSize(item.data.thumbnail_url) || '@/assets/img/404.jpg'"

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
        <div class="d-flex justify-between">
          <span>({{setDate(item.data.created_at)}})</span>
          <v-spacer></v-spacer>
          <v-btn
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
</template>
<script>
export default {
  props: ['vids'],
  data() {
    return {
      hoverOpen: false,
      currentId: '',
      currentPage: null,
    };
  },
  methods: {
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time - 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    emitVidsId(el) {
      this.currentId = el.data.id;
      this.$emit('emitVidId', el.data.id);
    },
    setThumbnailSize(el) {
      const width = /%{width}/;
      const height = /%{height}/;
      return el.replace(width, '600').replace(height, '338');
    },
    pushToTwitchVids(url) {
      // eslint-disable-next-line no-alert
      if (window.confirm('해당 영상으로 이동하시겠습니까?')) {
        window.open(url);
      }
    },
    sadf() {
      this.hoverOpen = !this.hoverOpen;
    },
  },
  created() {
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
