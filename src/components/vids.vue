<template>
  <v-carousel
    v-model="model"
    height="inherit"
    :aspect-ratio="16/9"
    hide-delimiters
    v-if="vidlist.length > 0"
  >
    <v-carousel-item
      full-width
      v-ripple="false"
      v-for="(item, index) in vidlist"
      :key="index"
      transition="none"
    >
      <!-- :aspect-ratio="16/9" -->
    <v-sheet
    class="d-flex justify-center align-center pa-2 rounded-lg"
    :color="$vuetify.theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'">
     <v-img
      @click.stop.prevent="index===0 ? model = vidlist.length-1 : model = index - 1"
      class="beforeVidImg rounded-lg rounded-r-0 hoverCursor"
      :max-width="imgWidth * 0.9"
      height="80%"
      :src="setThumbnailSize(item.data.thumbnail_url, index- 1) || '@/assets/img/404.jpg'"
      lazy-src="@/assets/img/404.jpg"
      >
      <div class="white--text pa-2" style="background: rgb(0,0,0,0.3)">
        <div>{{setBAVidList(index - 1).title}}</div>
        <div class="text-caption">{{setDate(setBAVidList(index - 1).created_at)}}</div>
      </div>
      </v-img>
      <div class="white--text elevation-12" style="position: relative;">
        <v-img
        class="hoverCursor"
        :max-width="imgWidth"
        height="100%"
        @click="openVidsListDialog"
        :src="setThumbnailSize(item.data.thumbnail_url, index*1) || '@/assets/img/404.jpg'"
        lazy-src="@/assets/img/404.jpg"
        >
        </v-img>
        <div class="vid-info pa-2">
          <div>
          {{item.data.title}}
          </div>
          <div class="d-flex align-baseline pt-1 text-caption">
            <span>({{setDate(item.data.created_at)}})  [{{getDurationTime(item.data.duration)}}]</span>
            <span v-if="item.data.is_live" class="pl-1 red--text text-caption"><v-icon  color="error" small class="px-1">mdi-circle</v-icon>{{item.data.viewer_count}}</span>
            <v-spacer></v-spacer>
            <v-btn v-if="item.data.is_live"
            small
            id="urlBtn"
            class="white--text"
            color="twitch"
            @click.stop.prevent="pushToTwitchVids(`https://www.twitch.tv/${item.data.user_login}`,item.data.title)">이동</v-btn>
            <v-btn v-else
            small
            class="white--text"
            color="twitch"
            id="urlBtn"
            @click.stop.prevent="pushToTwitchVids(item.data.url,item.data.title)">이동</v-btn>
          </div>
        </div>
      </div>
       <v-img
        @click.stop.prevent="model = index + 1"
        class="afterVidImg rounded-lg rounded-l-0 hoverCursor"
        :max-width="imgWidth * 0.9"
        height="80%"
        :src="setThumbnailSize(item.data.thumbnail_url, index + 1) || '@/assets/img/404.jpg'"
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
  <div v-else class="d-flex align-center text-h4" style="height: 30vh;">
    😅There is no Vids
  </div>
</template>
<script>
import axios from 'axios';

export default {
  props: ['vids','carsouelId'],
  data() {
    return {
      vidlist: [],
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
      if( index === 0 || index === this.vidlist.length)
      {return this.vidlist[0].data;}
      else if (index === -1){
        return this.vidlist[this.vidlist.length - 1].data;
      } else {
        return this.vidlist[index].data;
      }
    },
    setThumbnailSize(el, index) {
      const width = /%{width}/;
      const height = /%{height}/;
      if(el === '') {
        this.getLiveThumbnail(this.vidlist[0], 0);
        return this.vidlist[0].data.thumbnail_url;
      }
      else if (index === 0 || index === this.vidlist.length) {
        return this.vidlist[0].data.thumbnail_url.replace(width, '480').replace(height, '272');
      } else if (index === -1 ) {
        return this.vidlist[this.vidlist.length - 1].data.thumbnail_url.replace(width, '480').replace(height, '272');
      } else {
        return this.vidlist[index].data.thumbnail_url.replace(width, '480').replace(height, '272');
      }
    },
    pushToTwitchVids(url, title) {
      if (window.confirm(`${title} 영상으로 이동하시겠습니까?`)) {
        window.open(url);
      }
    },
    async getLiveThumbnail(el, index) {
      await axios.get('https://api.twitch.tv/helix/streams', {
        params: {
          user_login: el.data.user_login,
        },
        headers: this.$store.state.headerConfig,
      }).then((res) => {
        const width2 = /{width}/;
        const height2 = /{height}/;
        const convert = res.data.data[0].thumbnail_url.replace(width2, '480').replace(height2, '272');
        this.vidlist[index].data.thumbnail_url = convert;
        this.vidlist[index].data.is_live = res.data.data[0].type;
        this.vidlist[index].data.viewer_count = res.data.data[0].viewer_count;
      });
    },
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
        return '400';
      }
    }
  },
  mounted() {
    this.vidlist = this.vids;
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
