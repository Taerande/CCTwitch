<template>
<v-row class="py-3 red">
  <v-divider class="my-3"></v-divider>
  <draggable
  v-if="$store.state.userinfo.userInfo && $store.state.userinfo.userInfo.uid === clipListData.authorId" v-model="currentCliplist"
  handle=".handle" ghost-class="ghost" @change="changeIndex" chosen-class="chosen" drag-class="drag">
    <v-col cols="12" v-for="(clip, index) in currentCliplist" :key="index">
    <div>{{clip}}</div>
      <!-- <ClipIframeDataTableDialog  :clipData="clip.clipData" :index="index" :clipListData="clipListData" :listData="AllCliplists"></ClipIframeDataTableDialog> -->
      <v-divider class="my-3"></v-divider>
    </v-col>
  </draggable>
    <v-col v-else cols="12" class="ma-2" v-for="(clip, index) in currentCliplist" :key="index">
        <!-- <ClipIframeDataTableDialog  :clipData="clip.clipData" :index="index" :clipListData="clipListData" :listData="AllCliplists"></ClipIframeDataTableDialog> -->
      <v-divider class="my-3"></v-divider>
    </v-col>
</v-row>
</template>

<script>
import axios from 'axios';
import ClipIframeDataTableDialog from '../dialog/ClipIframeDataTableDialog';
import draggable from 'vuedraggable'
export default {
  props:['clipListData'],
  components: {
    // ClipIframeDataTableDialog,
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
    viewerkFormatter(el) {
      const num = el.toString();
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(num.length - 9, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`;
      }
      return Math.abs(num);
    },
    updateData(el) {
      const idList = [];
      el.pinnedClips.forEach((element) => {
        idList.push(element.id);
      });
      axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          id: idList,
          first: 100,
        },
      }).then((res) => {
        this.$store.commit('UPDATE_pinndedClip', res.data.data);
      });
    },
    compareArray(a, b) {
      const result = a.length === b.length && a.every((value) => b.includes(value));
      return result;
    },
    sortByViews() {
      this.page = 1;
      if (this.viewSort === 'asc') {
        this.viewSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'views', order: 'desc' });
      } else {
        this.viewSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'views', order: 'asc' });
      }
    },
    sortByCreated() {
      this.page = 1;
      if (this.createdSort === 'asc') {
        this.createdSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'created', order: 'desc' });
      } else {
        this.createdSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'created', order: 'asc' });
      }
    },
    sortByName() {
      this.page = 1;
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'name', order: 'desc' });
      } else {
        this.nameSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'name', order: 'asc' });
      }
    },
    resetData() {
      this.$store.commit('SET_currCliplist', { data: '' });
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
