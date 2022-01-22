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
      <v-img
      @click="changeId(clip.id)"
      lazy-src="@/assets/img/404.jpg"
      :src="clip.thumbnail_url"></v-img>
    <!-- <v-dialog
      v-model="dialog"
      width="1280"
    >
    <template v-slot:activator="{ on, attrs }">
    </template>
      <iframe
      :src="`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost`" parent="localhost"
      preload="metadata"
      allowfullscreen="false"
      height="576"
      width="1024"></iframe>
    </v-dialog> -->
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
