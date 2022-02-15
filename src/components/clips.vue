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
    sm="12"
    class="pa-5"
    >
    <v-sheet min-height="300px" class="d-flex align-center justify-center fill-height">
      <v-lazy
        :options="{ threshold: 0.5}">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center pa-0">
        <span class="text-body-1">{{clip.title.length >19 ? `${clip.title.substr(0,20)}...` : clip.title }}</span>
        <span class="text-body-1">⏯조회수:{{clip.view_count}}</span>
          </v-card-title>
          <v-card-text class="d-flex justify-center align-center pa-0">
        <v-dialog
          :v-model="clip.id === currentId"
          @click:outside="currentId = ''"
          width="1280"
        >
        <template v-slot:activator="{ on, attrs }">
          <v-img
          width="100"
          id="clip-thumbnail"
          @click="changeId(clip.id)"
          v-bind="attrs"
          v-on="on"
          lazy-src="@/assets/img/404.jpg"
          :src="clip.thumbnail_url"></v-img>
        </template>
          <iframe
          v-if="clip.id === currentId"
          :src="`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost&autoplay=true`" parent="localhost"
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
    <v-row class="justify-center align-center" v-else>
      <v-col class="justify-center align-center">

    <v-img max-height="250px" max-width="300px" src="@/assets/img/404.jpg"></v-img>
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
  computed: {
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
