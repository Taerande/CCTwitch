<template>
 <v-dialog
  content-class="clipIframe"
  v-model="dialog"
  max-height="400"
  max-width="600">
  <template v-slot:activator="{ on, attrs }">
    <div class="d-flex py-1 align-center text-truncate">
      <v-img
      v-on="on"
      :max-width="imgWidth"
      :aspect-ratio="16/9"
      class="clip-thumbnail"
      @click="dialog = true"
      v-bind="attrs"
      lazy-src="@/assets/img/404.jpg"
      :src="clipData.thumbnail_url">
      </v-img>
      <div class="pl-3 text-truncate">
        <div class="text-truncate">{{clipData.title}}</div>
        <div class="d-flex py-2">
          <v-icon small class="pr-1">mdi-eye</v-icon>
          <span class="text-caption">
            {{clipData.view_count}}
          </span>
          <span class="pl-5 text-caption">{{$moment(clipData.created_at).format('l')}}</span>
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon color="error" @click="deleteClip()">mdi-close</v-icon>
      </v-btn>
    </div>
  </template>
    <div class="black d-flex justify-end">
      <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
    </div>
      <iframe
      id="clipIframe"
      @keydown.esc="dialog = false"
      v-if="dialog"
      class="black d-flex align-center"
      :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=false&muted=false&preload=auto`"
      preload="auto"
      frameborder="0"
      :height="$vuetify.breakpoint.smAndUp ? 400 : 300"
      width="100%"
      allowfullscreen="true"></iframe>
</v-dialog>
</template>
<script>
export default {
  components:{
  },
  props:['clipData'],
  data() {
    return {
      dialog:false,
    }
  },
  methods: {
    deleteClip(){
      this.$emit('deleteClip')
    },
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
    },
    pushToTwitchVids(url, title, time) {
      // const iframe = document.querySelector('iframe');
      // iframe.contentWindow.document.querySelector('video').pause();
      if (window.confirm(`${title}[${time}]으로 이동하시겠습니까?`)) {
        window.open(url, '_blank');
      }
    },
     viewerkFormatter(el) {
      const num = el.toString();
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(num.length - 9, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`;
      }
      return Math.abs(num);
    },
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
  mounted(){
  }
}
</script>
<style lang="scss" scoped>
.clip-thumbnail{
  cursor: pointer;
}
</style>
