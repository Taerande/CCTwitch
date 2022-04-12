<template>
  <v-carousel
    v-model="model"
    max-height="600"
    :aspect-ratio="16/9"
    hide-delimiters
    v-if="vidlist.length > 0"
  >
    <v-carousel-item
      v-for="(item, index) in vidlist"
      :key="index"
      :aspect-ratio="16/9"
      lazy-src="@/assets/img/404.jpg"
      :src="setThumbnailSize(item.data.thumbnail_url, index*1) || '@/assets/img/404.jpg'"
      @click="openVidsListDialog"
    >
    <v-sheet
    class="pa-5"
    color="rgba(0,0,0,0.3)">
      <div class="white--text">
        <div>
        {{item.data.title}}
        </div>
        <div class="d-flex justify-between align-baseline pt-1">
          <span>({{setDate(item.data.created_at)}})  [{{getDurationTime(item.data.duration)}}]</span>
          <span v-if="item.data.is_live" class="pl-1 red--text text-caption">OnAir</span>
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
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    setThumbnailSize(el, index) {
      if (el === '') {
        this.getLiveThumbnail(this.vidlist[index], index);
        return this.vidlist[index].data.thumbnail_url;
      }
      const width = /%{width}/;
      const height = /%{height}/;
      return el.replace(width, '1280').replace(height, '720');
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
        const convert = res.data.data[0].thumbnail_url.replace(width2, '600').replace(height2, '400');
        this.vidlist[index].data.thumbnail_url = convert;
        this.vidlist[index].data.is_live = res.data.data[0].type;
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
  },
  mounted() {
    this.vidlist = this.vids;
  },

};
</script>
<style>
#urlBtn{
  padding: 0%;
  background: none;
  font-size: 0.8rem;
  color: var(--twitch-color);
}
</style>
