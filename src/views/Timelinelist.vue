<template>
<v-container fluid>
  <v-row class="py-5 align-baseline">
    <span class="text-h3 font-weight-bold pr-3">Timeline | {{currentStreamer || 'ALL'}} </span>
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
      color="twitch"
      prepend-inner-icon="mdi-magnify"
      label="Please input streamer login id."
      v-model="streamer"
    >
    <template v-slot:append>
      <v-btn :disabled="streamer.length === 0" :loading="dbloading" color="twitch" text @click="getNewData(streamer)" class="text-caption white--text" small>search</v-btn>
    </template>
    </v-text-field>
  </v-row>
  <v-btn class="pa-2 ma-0" color="twitch" small text @click="getNewData()">show all</v-btn>
  <v-row v-if="loading" class="absolute-center">
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
      :page.sync="page"
      :items-per-page="100"
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
    <template v-slot:item.title="{item}">
    <div class="pt-1">
      <span class="twitch--text hoverCursor" @click="toTimeline(item.id)">{{item.title}} <span class="px-1 text-caption grey--text">updated:{{item.updatedAt}}</span></span>
    </div>
    <div v-if="$vuetify.breakpoint.smAndDown" class="d-flex text-caption pb-1">
      <div class="pr-1 twitch--text" @click="toChannel(item.broadcaster)">{{item.broadcaster}}</div>|
      <div class="px-1">{{item.updatedAt}}</div>|
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
    </template>
    </v-data-table>
    </v-row>
  </v-row>
</v-container>
</template>

<script>

// import { last } from 'lodash';
export default {
  components: {
  },
  data() {
    return {
      dataTableLoading: false,
      streamer:'',
      page:1,
      lastVisible: null,
      loading:false,
      dbloading:false,
      pageCount:0,
      timelines:[],
      currentStreamer:'',
    };
  },
  computed:{
    headers(){
      return this.$vuetify.breakpoint.smAndDown ?
          [
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
  methods: {
    // async getNextData(el){

    //   // const sn = await this.$firestore.collection('timeline').where('broadcaster','==',this.streamer).orderBy('vidCreated','desc').startAfter(this.lastVisible).limit(30).get();
    //   const sn = await this.$firestore.collection('timeline').orderBy('vidCreated','desc').startAfter(this.lastVisible).limit(30).get();

    //   console.log(sn);
    //   if(sn.docs.length === 30){
    //     this.lastVisible = last(sn.docs);
    //   } else {
    //     this.lastVisible = null;
    //   }
    //   sn.docs.forEach( (el) => {
    //   const item = el.data();
    //   this.timelines.push({
    //     id: el.id,
    //     clipCount: item.clipCount,
    //     title: item.vidTitle,
    //     viewCount: item.viewCount,
    //     createdAt: item.createdAt.toDate(),
    //     updatedAt: this.$moment(item.updatedAt.toDate()).fromNow(),
    //     vidCreatedAt: this.$moment(item.vidCreated.toDate()).format('MM/DD'),
    //     broadcaster: item.broadcaster,
    //     thumbnail_url: item.thumbnail_url,
    //   })
    // })
    // this.page += 1;
    // },
    // async getPrevData(){
    //   if(this.page === 1 ){
    //     return;
    //   }
    //   this.page -= 1;

    // },
    async getNewData(streamer){
      this.timelines = [];
      this.loading = true;
      this.dbloading = true;
      this.currentStreamer = streamer;
      if(streamer === undefined){
        const sn = await this.$firestore.collection('timeline').orderBy('vidCreated','desc').limit(100).get();
        sn.docs.forEach( (el,idx) => {
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
      this.loading = false;
      this.dbloading = false;
      } else {
        const sn = await this.$firestore.collection('timeline').orderBy('vidCreated','desc').where('broadcaster','==',this.streamer).limit(100).get();
        sn.docs.forEach( (el,idx) => {
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
      this.loading = false;
      this.dbloading = false;
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
    document.title = 'Timelines - CCTWITCH';
      const sn = await this.$firestore.collection('timeline').orderBy('vidCreated','desc').limit(100).get();

      // if(sn.docs.length === 30){
      //   this.lastVisible = last(sn.docs);
      // } else {
      //   this.lastVisible = null;
      // }
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
