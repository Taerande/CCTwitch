<template>
<v-container fluid>
  <v-row v-if="!loading" class="d-flex justify-center">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-flex pt-5 col-12" v-else-if="hotclips.length > 0 && loading">
    <v-col cols="12" xl="3" lg="4" md="4" sm="6" class="pa-2" v-for="(item) in hotclips" :key="item.id">
      <v-card :to="{path:`/hotclip/${item.id}`,params:{title:item.title}}" flat>
        <v-card-text class="pa-0 ma-0">
          <v-img
          class="rounded-lg"
          :src="item.thumbnail_url"
          lazy-src="@/assets/img/404.jpg"
          >
          </v-img>
        </v-card-text>
      </v-card>
      <div class="d-flex text-truncate align-center py-1" style="width:inherit">
        <span class="text-truncate">{{item.title}}</span>
      </div>
      <v-divider></v-divider>
      <div class="d-flex text-truncate align-center pt-1" style="width:inherit">
        <span class="text-truncate font-weight-bold text-body-2">{{item.authorName ? item.authorName : item.display_name}}</span>
        <v-spacer></v-spacer>
        <span class="text-caption pr-2">
          <v-icon small>mdi-thumb-up</v-icon>
        {{item.likeCount}}</span>
        <span class="text-caption pr-2">
          <v-icon small>mdi-eye</v-icon>
        {{item.viewCount}}</span>
        <span class="text-caption pr-2">
          <v-icon small>mdi-comment-multiple</v-icon>
        {{item.commentCount}}</span>
        <span class="text-caption">{{ $moment(item.createdAt).format('l') }}</span>
      </div>
      <div v-if="item.tags.length > 0"  class="d-flex">
        <v-chip-group column>
          <v-chip v-for="tag in item.tags" :key="tag" class="d-flex ma-1 chipPill" :to="'/tag/'+tag">
            <span class="text-caption">
              {{tag}}
            </span>
          </v-chip>
        </v-chip-group>
      </div>
    </v-col>
    <v-col cols="12" v-if="lastVisible">
      <v-btn :loading="dataLoading" @click="getMoreData()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
    </v-col>
  </v-row>
  <v-row v-else class="d-flex justify-center">
    <v-alert type="error">
      There is no Hot Clip!
    </v-alert>
  </v-row>
</v-container>
</template>
<script>

import { last } from 'lodash'

export default {
  data() {
    return {
      loading: false,
      hotclips:[],
      dataLoading:false,
      lastVisible:null,
    }
  },
  methods: {
    async getMoreData(){
      this.dataLoading = true;
      try{
        await this.$firestore.collection('hotclip').orderBy('createdAt','desc').startAfter(this.lastVisible).limit(12).get().then((sn) => {
          if(sn.docs.length === 12){
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


  },
  async created() {
    const sn = await this.$firestore.collection('hotclip').orderBy('createdAt','desc').limit(12).get();
    if(sn.docs.length === 12){
        this.lastVisible = last(sn.docs);
      } else {
        this.lastVisible = null;
      }
    if(sn.empty){
      this.hotclips = []
      this.loading = true;
      return
    }
    sn.docs.forEach(el => {
      const item = el.data();
      this.hotclips.push({
        id: el.id,
        authorName: item.authorName,
        broadcaster_id: item.broadcaster_id,
        commentCount: item.commentCount,
        likeCount: item.likeCount,
        viewCount: item.viewCount,
        createdAt: item.createdAt.toDate(),
        tags: item.tags,
        title: item.title,
        thumbnail_url: item.thumbnail_url
      })

    });
    this.loading = true;
  },

}
</script>
<style>

</style>
