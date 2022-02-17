<template>
<v-container>
  <v-row v-if="$store.state.likedStreamer.length > 0" >

  <v-row class="pa-3 d-flex justify-space-between align-baseline">
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
    :class="$store.state.likedStreamer.find( ele => ele.id == item.broadcaster_id).id"
    >
    <v-sheet min-height="300px" class="fill-height">
      <v-lazy
        :options="{ threshold: 0.5}">
        <v-card>
          <v-card-title class="pa-0">
            <v-container>
            <v-row class="d-flex justify-space-between align-center">
              <v-avatar v-if="clips.page == 'trending'" size="30">
                <v-img :src="$store.state.likedStreamer.find( ele => ele.id == item.broadcaster_id).thumbnail" alt="profile_img"></v-img>
                </v-avatar>
                <v-btn
                  v-if="$store.state.pinnedClips.find( ele => ele == item.id)"
                  @click="$store.commit('DELETE_pinnedClip',item.id)"
                  icon
                  >
                  <v-icon size="20" color="red">mdi-pin</v-icon>
                </v-btn>
                <v-btn v-else icon
                  @click="$store.commit('ADD_pinnedClip',item.id)">
                  <v-icon size="20" color="twitch">mdi-pin-outline</v-icon>
                </v-btn>
            </v-row>
            <v-row class="d-flex justify-center">
              <span class="text-body-2">{{item.title.length >18 ? `${item.title.substr(0,17)}...` : item.title }}</span>
            </v-row>
            </v-container>

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
        <span class="text-caption">{{getTodayDate(item.created_at)}}</span>
        <span class="text-caption">views:{{item.view_count}}</span>
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
  </v-row>
  <v-row v-else>
    <v-col>
      <span>there is no clips</span>
    </v-col>

  </v-row>
</v-container>
</template>
<script>

export default {
  props: ['clips'],
  data() {
    return {
      pinned: false,
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
