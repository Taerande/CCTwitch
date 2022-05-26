<template>
  <v-carousel
    height="inherit"
    v-model="model"
    :aspect-ratio="16/9"
    hide-delimiters
    :progress="true"
    progress-color="twitch"
  >
    <v-carousel-item
      full-width
      v-ripple="false"
      v-for="(item, index) in vids"
      :key="index"
      transition="none"
    >
    <v-sheet
    :style="{height:`${imgHeight}px`}"
    class="d-flex justify-center align-center pa-2"
    :color="$vuetify.theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'">
      <v-img
      v-if="vids.length > 1"
      @click.stop.prevent="index===0 ? model = vids.length-1 : model = index - 1"
      class="beforeVidImg rounded-lg rounded-r-0 hoverCursor"
      :max-width="imgWidth * 0.9"
      :src="setBAVidList(index - 1).thumbnail_url || `${require('@/assets/img/404.jpg')}`"
      lazy-src="@/assets/img/404.jpg"
      >
      <div class="white--text pa-2" style="background: rgb(0,0,0,0.3)">
        <div>{{setBAVidList(index - 1).title}}</div>
        <div class="text-caption">{{setDate(setBAVidList(index - 1).created_at)}}</div>
      </div>
      </v-img>
      <v-img
      class="hoverCursor rounded-lg white--text elevation-12"
      :max-width="imgWidth"
      style="position: relative;"
      @click="openVidsListDialog"
      :src="item.data.thumbnail_url || `${require('@/assets/img/404.jpg')}`"
      lazy-src="@/assets/img/404.jpg"
      >
      <div class="vid-info pa-2">
        <div class="d-flex">
        {{item.data.title}}
        <v-spacer></v-spacer>
        <v-btn v-if="item.data.is_live"
          icon
          small
          color="twitch"
          @click.stop.prevent="pushToTwitchVids(`https://www.twitch.tv/${item.data.user_login}`,item.data.title)"><v-icon>mdi-twitch</v-icon></v-btn>
          <v-btn v-else
          small
          icon
          color="twitch"
          @click.stop.prevent="pushToTwitchVids(item.data.url,item.data.title)"><v-icon>mdi-twitch</v-icon></v-btn>
        </div>
        <div class="d-flex align-baseline pt-1 text-caption">
          <span>({{setDate(item.data.created_at)}})  [{{getDurationTime(item.data.duration)}}]</span>
          <span v-if="item.data.is_live" class="pl-1 red--text text-caption"><v-icon  color="error" small class="px-1">mdi-circle</v-icon>{{item.data.viewer_count}}</span>
          <v-spacer></v-spacer>
        </div>
      </div>
      </v-img>
      <v-img
      v-if="vids.length > 1"
      @click.stop.prevent="model = index + 1"
      class="afterVidImg rounded-lg rounded-l-0 hoverCursor"
      :max-width="imgWidth * 0.9  "
      :src="setBAVidList(index + 1).thumbnail_url || `${require('@/assets/img/404.jpg')}`"
      lazy-src="@/assets/img/404.jpg"
      >
      <div class="white--text pa-2" style="background: rgb(0,0,0,0.3)">
        <div>{{setBAVidList(index + 1).title}}</div>
        <div class="text-caption">{{setDate(setBAVidList(index + 1).created_at)}}</div>
      </div>
      </v-img>
    </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>
<script>
export default {
  props: ['vids','carsouelId'],
  data() {
    return {
      currentPage: null,
    };
  },
  methods: {
    openVidsListDialog(){
      this.$emit('openVidsListDialog')
    },
    setDate(el) {
      return this.$moment(el).format('ll');
    },
    setBAVidList(index){
      if( index === 0 || index === this.vids.length){
        return this.vids[0].data;
      } else if (index === -1){
        return this.vids[this.vids.length - 1].data;
      } else {
        return this.vids[index].data;
      }
    },
    // setThumbnailSize(el, index) {
    //   if (index === 0 || index === this.vidlist.length) {
    //     return this.vidlist[0].data.thumbnail_url;
    //   } else if (index === -1 ) {
    //     return this.vidlist[this.vidlist.length - 1].data.thumbnail_url;
    //   } else {
    //     return this.vidlist[index].data.thumbnail_url;
    //   }
    // },
    pushToTwitchVids(url, title) {
      if (window.confirm(`${title} 영상으로 이동하시겠습니까?`)) {
        window.open(url);
      }
    },
    // async getLiveThumbnail(el, index) {
    //   await axios.get('https://api.twitch.tv/helix/streams', {
    //     params: {
    //       user_login: el.data.user_login,
    //     },
    //     headers: this.$store.state.headerConfig,
    //   }).then((res) => {
    //     const width2 = /{width}/;
    //     const height2 = /{height}/;
    //     const convert = res.data.data[0].thumbnail_url.replace(width2, '480').replace(height2, '272');
    //     this.vidlist[index].data.thumbnail_url = convert;
    //     this.vidlist[index].data.is_live = res.data.data[0].type;
    //     this.vidlist[index].data.viewer_count = res.data.data[0].viewer_count;
    //   });
    // },
    getDurationTime(el) {
      const regex = /h|m|s/;
      const duration = el.split(regex);
      if (duration.length === 4) {
        if (duration[1] === '0') {
          return `${duration[0]}시간`;
        }
        return `${duration[0]}시간 ${duration[1]}분`;
      }
      if (duration.length === 3) {
        return `${duration[0]}분`;
      }

      return '1분 미만';
    },
  },
  computed:{
    model:{
      get(){
        return this.carsouelId;
      },
      set(newValue){
        this.$emit('emitVidId',newValue);
      }
    },
    imgWidth(){
      if(this.$vuetify.breakpoint.mobile){
        return '285';
      } else {
        return '480';
      }
    },
    imgHeight(){
        if(this.$vuetify.breakpoint.mobile){
          return `${285*9/16+50}`;
        } else {
          return `${480*9/16+50}`;
        }
    }
  },
  mounted() {
  },

};
</script>
<style>
.vid-info{
  position: absolute;
  top: 0;
  background: rgb(0,0,0, 0.3);
  width: 100%;
}
#urlBtn{
  padding: 0%;
  background: none;
  font-size: 0.8rem;
  color: var(--twitch-color);
}
.beforeVidImg{
  z-index: 2;
  left: -1%;
  transform: scale(0.8);
}
.afterVidImg{
  z-index: 2;
  left: 1%;
  transform: scale(0.8);

}
</style>
