<template>
  <v-container fluid>
    <v-row class="pt-10">
      <v-col class="d-flex justify-center">
        <span class="twitch--text display-3 font-weight-black">
          CCTWITCH
        </span>
      </v-col>
    </v-row>
    <v-row class="text-center justify-center align-center pb-5">
      <v-col cols="12">
        <div class="d-flex justify-center">
          <h1 class="display-1 font-weight-bold">
            Find Streamer & Collect Clip
          </h1>
        </div>
      </v-col>
      <Search class="pt-6"></Search>
    </v-row>
    <DisplyaAdContainerVue></DisplyaAdContainerVue>
    <div class="d-flex align-center">
      <span>Live Stream - {{lang}}</span>
    </div>
    <v-divider class="my-1"></v-divider>
    <v-row class="d-flex col-12" v-if="streamingList.length > 0 && loading">
      <v-col v-for="item in streamingList" :key="item.id" cols="6" xl="2" lg="3" md="4" sm="6" class="pa-2">
        <v-card flat class="pa-0" :to="{name: 'Channel', query:{
            q: item.user_login
          }}">
          <v-card-text class="pa-0">
              <v-img
              class="hoverCursor"
              :src="setThumbnailSize(item.thumbnail_url)"
              lazy-src="@/assets/img/404.jpg"
              >
              <v-container fluid fill-height class="d-flex align-content-space-between">
                <v-row>
                  <span class="text-caption white--text px-1 rounded-lg ma-1" style="background-color: rgba( 0, 0, 0, 0.5 )">{{$moment(item.started_at).fromNow()}}</span>
                </v-row>
                <v-spacer></v-spacer>
                <v-row>
                  <div class="white--text rounded-lg px-1 text-caption ma-1" style="background-color: rgba( 0, 0, 0, 0.5 )"><v-icon color="red" x-small>mdi-eye</v-icon> {{viewerkFormatter(item.viewer_count)}}</div>
                </v-row>
              </v-container>
            </v-img>
          </v-card-text>
        </v-card>
        <div class="text-subtitle-2 text-truncate py-1">
          <span class="text-truncate">{{item.user_name}}({{item.user_login}})</span>
        </div>
        <div class="text-caption text-truncate">
          <span>{{item.title}}</span>
        </div>
      </v-col>
      <v-btn :loading="dataLoading" @click="getLiveStreamWithLang()" color="twitch" class="white--text" small block><v-icon small color="white">mdi-chevron-double-down</v-icon>더 보기</v-btn>
    </v-row>
    <v-row class="d-flex col-12" v-else>
      <v-col class="pa-2" cols="6" xl="2" lg="3" md="4" sm="6" v-for="(item, idx) in  skeletonCount" :key="idx">
        <v-skeleton-loader
        type="image, list-item-two-line"
      ></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row class="d-flex pt-3 px-3">
      <div class="text-h2 font-weight-bold">
        <div>
          <span class="twitch--text text-h1 font-weight-bold">C</span>lip
        </div>
        <div>
          <span class="twitch--text text-h1 font-weight-bold">C</span>ollector for
        </div>
        <div>
          <span class="twitch--text text-h1 font-weight-bold">TWITCH</span>
        </div>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import Search from '../components/Search';
import DisplyaAdContainerVue from '../components/DisplyaAdContainer.vue';
export default {
  name: 'Home',

  components: {
    DisplyaAdContainerVue,
    Search,
  },
  data() {
    return {
      cursor:null,
      streamingList:[],
      data:[],
      loading:false,
      dataLoading:false,
    };
  },
  methods: {
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
    setThumbnailSize(el) {
      return el.split('{width}x{height}')[0]+'480x272.jpg';
    },
    async getLiveStreamWithLang(){
      this.dataLoading = true;
      await axios.get('https://api.twitch.tv/helix/streams',{
        headers:this.$store.state.headerConfig,
        params:{
          language: navigator.language.split('-')[0],
          first: 24,
          after: this.cursor,
        }
      }).then(res => {
        this.streamingList.push(...res.data.data);
        this.cursor = res.data.pagination.cursor;
        this.dataLoading = false;
      })

    }
  },
  computed:{
    skeletonCount(){
      if(this.$vuetify.breakpoint.smAndDown){
        return 6;
      } else if(this.$vuetify.breakpoint.mdAndDown) {
        return 18;
      } else {
        return 24;
      }
    },
    lang(){
      let languageNames = new Intl.DisplayNames([`${navigator.language.split('-')[0]}`], {type: 'language'});
      return languageNames.of(`${navigator.language.split('-')[0]}`);
    }

  },
  async mounted(){
    document.addEventListener('DOMContentLoaded', (e) => {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }, false)
    await this.getLiveStreamWithLang();
    this.loading = true;
    document.title = 'Welcome CCTWITCH'
  }
};
</script>
