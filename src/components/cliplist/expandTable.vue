<template>
<v-row class="d-block py-3">
  <draggable
  v-if="$store.state.userinfo.userInfo && $store.state.userinfo.userInfo.uid === clipListData.authorId && clipListData.dataSet === undefined" v-model="currentCliplist"
  handle=".handle" ghost-class="ghost" @change="changeIndex" chosen-class="chosen" drag-class="drag">
    <v-col cols="12" v-for="(clip, index) in currentCliplist" :key="index">
      <ClipIframeDataTableDialog  :clipData="clip.clipData" :index="index" :clipListData="clipListData" :listData="AllCliplists"></ClipIframeDataTableDialog>
      <v-divider class="my-1"></v-divider>
      <v-col cols="12" class="d-flex justify-center" v-if="index&7 === 1">
        <DisplyaAdContainerVue></DisplyaAdContainerVue>
      </v-col>
    </v-col>
  </draggable>
  <v-row class="d-flex col-12" v-else-if="clipListData.dataSet !== undefined">
    <v-row class="d-flex col-12"  v-for="(chunk, index) in tempArrChunk" :key="index">
      <v-col cols="12" class="pa-1"
        v-for="(clip,startIndex) in chunk"
        :key="clip.id"
        >
        <ClipIframeDataTableDialog  :clipData="clip" :index="index*10+startIndex" :clipListData="clipListData" :listData="AllCliplists"></ClipIframeDataTableDialog>
        <v-divider class="my-1"></v-divider>
      </v-col>
      <v-col cols="12" class="d-flex justify-center" v-if="chunk.length === 10">
        <DisplyaAdContainerVue></DisplyaAdContainerVue>
      </v-col>
    </v-row>
  </v-row>
  <v-row class="d-flex col-12" v-for="(chunk, index) in cliplistChunk" :key="index" v-else>
    <v-col cols="12" class="pa-1"
      v-for="(clip,startIndex) in chunk"
      :key="clip.id"
      >
      <ClipIframeDataTableDialog  :clipData="clip.clipData" :index="index*10+startIndex" :clipListData="clipListData" :listData="AllCliplists"></ClipIframeDataTableDialog>
      <v-divider class="my-1"></v-divider>
    </v-col>
    <v-col cols="12" class="d-flex justify-center" v-if="chunk.length === 10">
      <DisplyaAdContainerVue></DisplyaAdContainerVue>
    </v-col>
  </v-row>
</v-row>
</template>

<script>
import ClipIframeDataTableDialog from '../dialog/ClipIframeDataTableDialog';
import draggable from 'vuedraggable'
import DisplyaAdContainerVue from '../DisplyaAdContainer.vue';
import { chunk } from 'lodash';

export default {
  props:['clipListData','tempArr'],
  components: {
    ClipIframeDataTableDialog,
    draggable,
    DisplyaAdContainerVue,
  },
  data() {
    return {
      AllCliplists:[],
    };
  },
  methods: {
    async changeIndex(e){
      let batch = this.$firestore.batch();
      let tempDate = 0;
      const data = await e.moved
      const isLast = this.currentCliplist[data.newIndex + 1] === undefined;
      let target = await this.$firestore.collection('cliplist').doc(this.$route.params.id);

      if(data.newIndex === 0){
        tempDate = await this.currentCliplist[1].fireData.createdAt - 10;
      } else if (isLast) {
        tempDate = await this.currentCliplist[data.newIndex - 1].fireData.createdAt + 10;
      } else {
       tempDate = await (this.currentCliplist[data.newIndex - 1].fireData.createdAt + this.currentCliplist[data.newIndex + 1].fireData.createdAt)/2;
      }

      if(data.newIndex ===0 ){
        batch.update(target.collection('clips').doc(data.element.fireData.clipId),{
          createdAt: tempDate
        });
        batch.update(target,{
          thumbnail_url: data.element.clipData.thumbnail_url
        });
        await batch.commit().then(() => {
        this.$store.commit('UPDATE_Firedata',{index:data.newIndex, createdAt:tempDate})
      }).catch((err)=> {
        this.$store.commit('SET_SnackBar',{type:'error', text:`${err.message}`, value:true})
      });
      } else {
        batch.update(target.collection('clips').doc(data.element.fireData.clipId),{
          createdAt: tempDate
        });
        await batch.commit().then(() => {
        this.$store.commit('UPDATE_Firedata',{index:data.newIndex, createdAt:tempDate})
      }).catch((err)=> {
        this.$store.commit('SET_SnackBar',{type:'error', text:`${err.message}`, value:true})
      });
      }
    },
  },
  computed: {
    cliplistChunk(){
      return chunk(Object.values(this.currentCliplist),10);
    },
    tempArrChunk(){
      return chunk(Object.values(this.tempArr),10);
    },
    currentCliplist:{
      get(){
        return this.$store.state.currentCliplist
      },
      set(value){
        this.$store.commit('SET_CurrentClipList', value);
      }
    },
  },
  async mounted() {
    if(this.$store.state.userinfo.userInfo){
      this.unsubscribe = await this.$firestore.collection('cliplist').where('authorId','==',this.$store.state.userinfo.userInfo.uid).onSnapshot((sn) => {
        if(sn.empty){
          this.AllCliplists = [];
          return
        }
        this.AllCliplists = sn.docs.map( v => {
          const item = v.data()
          return {
            id: v.id,
            title: item.title,
            createdAt: item.createdAt,
            color: item.color,
            clipCount: item.clipCount,
            clipIds: item.clipIds,
          }
        })
      this.AllCliplists.sort((a,b) => b.createdAt - a.createdAt);
      });
    }
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe();
    this.$store.commit('SET_CurrentClipList',[]);
  },
};
</script>
<style lang="scss" scoped>
.ghost {
  opacity: 0 !important;
}
</style>
