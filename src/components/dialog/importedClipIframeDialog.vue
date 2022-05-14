<template>
 <v-dialog
  content-class="clipIframe"
  v-model="dialog"
  max-height="400"
  max-width="600">
  <template v-slot:activator="{ on, attrs }">
    <v-container fluid fill-height class="d-flex align-center" v-on="on">
      <v-img
      v-on="on"
      :aspect-ratio="16/9"
      max-width="130"
      id="clip-thumbnail"
      @click="dialog = true"
      v-bind="attrs"
      lazy-src="@/assets/img/404.jpg"
      :src="clipData.thumbnail_url">
      </v-img>
      <div class="pl-5">
        <div class="">{{clipData.title}}</div>
        <div><v-icon>mdi-eye</v-icon>{{clipData.view_count}}</div>
        <div>{{setDate(clipData.created_at)}}</div>
      </div>
    </v-container>
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
    setDate(el) {
      return this.$moment(el).fromNow();
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
  mounted(){
  }
}
</script>
<style lang="scss" scoped>
#clip-thumbnail{
  cursor: pointer;
}
</style>
