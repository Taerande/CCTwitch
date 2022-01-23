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
    >
    <v-sheet
    class="pa-5"
    color="rgba(0,0,0,0.3)">
      <div class="white--text">
        <div>
        {{item.data.title}}
        </div>
        <div>
          ({{setDate(item.data.created_at)}})
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
  },

};
</script>
<style>

</style>
