<template>
<v-container>
  <v-row class="py-5 align-baseline">
    <span class="text-h3 font-weight-bold pr-3">My Cliplists</span>
    <v-spacer></v-spacer>
    <AddNewCliplistDialog v-if="$store.state.userinfo.userInfo" :type="{type:'add'}"></AddNewCliplistDialog>
  </v-row>
  <v-divider></v-divider>
  <v-row v-if="loading" class="absolute-center">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-row>
  <v-row class="d-flex pt-5" v-else>
    <v-tabs
      color="twitch"
      >
        <v-tab class="text-capitalize">
          <span>
            Created
          </span>
        </v-tab>
        <v-tab class="text-capitalize">
          <span>Liked</span>
        </v-tab>
        <v-tab-item>
          <v-divider color="twitch"></v-divider>
          <v-row class="pt-3">
            <v-spacer></v-spacer>
            <clipListSortBtnVue :data="cliplist" @sortCliplist="sortCliplist"></clipListSortBtnVue>
          </v-row>
          <v-row v-if="cliplist.length >0">
              <v-col cols="12" xl="3" lg="4" md="4" sm="6" xs="12" class="pa-3" v-for="(item,index) in cliplist" :key="item.id+index">
                <CliplistDefaultVue :item="item" :type="'mycliplist'"></CliplistDefaultVue>
              </v-col>
          </v-row>
          <v-row v-else class="d-flex justify-center align-center" style="height:50vh;">
            <v-alert type="error">
              <div>
                No Data
              </div>
            </v-alert>
          </v-row>
          <v-row v-if="lastVisible" class="d-felx justify-center">
            <v-btn :loading="dataLoading" @click="getMoreData()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
          </v-row>
        </v-tab-item>
        <v-tab-item>
          <v-divider color="twitch"></v-divider>
            <v-row class="pt-3">
            <v-spacer></v-spacer>
            <clipListSortBtnVue :data="likedCliplist" @sortCliplist="sortlLkedCliplist"></clipListSortBtnVue>
          </v-row>
          <v-row v-if="likedCliplist.length > 0">
              <v-col cols="12" xl="3" lg="4" md="4" sm="6" xs="12" class="pa-3" v-for="(item,index) in likedCliplist" :key="item.id+index">
                <CliplistDefaultVue :item="item" :type="'mycliplist'"></CliplistDefaultVue>
              </v-col>
          </v-row>
          <v-row v-else class="d-flex justify-center align-center" style="height:50vh;">
            <v-alert type="error">
              <div>
                No Data
              </div>
            </v-alert>
          </v-row>
          <v-row v-if="likedLastVisible" class="d-felx justify-center">
            <v-btn :loading="dataLoading" @click="getMoreData()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
          </v-row>
        </v-tab-item>
    </v-tabs>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog';
import { last } from 'lodash';
import CliplistDefaultVue from '../CliplistDefault.vue';
import clipListSortBtnVue from '../clipListSortBtn.vue';


export default {
  components: {
    AddNewCliplistDialog,
    clipListSortBtnVue,
    CliplistDefaultVue,
  },
  data() {
    return {
      type:'created',
      lastVisible: null,
      likedLastVisible: null,
      cliplist: [],
      loading: false,
      unsubscribe: null,
      dataLoading: false,
      likedCliplist:[],
    };
  },
  methods: {
    sortCliplist(el){
      if(el.sort === 'desc'){
        this.cliplist.sort((a,b) => b[el.data] - a[el.data])
        } else {
        this.cliplist.sort((a,b) => a[el.data] - b[el.data])
      }
    },
    sortlLkedCliplist(el){
      if(el.sort === 'desc'){
        this.likedCliplist.sort((a,b) => b[el.data] - a[el.data])
        } else {
        this.likedCliplist.sort((a,b) => a[el.data] - b[el.data])
      }
    },
     async getMoreData(){
      this.dataLoading = true;
      try{
        await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('authorId','==',this.$store.state.userinfo.userInfo.uid).startAfter(this.lastVisible).limit(12).get().then((sn) => {
          this.lastVisible = last(sn.docs);
          if(sn.docs.length > 0){
            sn.docs.forEach(async (el) => {
              const item = el.data();
              this.cliplist.push({
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
    publicIcon(el){
      if(el === 0){
        return 'mdi-eye-off'
      } else if(el === 1){
        return 'mdi-eye'
      } else {
        return 'mdi-earth'
      }


    },
    setDate(el){
      return this.$moment(el).format('l');
    },
    sorting(){
       this.cliplist.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    setData(el) {
      // await this.$store.commit('SET_currCliplist', {data:el});
      this.$router.push({ path: `cliplist/${el.id}`});
      // if (this.$store.state.currentCliplist.id === el.id) {
      //   await this.$store.commit('INIT_currCliplist');
      // } else {
      //   await this.$store.commit('SET_currCliplist', { data: el, type: 'info', text: `Cliplist : ${el.title}를 표시합니다.` });
      // }
    },

  },
  computed:{
    imgHeight(){
      if(this.$vuetify.breakpoint.mobile){
        return '200';
      } else if(this.$vuetify.breakpoint.smAndDown){
        return '225'
      } else if (this.$vuetify.breakpoint.md){
        return '175'
      } else {
        return '200'
      }
    }
  },
  async mounted() {
    if(this.unsubscribe) this.unsubscribe()
    this.loading = true;
    const user = this.$store.state.userinfo.userInfo;
    if(user){
      this.unsubscribe = await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('authorId','==',this.$store.state.userinfo.userInfo.uid).limit(12).onSnapshot( async (sn) => {
        this.lastVisible = last(sn.docs);
        if(sn.empty){
          this.cliplist = []
          return
        }
        sn.docs.forEach((doc) => {
          const exists = this.cliplist.some(item => doc.id === item.id)
          if(!exists){
            const item = doc.data();
            item.id= doc.id;
            item.createdAt= item.createdAt.toDate();
            this.cliplist.push(item)
          }
        })
        this.cliplist.sort((b,a) => {
          return a.createdAt - b.createdAt;
        })
      });
      try{
        const sn = await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('likeUids','array-contains',this.$store.state.userinfo.userInfo.uid).limit(12).get();
        this.likedLastVisible = last(sn.docs);
        if(sn.empty){
          this.likedCliplist = []
          return
        }
        sn.docs.forEach((doc) => {
          const exists = this.likedCliplist.some(item => doc.id === item.id)
          if(!exists){
            const item = doc.data();
            item.id= doc.id;
            item.createdAt= item.createdAt.toDate();
            this.likedCliplist.push(item)
          }
        })
        this.likedCliplist.sort((b,a) => {
          return a.createdAt - b.createdAt;
        })
      }
      catch{
        (err) => {
          console.log(err);
        }
      }
    }
    this.loading = false;
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
  },
};
</script>
<style lang="scss" scoped>

// .cliplist-canvas{
//   cursor: pointer;
//   border-radius: 3%;
//   box-sizing: border-box;
//   margin: 0;
//   padding: 0;
//   opacity: 0.5 !important;
//   border: 1px ;
// }
// .cliplist-canvas:hover{
//   transform: scale(1.05) !important;
//   opacity: 1 !important;
//   transition: all 0.1s;
//   transition-timing-function: ease;
// }
.custom5cols {
  // width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}
// .sortBtn{
//   position:absolute;
//   right:0;
//   z-index: 3;
// }
</style>
