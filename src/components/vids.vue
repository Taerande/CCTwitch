<template>
  <v-carousel
    @change="changeCarousel(vids[$event])"
    height="400"
    hide-delimiter-background
    show-arrows-on-hover
  >
    <v-carousel-item
      v-for="(item, i) in vids"
      :key="i"
    >
      <v-sheet
        height="100%"
      >
        <v-row
          class="fill-height"
          align="center"
          justify="center"
        >
          <div class="text-h2">
            {{ item.data.title }}
            {{ item.data.created_at }}
            {{ item.data.duration }}
          </div>
        </v-row>
      </v-sheet>
    </v-carousel-item>
    <!-- <template v-slot:prev="{ on, attrs }">
      <v-btn
        icon
        color="success"
        v-bind="attrs"
        v-on="on"
      >Previous slide</v-btn>
    </template>
    <template v-slot:next="{ on, attrs }">
      <v-btn
        color="info"
        v-bind="attrs"
        v-on="on"
      >Next slide</v-btn>
    </template> -->
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
    changeCarousel(el) {
      this.currentId = el.data.id;
      this.$emit('emitVidId', el.data.id);
    },
  },

};
</script>
<style>

</style>
