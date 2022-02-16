<template>
<v-container>
  <v-row class="pa-3">
    <h1>
    Clips
    </h1>
  </v-row>
  <v-row
  v-if="clips.clips.length > 0">
  <v-col
    v-for="item in clips.clips"
    :key="item.id"
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
            <v-avatar v-if="clips.page == 'trending'" size="30">
            <v-img :src="$store.state.likedStreamer.find( ele => ele.id == item.broadcaster_id).thumbnail" alt="profile_img"></v-img>
        </v-avatar>
        <span class="text-body-1">{{item.title.length >19 ? `${item.title.substr(0,20)}...` : item.title }}</span>
          </v-card-title>
          <v-card-text class="d-flex justify-center align-center pa-0">
        <v-dialog
          :v-model="item.id === currentId"
          @click:outside="currentId = ''"
          width="1280"
        >
        <template v-slot:activator="{ on, attrs }">
          <v-img
          width="100"
          id="clip-thumbnail"
          @click="changeId(item.id)"
          v-bind="attrs"
          v-on="on"
          lazy-src="@/assets/img/404.jpg"
          :src="item.thumbnail_url"></v-img>
        </template>
          <iframe
          v-if="item.id === currentId"
          :src="`https://clips.twitch.tv/embed?clip=${item.id}&parent=localhost&autoplay=true`" parent="localhost"
          preload="auto"
          frameborder="0"
          height="720"
          allowfullscreen="true"></iframe>
        </v-dialog>

          </v-card-text>
          <div class="d-flex justify-space-between">
        <span class="text-body-1">{{getTodayDate(item.created_at)}}</span>
        <span class="text-body-1">⏯조회수:{{item.view_count}}</span>
          </div>
        </v-card>
      </v-lazy>
    </v-sheet>
    </v-col>
    </v-row>
    <v-row v-else class="justify-center align-center">
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
    getTodayDate(el) {
      const d = new Date(el);
      let month = `${d.getMonth() + 1}`;
      let day = `${d.getDate()}`;
      const year = d.getFullYear();
      if (month.length < 2) month = `0${month}`;
      if (day.length < 2) day = `0${day}`;
      return [year, month, day].join('-');
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
