<template>
<v-container fluid fill-height>
  <v-row class="d-flex pb-5 justify-center">
    <span class="text-h4" :style="{color:result.color}">{{result.title}}</span>
    <span class="d-flex text-caption align-end pl-1">({{result.pinnedClips.length}}개)</span>
  </v-row>
  <v-row>
    <v-expansion-panels class="pa-10 mx-10 pt-0">
      <v-expansion-panel
        v-for="(item,i) in setCurrList(result.pinnedClips)"
        :key="i"
      >
        <v-expansion-panel-header
        @click="changeId(item.embed_url)">
          <v-container>
            <v-row>
              <div id="thumbArea">
                <v-img sizes="max-height:50px;" :src="item.thumbnail_url"></v-img>
              </div>
              <div class="d-flex align-center">
                <span class="pr-3">제목 : {{item.title}}</span>
                <span class="pr-3">채널 : {{item.broadcaster_name}}</span>
                <span class="pr-3">조회수 : {{item.view_count}}</span>
              </div>
            </v-row>
          </v-container>
        </v-expansion-panel-header>
        <v-expansion-panel-content v-if="current === item.embed_url">
          <v-container class="d-flex justify-center">
            <iframe
                class="black"
                :src="`${current}&parent=localhost`"
                preload="auto"
                frameborder="0"
                height="300"
                width="500"
                allowfullscreen="true"></iframe>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
   <v-row class="d-flex justify-center pt-5">
    <v-pagination
    color="twitch"
    v-model="page"
    :total-visible="7"
    :length="Math.ceil(result.pinnedClips.length / this.perPage)">
    </v-pagination>
  </v-row>
</v-container>
</template>
<script>
export default {
  props: ['result'],
  data(){
    return{
      page: 1,
      current:'',
      perPage:10,

    }
  },
  methods: {
    changeId(el){
      if(el === this.current){
        this.current = '';
        } else{
        this.current = el;
      }
    },
     setCurrList(el){
      return el.slice((this.page-1)*this.perPage, this.page*this.perPage);
    },
  },

}
</script>
<style lang="scss" scoped>
#thumbArea{
  height: 50px !important;
  width: 80px !important;
}
</style>
