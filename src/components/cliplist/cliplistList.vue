<template>
<v-container fluid>
  <v-row class="py-5 align-baseline">
    <span class="text-h3 font-weight-bold pr-3">My Cliplists</span>
    <v-spacer></v-spacer>
    <AddNewCliplistDialog v-if="$store.state.userinfo.userInfo" :type="{type:'add'}"></AddNewCliplistDialog>
  </v-row>
  <v-divider></v-divider>
  <v-row v-if="loading" class="absolute-center">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
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
          <v-row class="d-flex align-center pt-3">
            <v-spacer></v-spacer>
            <clipListSortBtnVue :data="cliplist" @sortCliplist="sortCliplist"></clipListSortBtnVue>
          </v-row>
          <v-row v-if="cliplist.length >0">
              <v-col cols="12" xl="3" lg="4" md="4" sm="6" class="pa-3" v-for="(item,index) in cliplist" :key="item.id+index">
                <CliplistDefaultVue :item="item" :type="'mycliplist'"></CliplistDefaultVue>
              </v-col>
          </v-row>
          <v-row v-else class="d-flex justify-center align-center" style="height:50vh;">
            <v-alert type="error">
              😨 생성된 클립모음이 없습니다.
            </v-alert>
          </v-row>
          <v-row v-if="lastVisible" class="d-felx justify-center">
            <v-btn :loading="dataLoading" @click="getMoreDataCreated()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
          </v-row>
        </v-tab-item>
        <v-tab-item>
            <v-row class="pt-3">
            <v-spacer></v-spacer>
            <clipListSortBtnVue :data="likedCliplist" @sortCliplist="sortlLkedCliplist"></clipListSortBtnVue>
          </v-row>
          <v-row v-if="likedCliplist.length > 0">
              <v-col cols="12" xl="3" lg="4" md="4" sm="6" class="pa-3" v-for="(item,index) in likedCliplist" :key="item.id+index">
                <CliplistDefaultVue :item="item" :type="'mycliplist'"></CliplistDefaultVue>
              </v-col>
          </v-row>
          <v-row v-else class="d-flex justify-center align-center" style="height:50vh;">
            <v-alert type="error">
              😨 좋아요를 누른 클립모음이 없습니다.
            </v-alert>
          </v-row>
          <v-row v-if="likedLastVisible" class="d-felx justify-center">
            <v-btn :loading="dataLoading" @click="getMoreDataLiked()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
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
      lastVisible: null,
      likedLastVisible: null,
      cliplist: [],
      loading: true,
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
    async getMoreDataCreated(){
      this.dataLoading = true;
      try{
        await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('authorId','==',this.$store.state.userinfo.userInfo.uid).startAfter(this.lastVisible).limit(20).get().then((sn) => {
          if(sn.docs.length === 20){
              this.lastVisible = last(sn.docs);
            } else {
              this.lastVisible = null;
            }
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
    async getMoreDataLiked(){
      this.dataLoading = true;
      try{
        await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('likeUids','array-contains',this.$store.state.userinfo.userInfo.uid).startAfter(this.likedLastVisible).limit(20).get().then((sn) => {
          if(sn.docs.length === 20){
              this.likedLastVisible = last(sn.docs);
            } else {
              this.likedLastVisible = null;
            }
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
  },
  computed:{
  },
  created(){
    document.title = 'My Cliplists - CCTWITCH';
  },
  async mounted() {
    if(this.unsubscribe) this.unsubscribe()
    const user = this.$store.state.userinfo.userInfo;
    if(user){
      this.unsubscribe = await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('authorId','==',this.$store.state.userinfo.userInfo.uid).limit(20).onSnapshot( async (sn) => {
        if(sn.docs.length === 20){
            this.lastVisible = last(sn.docs);
          } else {
            this.lastVisible = null;
          }
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
        if(sn.docs.length === 20){
            this.likedLastVisible = last(sn.docs);
          } else {
            this.likedLastVisible = null;
          }
        if(sn.empty){
          this.likedCliplist = []
          this.loading = false;
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
      this.loading = false;
    }

  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
  },
};
</script>
<style lang="scss" scoped>

</style>
