<template>
<v-row class="d-block py-3">
  <draggable
  v-if="$store.state.userinfo.userInfo && $store.state.userinfo.userInfo.uid === clipListData.authorId" v-model="currentCliplist"
  handle=".handle" ghost-class="ghost" @change="changeIndex" chosen-class="chosen" drag-class="drag">
    <v-col cols="12" v-for="(clip, index) in currentCliplist" :key="index">
      <ClipIframeDataTableDialog  :clipData="clip.clipData" :index="index" :clipListData="clipListData" :listData="AllCliplists"></ClipIframeDataTableDialog>
      <v-divider class="my-2"></v-divider>
    </v-col>
  </draggable>
    <v-col v-else cols="12" v-for="(clip, index) in currentCliplist" :key="index">
        <ClipIframeDataTableDialog  :clipData="clip.clipData" :index="index" :clipListData="clipListData" :listData="AllCliplists"></ClipIframeDataTableDialog>
      <v-divider class="my-2"></v-divider>
      <v-card>
        <Adsense
          data-ad-client="ca-pub-8597405222136575"
          data-ad-slot="5644022389"
          data-ad-format="auto"
          data-full-width-responsive="true"
          ins-style="display:inline-block;background:red;"
        ></Adsense>
      </v-card>

    </v-col>
</v-row>
</template>

<script>
import ClipIframeDataTableDialog from '../dialog/ClipIframeDataTableDialog';
import draggable from 'vuedraggable'
export default {
  props:['clipListData'],
  components: {
    ClipIframeDataTableDialog,
    draggable,
  },
  data() {
    return {
      AllCliplists:[],
      vidIndex: 0,
      currentTooltipId: '',
      tableloading: false,
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
      page: 1,
      tempDate:0,
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
    currentCliplist:{
      get(){
        return this.$store.state.currentCliplist
      },
      set(value){
        this.$store.commit('SET_CurrentClipList', value);
      }
    },
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
    listColor(){
      return this.clipListData.color;
    }
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
            description: item.description,
            createdAt: item.createdAt,
            color: item.color,
            clipCount: item.clipCount,
            clipIds: item.clipIds,
          }
        })
      });
    }
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
  },
};
</script>
<style lang="scss" scoped>
.ghost {
  opacity: 0 !important;
}

</style>
