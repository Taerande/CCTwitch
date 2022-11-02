<template>
 <v-dialog
  scrollable
  :content-class="$vuetify.breakpoint.smAndDown ? 'iframeTop' : ''"
  v-model="dialog"
  max-width="1080">
  <template v-slot:activator="{ on }">
    <v-card @mouseenter="hovering = true" @mouseleave="hovering = false" class="d-flex ma-0 pa-0"
    flat>
      <v-card-title class="justify-center ma-0 pa-0" style="width:3rem;">
        <span class="text-caption font-weight-bold">{{index+1}}</span>
      </v-card-title>
      <v-card-text class="d-flex align-center ma-0 pa-0 text-truncate">
        <v-img
        :max-width="imgWidth"
        :aspect-ratio="16/9"
        class="pa-0 thumbnailImg ma-0 rounded-lg"
        v-on="on"
        lazy-src="@/assets/img/404.jpg"
        :src="clipData.thumbnail_url">
          <v-container fluid fill-height class="d-flex align-content-space-between flex-wrap">
            <v-row class="d-flex justify-start pa-1">
              <span class="text-caption white--text ma-2 px-1" style="background-color: rgba( 0, 0, 0, 0.5 )">{{$moment(clipData.createdAt).fromNow()}}</span>
            </v-row>
          </v-container>
          <div v-if="hovering" class="d-flex justify-center hoveringImg">
            <v-icon size="60" color="white">mdi-play</v-icon>
          </div>
        </v-img>
        <div class="pl-2 text-truncate">
          삭제된 클립입니다.
        </div>
      </v-card-text>
    </v-card>
  </template>
  <v-card class="pa-0 ma-0 black">
    <v-card-title class="d-block pa-0 ma-0">
      <div class="d-flex justify-end align-center" v-if="dialog">
        <span class="white--text pl-1">{{$moment(clipData.createdAt).format('ll')}}</span>
        <v-spacer></v-spacer>
        <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </v-card-title>
    <v-card-text class="pa-0 ma-0">
      <v-responsive aspect-ratio="16/9" height="100%" v-if="dialog">
        <video
        controls
        :src="clipData.thumbnail_url.split('-preview')[0] + '.mp4'"
        ></video>
      </v-responsive>
    </v-card-text>
    <div class="ma-0 px-1 py-2">
      <Adsense
      data-ad-client="ca-pub-8597405222136575"
      data-ad-slot="3465851493"
      :ins-style="`display:inline-block;width:100%;height:90px;min-wdith:250px;`"
      ></Adsense>
    </div>
  </v-card>
</v-dialog>
</template>
<script>
export default {
  components:{
  },
  props:['clipData','index'],
  data() {
    return {
      hovering:false,
      dialog:false,
    }
  },
  computed:{
    imgWidth(){
      if(this.$vuetify.breakpoint.lgAndUp){
        return '200';
      } else if(this.$vuetify.breakpoint.md) {
        return '175';
      } else if(this.$vuetify.breakpoint.sm) {
        return '150';
      } else if (this.$vuetify.breakpoint.xs) {
        return '100';
      } else {
        return '100';
      }
    },

  },
}
</script>
<style lang="scss" scoped>
video{
  width: 100% !important;
  height: auto !important;
}

.thumbnailImg{
  cursor: pointer;
}
.hoveringImg{
  position: absolute;
  z-index: 3;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.2);
}
</style>
