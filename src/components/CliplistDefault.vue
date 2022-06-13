<template>
<div>
  <v-card elevation="5" class="ma-0 pa-0 rounded-lg" flat :to="item.dataSet ? {name:'SpecialList', params:{ id:item.id }} : {name:'Cliplist', params:{id:item.id}}">
    <v-card-text class="d-flex justify-center pa-0 ma-0">
      <v-img :src="item.thumbnail_url ? `${item.thumbnail_url}` : `${require('@/assets/img/404.jpg')}`" lazy-src="@/assets/img/404.jpg" class="rounded-lg">
        <v-container class="d-flex justify-end" fluid fill-height>
          <div class="d-flex justify-center align-center" :style="{background:item.color.substr(0,7)+'80', color:'white', width:'30%', height:'100%'}">
          <div class="d-flex flex-column align-center">
          <v-icon color="white" class="text-stroke">mdi-playlist-play</v-icon>
          <span class="text-stroke">{{item.clipCount}}</span>
          <v-icon v-if="type" color="white" class="text-stroke">{{publicIcon(item.isPublic)}}</v-icon>
        </div></div>
        </v-container>
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
    <span class="text-caption pr-3">
      <v-icon small>mdi-thumb-up</v-icon>
      {{item.likeCount}}</span>
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
</div>
</template>
<script>
export default {
  props:['item','type'],
  methods: {
    publicIcon(el){
        if(el === 0){
          return 'mdi-eye-off'
        } else if(el === 1){
          return 'mdi-eye'
        } else {
          return 'mdi-earth'
        }
      },
  },
}
</script>
<style>

</style>
