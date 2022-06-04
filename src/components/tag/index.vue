<template>
<v-container>
  <v-row class="d-flex align-center py-5">
    <div class="text-h3 font-weight-bold pr-3">
      Tag |
    </div>
    <div class="text-h4 font-weight-bold">
      {{this.$route.params.id}}
    </div>
  </v-row>
  <v-divider></v-divider>
  <v-subheader>Created Cliplist</v-subheader>
  <v-row v-if="loading" class="absolute-center">
    <div class="d-flex justify-center">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  </v-row>
   <v-row v-else-if="cliplists.length === 0 && !loading" class="absolute-center">
    <v-alert type="error">
      공유된 클립모음이 없습니다.
    </v-alert>
  </v-row>
  <v-row v-else>
    <v-col cols="12" xl="3" lg="4" md="4" sm="6" xs="12" v-for="(item, index) in cliplists" :key="index">
    <CliplistDefaultVue :item="item"></CliplistDefaultVue>
    </v-col>
  </v-row>
  <v-row v-if="lastVisible" class="d-felx justify-center">
    <v-btn :loading="dataLoading" @click="getMoreData()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
  </v-row>
</v-container>
</template>
<script>
import CliplistDefaultVue from '../CliplistDefault.vue';

export default {
  components:{
    CliplistDefaultVue
  },
  data() {
    return {
      lastVisible: null,
      cliplists:[],
      dataLoading:false,
      loading:false,
    }
  },
  methods: {
    async getMoreData(){
      this.dataLoading = true;
      try{
        await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('isPublic','==',2).startAfter(this.lastVisible).limit(20).get().then((sn) => {
          if(sn.docs.length === 20){
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
              thumbnail_url: item.thumbnail_url,
              clipCount: item.clipCount,
              viewCount: item.viewCount,
              likeCount: item.likeCount})
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

  },
  async created() {

    this.loading = true;
    document.title = `${this.$route.params.id} | Tag - CCTWITCH`
    const sn = await this.$firestore.collection('cliplist').where('tags','array-contains',this.$route.params.id).where('isPublic','==',2).orderBy('createdAt','desc').limit(20).get();
    if(sn.docs.length === 20){
        this.lastVisible = last(sn.docs);
      } else {
        this.lastVisible = null;
      }
    this.cliplists = sn.docs.map( (v) => {
          const item = v.data();
          return {
            id: v.id,
            title: item.title,
            description: item.description,
            createdAt: item.createdAt.toDate(),
            display_name: item.authorName,
            clipIds: item.clipIds,
            tags: item.tags,
            color: item.color,
            thumbnail_url: item.thumbnail_url,
            clipCount: item.clipCount,
            viewCount: item.viewCount,
            likeCount: item.likeCount,
          }
        })

    this.loading = false;
  },

}
</script>
<style lang="scss" scoped>
</style>
