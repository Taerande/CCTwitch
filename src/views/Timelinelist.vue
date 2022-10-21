<template>
<v-container fluid>
  <v-row class="py-5 align-baseline">
    <span class="text-h3 font-weight-bold pr-3">Timeline | {{this.$route.query.broadcaster === undefined ? 'ALL' : this.$route.query.broadcaster}} </span>
  </v-row>
  <v-divider></v-divider>
  <v-row class="d-block">
    <div class="text-caption">
      *Timeline: 다시보기에서 인기 클립들을 추출해 시간순으로 재정리한 클립 모음입니다.
    </div>
    <div class="text-caption">
      *Streamer 검색 후 해당 채널을 통해 Timeline을 생성할 수 있습니다.
    </div>
  </v-row>
  <v-row class="d-flex mx-auto py-6 justify-center align-center" style="width:70%;">
    <v-text-field
      hide-details="auto"
      color="twitch"
      type="text"
      prepend-inner-icon="mdi-magnify"
      label="Please input streamer login id."
      @keyup.enter="getNewData(streamer)"
      v-model="streamer"
    >
    <template v-slot:append>
      <v-btn :loading="dbloading" :disabled="streamer.length === 0" color="twitch" text @click="getNewData(streamer)" class="text-caption white--text" small>search</v-btn>
    </template>
    </v-text-field>
  </v-row>
  <InArticleAdContainerVue></InArticleAdContainerVue>
  <v-btn class="pa-2 ma-0" color="twitch" small text @click="getNewData('')">show all</v-btn>
  <v-row v-if="loading" class="d-flex justify-center" style="height:30vh;">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-block justify-center" v-else>
    <v-divider></v-divider>
    <v-divider></v-divider>
    <v-divider></v-divider>
    <v-row class="d-flex justify-center">
      <v-data-table
      :loading="dataTableLoading"
      style="width:100%"
      dense
      :headers="headers"
      :items="timelines"
      :items-per-page="30"
      item-key="name"
      hide-default-footer
      mobile-breakpoint="0"
      disable-sort
    >
    <template v-slot:item.vidCreatedAt="{item}">
    <div>
      <span class="text-caption">{{item.vidCreatedAt}}</span>
    </div>
    </template>
    <template v-slot:item.broadcaster="{item}">
    <div>
      <span class="pr-1 twitch--text" @click="toChannel(item.broadcaster)">{{item.broadcaster}}</span>
    </div>
    </template>
    <template v-slot:item.title="{item}">
    <div class="pt-1">
      <span class="twitch--text hoverCursor" @click="toTimeline(item.id)">{{item.title}}</span>
      <span v-if="!$vuetify.breakpoint.smAndDown" class="pl-2 grey--text text-caption">updated:{{item.updatedAt}}</span>
    </div>
    <div v-if="$vuetify.breakpoint.smAndDown" class="d-flex text-caption py-1">
      <div class="text-caption grey--text">updated:{{item.updatedAt}}</div>
      <div class="px-1"><v-icon class="pr-1" x-small>mdi-movie-open-outline</v-icon>{{item.clipCount}}</div>
    </div>
    </template>
    <template v-slot:item.broadcaster="{item}">
    <span class="twitch--text hoverCursor" @click="toChannel(item.broadcaster)">{{item.broadcaster}}</span>
    </template>
    <template v-slot:item.vidCreatedAt="{item}">
    <div class="d-flex text-caption justify-center">
      <span>{{item.vidCreatedAt}}</span>
    </div>
    </template>
    <template v-slot:no-data>
      <div>
        😫No Data
      </div>
      <div>
        Search Streamer and Create Timeline first.
      </div>
    </template>
    </v-data-table>
    </v-row>
    <v-divider></v-divider>
    <v-row class="d-flex justify-space-between pa-3">
      <v-btn small text :loading="dbloading" :disabled="firstVisible === null" color="twitch" @click="getPrevData(streamer)"><v-icon small>mdi-chevron-double-left</v-icon>prev</v-btn>
      <v-btn small text :loading="dbloading" :disabled="lastVisible === null" color="twitch" @click="getNextData(streamer)">next<v-icon small>mdi-chevron-double-right</v-icon></v-btn>
    </v-row>
  </v-row>
  <InArticleAdContainerVue></InArticleAdContainerVue>
</v-container>
</template>

<script>

import { last, head } from 'lodash';
import InArticleAdContainerVue from '../components/InArticleAdContainer.vue';

export default {
  components: {
    InArticleAdContainerVue,
  },
  data() {
    return {
      dataTableLoading: false,
      streamer:'',
      page:1,
      lastVisible: null,
      firstVisible: null,
      loading:false,
      dbloading:false,
      pageCount:0,
      timelines:[],
      firstElement: null,
    };
  },
  computed:{
    headers(){
      return this.$vuetify.breakpoint.smAndDown ?
          [
            { text: 'Broadcaster', value: 'broadcaster', align: 'center',divider: true},
            { text: 'Details', value: 'title', align: 'start', divider: true,},
            { text: 'Created', value: 'vidCreatedAt', align: 'center' }
          ] :
          [
            { text: 'Broadcaster', value: 'broadcaster', align: 'start'},
            { text: 'Title', value: 'title', align: 'start'},
            { text: 'Clips', value: 'clipCount', align: 'center' },
            { text: 'Created', value: 'vidCreatedAt', align: 'center' }

          ]
        }
  },
  methods:{
    async getNextData(streamer){
      this.dbloading = true;
      const sn = streamer === '' ? await this.$firestore.collection('timeline').orderBy('vidCreated','desc').startAfter(this.lastVisible).limit(30).get() : await this.$firestore.collection('timeline').orderBy('vidCreated','desc').where('broadcaster','==',this.streamer).startAfter(this.lastVisible).limit(30).get();

      if(sn.docs.length === 30){
        this.lastVisible = last(sn.docs);
        this.firstVisible = head(sn.docs);
      } else {
        this.lastVisible = null;
        this.firstVisible = head(sn.docs);
      }
      this.timelines = [];
      sn.docs.forEach( (el) => {
      const item = el.data();
      this.timelines.push({
        id: el.id,
        clipCount: item.clipCount,
        title: item.vidTitle,
        viewCount: item.viewCount,
        createdAt: item.createdAt.toDate(),
        updatedAt: this.$moment(item.updatedAt.toDate()).fromNow(),
        vidCreatedAt: this.$moment(item.vidCreated.toDate()).format('MM/DD'),
        broadcaster: item.broadcaster,
        thumbnail_url: item.thumbnail_url,
      })
    })
    this.dbloading = false;
    window.scrollTo(0,0);
    },
    async getPrevData(streamer){
      this.dbloading = true;
      const sn = streamer === '' ? await this.$firestore.collection('timeline').orderBy('vidCreated','desc').endBefore(this.firstVisible).limitToLast(30).get() : await this.$firestore.collection('timeline').orderBy('vidCreated','desc').where('broadcaster','==',this.streamer).endBefore(this.firstVisible).limitToLast(30).get();

      if(sn.docs.length === 30){
        this.lastVisible = last(sn.docs);
        this.firstVisible = sn.docs[0].id === this.firstElement ? null : head(sn.docs);
      } else {
        this.firstVisible = head(sn.docs);
        this.lastVisible = null;
      }
      this.timelines = [];
      sn.docs.forEach( (el) => {
      const item = el.data();
      this.timelines.push({
        id: el.id,
        clipCount: item.clipCount,
        title: item.vidTitle,
        viewCount: item.viewCount,
        createdAt: item.createdAt.toDate(),
        updatedAt: this.$moment(item.updatedAt.toDate()).fromNow(),
        vidCreatedAt: this.$moment(item.vidCreated.toDate()).format('MM/DD'),
        broadcaster: item.broadcaster,
        thumbnail_url: item.thumbnail_url,
      })
    })
    this.dbloading = false;
    window.scrollTo(0,0);
    },
    async getNewData(streamer){
      if(streamer === ''){
        this.$router.replace({query:null}).catch(()=>{});
        this.timelines = [];
        this.lastVisible = null;
        this.firstVisible = null;
        this.loading = true;
        this.streamer = '';
        document.title = 'ALL | Timelines - CCTWITCH';

        const sn = await this.$firestore.collection('timeline').orderBy('vidCreated','desc').limit(30).get();

        if(sn.docs.length === 30){
          this.lastVisible = last(sn.docs);
        } else {
          this.lastVisible = null;
        }
        if(sn.docs[0] === undefined){
          this.timelines = [];
          this.$store.commit('SET_SnackBar',{type:'error', text:'Find Streamer & Create Timeline first!', value:true});
          this.$store.commit('SET_SearchBar',true);
          this.loading = false;
          return
        }
        this.firstElement = sn.docs[0].id;


        sn.docs.forEach( (el) => {
          const item = el.data();
          this.timelines.push({
            id: el.id,
            clipCount: item.clipCount,
            title: item.vidTitle,
            viewCount: item.viewCount,
            createdAt: item.createdAt.toDate(),
            updatedAt: this.$moment(item.updatedAt.toDate()).fromNow(),
            vidCreatedAt: this.$moment(item.vidCreated.toDate()).format('MM/DD'),
            broadcaster: item.broadcaster,
            thumbnail_url: item.thumbnail_url,
          })
        })
        this.loading = false
      } else {
        this.$router.replace({query:{
        broadcaster: streamer,
      }}).catch(()=>{});
      }
    },
    toTimeline(el){
      this.$router.push({path:`/timeline/${el}`}).catch(()=>{});
    },
    toChannel(el){
      this.streamer = el;
      this.getNewData(el);
    },
  },
  async created(){
    this.loading = true;
    this.streamer = this.$route.query.broadcaster === undefined ? '' : this.$route.query.broadcaster;
    document.title = `${this.streamer === '' ? 'ALL' : this.streamer} | Timelines - CCTWITCH`;

    const sn = this.streamer === '' ? await this.$firestore.collection('timeline').orderBy('vidCreated','desc').limit(30).get() : await this.$firestore.collection('timeline').orderBy('vidCreated','desc').where('broadcaster','==',this.streamer).limit(30).get();

    if(sn.docs.length === 30){
      this.lastVisible = last(sn.docs);
    } else {
      this.lastVisible = null;
    }
    if(sn.docs[0] === undefined){
      this.timelines = [];
      this.$store.commit('SET_SnackBar',{type:'error', text:'Find Streamer & Create Timeline first!', value:true});
      this.$store.commit('SET_SearchBar',true);
      this.loading = false;
      return
    }

    this.firstElement = sn.docs[0].id;


    sn.docs.forEach( (el) => {
      const item = el.data();
      this.timelines.push({
        id: el.id,
        clipCount: item.clipCount,
        title: item.vidTitle,
        viewCount: item.viewCount,
        createdAt: item.createdAt.toDate(),
        updatedAt: this.$moment(item.updatedAt.toDate()).fromNow(),
        vidCreatedAt: this.$moment(item.vidCreated.toDate()).format('MM/DD'),
        broadcaster: item.broadcaster,
        thumbnail_url: item.thumbnail_url,
      })
    })
    // }
    this.loading = false
  },
   mounted() {
  },
  destroyed() {
  },
};
</script>
<style lang="scss">
.trpadding{
  padding: 0 !important;
}

</style>
