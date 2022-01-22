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
    lazy-src="@/assets/img/404.jpg"
    :src="clip.thumbnail_url"></v-img>
    <hr>
    <!-- <v-lazy
      v-model="isActive"
      :options="{
        threshold: .5
      }"
      min-height="200"
      transition="fade-transition">
      <iframe :src="`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost`" parent="localhost"
      frameborder="0"
      allowfullscreen="false"
      scrolling="yes"
      height="180"
      width="360"></iframe>
    </v-lazy> -->
    </v-col>
  </v-row>
</v-container>
</template>
<script>
export default {
  props: ['clips'],

};
</script>
<style>

</style>
