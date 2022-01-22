<template>
<v-container>
  <v-row>
    Clips
  </v-row>
  <v-row>
  <v-col
    v-for="clip in this.clips"
    :key="clip.id"
    lg="3"
    md="4"
    sm="6"
    xs="12">
    <div>{{clip.title}} 조회수:{{clip.view_count}}</div>
    <v-dialog
      :v-model="clip.id === currentId"
      @click:outside="currentId = ''"
      width="1080"
    >
    <template v-slot:activator="{ on, attrs }">
      <v-img
      @click="changeId(clip.id)"
      v-bind="attrs"
      v-on="on"
      lazy-src="@/assets/img/404.jpg"
      :src="clip.thumbnail_url"></v-img>
    </template>
      <iframe
      v-if="clip.id === currentId"
      :src="`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost`" parent="localhost"
      autoplay="true"
      preload="auto"
      frameborder="0"
      allowfullscreen="false"
      height="542"
      width="964"></iframe>
    </v-dialog>z
    </v-col>
  </v-row>
</v-container>
</template>
<script>
export default {
  props: ['clips'],
  data() {
    return {
      overlay: false,
      currentId: '',
      dialog: false,
    };
  },
  methods: {
    changeId(el) {
      this.currentId = el;
    },
  },
  updated() {
    console.log(this.currentId);
  },
};
</script>
<style>

</style>
