<template>
  <v-container fluid>
    <v-row class="pt-5">
      <v-col class="d-flex justify-center">
        <span class="twitch--text display-3 font-weight-black">
          CCTWITCH
        </span>
      </v-col>
    </v-row>
    <v-row class="text-center justify-center align-center pb-5">
      <v-col cols="12">
        <div class="d-flex justify-center align-center">
          <h2 class="display-1 font-weight-bold">
            Find Streamer
          </h2>
          <h2 class="display-1 font-weight-bold px-1">
            &
          </h2>
          <h2 class="display-1 font-weight-bold">
            Collect Clip
          </h2>
        </div>
      </v-col>
      <Search class="pt-6"></Search>
    </v-row>
    <InArticleAdContainerVue></InArticleAdContainerVue>
    <div class="d-flex align-center">
      <span>Live Stream - {{lang}}</span>
      <v-spacer></v-spacer>
      <v-btn color="twitch" @click="refresh()" icon><v-icon>mdi-refresh</v-icon></v-btn>
    </div>
    <v-divider class="my-1"></v-divider>
    <v-row class="d-flex col-12" v-if="streamingList.length > 0 && loading">
      <v-col v-for="item in streamingList" :key="item.id+item.user_login" cols="6" xl="2" lg="3" md="4" sm="6" class="pa-2" :title="item.title">
        <v-card
        flat class="pa-0" :to="{name: 'Channel', query:{
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
                  <div class="white--text rounded-lg px-1 text-caption ma-1" style="background-color: rgba( 0, 0, 0, 0.5 )"><v-icon color="red" x-small>mdi-eye</v-icon> {{item.viewer_count | commaCase}}</div>
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
    </v-row>
    <v-row class="d-flex col-12" v-else>
      <v-col class="pa-2" cols="6" xl="2" lg="3" md="4" sm="6" v-for="(item, idx) in  skeletonCount" :key="idx">
        <v-skeleton-loader
        type="image, list-item-two-line"
      ></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row class="d-flex pt-3">
      <div class="text-h3 font-weight-bold">
        <div>
          <span class="twitch--text text-h2 font-weight-bold">C</span>lip
        </div>
        <div>
          <span class="twitch--text text-h2 font-weight-bold">C</span>ollector for
        </div>
        <div>
          <span class="twitch--text text-h2 font-weight-bold">TWITCH</span>
        </div>
      </div>
    </v-row>
    <InArticleAdContainerVue></InArticleAdContainerVue>
  </v-container>
</template>

<script>

import axios from 'axios';
import Search from '../components/Search';
import InArticleAdContainerVue from '../components/InArticleAdContainer.vue';
export default {
  name: 'Home',

  components: {
    Search,
    InArticleAdContainerVue,
  },
  data() {
    return {
      cursor:null,
      streamingList:[],
      data:[],
      loading:false,
      dataLoading:false,
      dbLoading:false,
      time:'',
    };
  },
  methods: {
    setThumbnailSize(el) {
      return el.split('{width}x{height}')[0]+'300x172.jpg';
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
        this.streamingList = res.data.data
        this.cursor = res.data.pagination.cursor;
        this.dataLoading = false;
      }).catch(async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getLiveStreamWithLang();
        }
      })
    },
    getDurationTimeToSec(el) {
      let hour = el.split('h')[0]*3600;
      let min = el.split('h')[1].split('m')[0]*60;
      let sec = el.split('m')[1].split('s')[0]*1;
      return hour+min+sec;
    },
    async refresh(){
      this.cursor = null;
      this.streamingList = [];
      await this.getLiveStreamWithLang();
    },
  },
  computed:{
    skeletonCount(){
      if(this.$vuetify.breakpoint.smAndDown){
        return 12;
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
    document.title = 'CCTwitch - Twitch Clip Collector';
    await this.getLiveStreamWithLang();
    this.loading = true;
  },
  destroyed() {
    this.streamingList = [];
  },
};
</script>
