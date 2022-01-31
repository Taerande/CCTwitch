<template>
<v-container>
  <v-row class="pa-3">
    <h1>
    Clips
    </h1>
  </v-row>
  <v-row
  v-if="this.clips.length >0">
  <v-col
    v-for="clip in this.clips"
    :key="clip.id"
    lg="3"
    md="4"
    sm="6"
    xs="12">
      <div>{{clip.title.length >19 ? `${clip.title.substr(0,20)}...` : clip.title }} ⏯조회수:{{clip.view_count}}</div>
      <v-dialog
        :v-model="clip.id === currentId"
        @click:outside="currentId = ''"
        width="1080"
      >
      <template v-slot:activator="{ on, attrs }">
        <v-img
        id="clip-thumbnail"
        @click="changeId(clip.id)"
        v-bind="attrs"
        v-on="on"
        lazy-src="@/assets/img/404.jpg"
        :src="clip.thumbnail_url"></v-img>
      </template>
        <iframe
        v-if="clip.id === currentId"
        :src="`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost`" parent="localhost"
        preload="auto"
        frameborder="0"
        allowfullscreen="false"
        height="542"
        width="964"></iframe>
      </v-dialog>
    </v-col>
  </v-row>
  <v-row class="justify-center align-center" v-else>
    <v-col class="justify-center align-center">

   <v-img max-height="500px" max-width="500px" src="@/assets/img/404.jpg"></v-img>
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
#clip-thumbnail{
  border: 2px solid black;
  border-radius: 2%;
}
.v-dialog{
  box-shadow: none !important;
}

</style>
