<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold pr-3">Trending</span>
  </v-row>
  <div class="d-flex align-center pb-2">
    <v-icon class="pr-2">mdi-label-multiple-outline</v-icon>
    <v-chip class="d-flex align-center text-caption chipPill mx-1" :to="'/tag/트위치KR 핫클립'">
      트위치KR 핫클립
    </v-chip>
    <v-chip class="d-flex align-center text-caption chipPill mx-1" :to="'/tag/주간 이세돌 핫클립'">
      주간 이세돌 핫클립
    </v-chip>
  </div>
  <v-divider></v-divider>
  <v-subheader>Clips</v-subheader>
  <hotclipVue></hotclipVue>
  <v-divider class="my-3"></v-divider>
  <InArticleAdContainerVue></InArticleAdContainerVue>
  <v-subheader>Cliplist</v-subheader>
  <v-row v-if="loading" class="d-flex justify-center" style="height:30vh;">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-flex pt-5 col-12" v-else-if="cliplists.length > 0 && !loading">
    <v-row class="d-flex col-12" v-for="(chunk, index) in cliplistChunk" :key="index">
      <v-col cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2" v-for="(item, startIndex) in chunk.slice(0,index%7+4)" :key="item.id+startIndex">
        <CliplistDefaultVue :item="item"></CliplistDefaultVue>
      </v-col>
      <v-col
        v-if="chunk.length > index%7+4"
        cols="12" xl="3" lg="4" md="4" sm="12" class="pa-2">
          <InArticleAdsense
            data-ad-client="ca-pub-8597405222136575"
            data-ad-slot="9638127425"
            data-ad-format="fluid"
            ins-style="display:block;text-align:center;width:inherit;"
            ></InArticleAdsense>
      </v-col>
      <v-col cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2" v-for="(item, endIndex) in chunk.slice(index%7+4)" :key="item.id+endIndex">
        <CliplistDefaultVue :item="item"></CliplistDefaultVue>
      </v-col>
    </v-row>
    <v-row v-if="lastVisible" class="d-flex justify-center py-3">
      <v-btn :loading="dataLoading" @click="getMoreData()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
    </v-row>
  </v-row>
  <v-row v-else-if="cliplists.length === 0 && !loading" class="absolute-center">
    <v-alert type="error">
      공유된 클립모음이 없습니다.
    </v-alert>
  </v-row>
  <InArticleAdContainerVue></InArticleAdContainerVue>
</v-container>

</template>

<script>
import last from 'lodash/last';
import chunk from 'lodash/chunk';
import CliplistDefaultVue from '@/components/CliplistDefault.vue';
import hotclipVue from '../components/Trending/HotClipList.vue';
import InArticleAdContainerVue from '../components/InArticleAdContainer.vue';

export default {
  components:{
    InArticleAdContainerVue,
    CliplistDefaultVue,
    hotclipVue,
  },
  data() {
    return {
      limit:11,
      lastVisible: null,
      loading:true,
      cliplists:[],
      dataLoading: false,
    };
  },
  computed:{
    cliplistChunk(){
      return chunk(Object.values(this.cliplists),11);
    }
  },
  methods: {
    async getMoreData(){
      this.dataLoading = true;
      try{
        await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('isPublic','==',2).startAfter(this.lastVisible).limit(this.limit).get().then((sn) => {
          if(sn.docs.length === this.limit){
              this.lastVisible = last(sn.docs);
            } else {
              this.lastVisible = null;
            }
          if(sn.docs.length > 0){
            sn.docs.forEach(async (el) => {
              const item = el.data();
              this.cliplists.push({
              id: el.id,
              title: item.title,
              description: item.description,
              createdAt: item.createdAt.toDate(),
              display_name: item.authorName,
              clipIds: item.clipIds,
              color: item.color,
              tags: item.tags,
              dataSet: item.dataSet,
              thumbnail_url: item.thumbnail_url,
              clipCount: item.clipCount,
              viewCount: item.viewCount,
              likeCount: item.likeCount,})
            })
          }else {
            this.$store.commit('SET_SnackBar',{type:'error', text:`No More Data`, value:true});
          }
        }).then(() => {
          this.dataLoading = false;
        })
      } catch(err){
        this.$store.commit('SET_SnackBar',{type:'error', text:`No More Data`, value:true});
        this.dataLoading = false;
      }

    },
    async loadData(){
      this.loading = true;
      try{
        const sn = await this.$firestore.collection('cliplist').orderBy("createdAt","desc").where('isPublic','==',2).limit(this.limit).get();
        if(sn.docs.length === this.limit){
            this.lastVisible = last(sn.docs);
          } else {
            this.lastVisible = null;
          }
        if(sn.empty){
          this.cliplists = []
          this.loading = false;
          return
        }
        this.cliplists = sn.docs.map( (v) => {
          const item = v.data();
          return {
            id: v.id,
            title: item.title,
            createdAt: item.createdAt.toDate(),
            display_name: item.authorName,
            color: item.color,
            tags: item.tags,
            dataSet: item.dataSet ? 'Yes' : null,
            thumbnail_url: item.thumbnail_url,
            clipCount: item.clipCount,
            viewCount: item.viewCount,
            likeCount: item.likeCount,
          }
        })
      }
      catch(err){
        console.log(err);
        this.$store.commit('SET_SnackBar',{type:'error', text:`${err.message}`, value:true});
      }

    },
  },
  async mounted() {
    document.title = 'Trending - CCTWITCH'
    await this.loadData();
    this.loading = false;
  },
}
</script>
<style lang="scss" scoped>
.v-card__title{
  opacity: 1 !important;
  width: 200% !important;
}
</style>
