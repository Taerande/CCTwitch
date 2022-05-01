<template>
<v-dialog
  max-width="800"
  v-model="dialog"
  >
  <template v-slot:activator="{ on }">
    <v-btn v-on="on" color="twitch" dark>전체재생</v-btn>
  </template>
  <v-card width="600" v-if="$store.state.currentCliplist[0].thumbnail_url">
    <video class="pa-0 ma-0" width="100%" :autoplay="!show"
    @ended="authPlayA()" v-show="!show" controls :src="`${$store.state.currentCliplist[Aindex] === undefined ? $store.state.currentCliplist[0].thumbnail_url.split('-preview')[0] : $store.state.currentCliplist[Aindex].thumbnail_url.split('-preview')[0]}.mp4`"></video>
    <video class="pa-0 ma-0" v-show="show" width="100%" :autoplay="show"
    @ended="authPlayB()" controls :src="`${$store.state.currentCliplist[Bindex] === undefined ? $store.state.currentCliplist[1].thumbnail_url.split('-preview')[0] : $store.state.currentCliplist[Bindex].thumbnail_url.split('-preview')[0]}.mp4`"></video>
    <div id="vid-controller" class="red pa-0 ma-0">
      <v-icon color="white">mdi-rewind-5</v-icon>
      <v-icon color="white">mdi-fast-forward</v-icon>
      <v-icon @click="dialog = false">mdi-close</v-icon>
    </div>
    <!-- <video width="100%" @ended="autoPlay" autoplay :src="`${$store.state.currentCliplist[Gindex].thumbnail_url.split('-preview')[0]}.mp4`"></video> -->
  </v-card>
</v-dialog>
</template>
<script>
export default {
  data() {
    return {
      Gindex:0,
      show: false,
      Aindex:0,
      Bindex:1,
      // playing:false,
      dialog:false,

    }
  },
  methods: {
    autoPlay(){
      this.Gindex += 1;
    },
    authPlayA(){
      this.Aindex += 2;
      if( this.Aindex >= this.$store.state.currentCliplist.length ){
        this.Aindex = 0;
      }
      this.show = !this.show;
      if( this.Aindex + this. Bindex === 1) {return this.show = false}
    },
    authPlayB(){
      this.Bindex += 2;
      if( this.Bindex >= this.$store.state.currentCliplist.length ){
        this.Bindex = 1;
      }
      this.show = !this.show;
      if( this.Aindex + this. Bindex === 1) {return this.show = false}
    },
  },

}
</script>
<style lang="scss">
#vid-controller{
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
