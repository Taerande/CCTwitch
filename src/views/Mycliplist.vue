<template>
<v-container fluid>
  <v-row class="py-5 align-baseline">
    <span class="text-h3 font-weight-bold pr-3">My Cliplists | {{sort}}</span>
    <v-spacer></v-spacer>
    <AddNewCliplistDialog v-if="$store.state.userinfo.userInfo" :type="{type:'add'}"></AddNewCliplistDialog>
  </v-row>
  <v-divider></v-divider>
  <v-row class="py-1">
    <v-spacer></v-spacer>
    <div>
      <clipListSortBtnVue v-if="(tabModel === 0)" :data="cliplist" @sortCliplist="sortCliplist"></clipListSortBtnVue>
      <clipListSortBtnVue v-else-if="(tabModel === 1)" :data="likedCliplist" @sortCliplist="sortlLkedCliplist"></clipListSortBtnVue>
    </div>
  </v-row>
  <v-row v-if="loading" class="absolute-center">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-flex" v-else>
    <v-tabs
      v-model="tabModel"
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
          <v-row v-if="(cliplist.length >0 && !loading)">
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
            <v-btn :loading="dataLoading" @click="getMoreDataCreated(order.data, order.sort)" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
          </v-row>
        </v-tab-item>
        <v-tab-item>
          <v-row v-if="(likedCliplist.length > 0 && !loading)">
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
            <v-btn :loading="dataLoading" @click="getMoreDataLiked(order.data, order.sort)" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
          </v-row>
        </v-tab-item>
    </v-tabs>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog';
import last from 'lodash/last';
import CliplistDefaultVue from '@/components/CliplistDefault.vue';
import clipListSortBtnVue from '@/components/clipListSortBtn.vue';


export default {
  components: {
    AddNewCliplistDialog,
    clipListSortBtnVue,
    CliplistDefaultVue,
  },
  data() {
    return {
      tabModel:0,
      lastVisible: null,
      likedLastVisible: null,
      cliplist: [],
      loading: true,
      unsubscribe: null,
      dataLoading: false,
      likedCliplist:[],
      order:{
        data:'createdAt',
        sort:'desc'
      },
      sort:'최신 순',
    };
  },
  methods: {
    async sortCliplist(el){
      this.sort = el.text;
      this.order.data = el.actions.data;
      this.order.sort = el.actions.sort;
      this.cliplist = [];
      this.lastVisible = null;
      await this.getMoreDataCreated();
    },
    async sortlLkedCliplist(el){
      this.sort = el.text;
      this.order.data = el.actions.data;
      this.order.sort = el.actions.sort;
      this.likedCliplist = [];
      this.likedLastVisible = null;
      await this.getMoreDataLiked();
    },
    async getMoreDataCreated(){
      this.dataLoading = true;
      this.loading = true;
      if(this.cliplist.length === 0) {this.lastVisible = null};
      const sn = this.lastVisible ? await this.$firestore.collection('cliplist').orderBy(this.order.data, this.order.sort).where('authorId','==',this.$store.state.userinfo.userInfo.uid).startAfter(this.lastVisible).limit(24).get() : await this.$firestore.collection('cliplist').orderBy(this.order.data, this.order.sort).where('authorId','==',this.$store.state.userinfo.userInfo.uid).limit(24).get();


      if(sn.docs.length === 24){
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
          createdAt: item.createdAt.toDate(),
          display_name: item.authorName,
          isPublic: item.isPublic,
          dataSet: item.dataSet || null,
          color: item.color,
          tags: item.tags,
          thumbnail_url: item.thumbnail_url,
          clipCount: item.clipCount,
          viewCount: item.viewCount,
          likeCount: item.likeCount,})
        })
      }
      this.dataLoading = false;
      this.loading = false;
    },
    async getMoreDataLiked(){
      this.dataLoading = true;
      this.loading = true;
      if(this.likedCliplist.length === 0) {this.likedLastVisible = null};
      const sn = this.likedLastVisible ? await this.$firestore.collection('cliplist').orderBy(this.order.data, this.order.sort).where('likeUids','array-contains',this.$store.state.userinfo.userInfo.uid).startAfter(this.likedLastVisible).limit(24).get() : await this.$firestore.collection('cliplist').orderBy(this.order.data, this.order.sort).where('likeUids','array-contains',this.$store.state.userinfo.userInfo.uid).limit(24).get();
      if(sn.docs.length === 24){
          this.likedLastVisible = last(sn.docs);
        } else {
          this.likedLastVisible = null;
        }
      if(sn.docs.length > 0){
        sn.docs.forEach(async (el) => {
          const item = el.data();
          this.likedCliplist.push({
          id: el.id,
          title: item.title,
          createdAt: item.createdAt.toDate(),
          display_name: item.authorName,
          color: item.color,
          dataSet: item.dataSet || null,
          tags: item.tags,
          isPublic: item.isPublic,
          thumbnail_url: item.thumbnail_url,
          clipCount: item.clipCount,
          viewCount: item.viewCount,
          likeCount: item.likeCount,})
          })
        }
        this.dataLoading = false;
        this.loading = false;
    },
  },
  watch:{
    async tabModel(newData){
      if(newData === 0 ){
        this.cliplist = [];
        return await this.getMoreDataCreated()}
      if(newData === 1){
        this.likedCliplist = [];
        return await this.getMoreDataLiked()}
    }
  },
  created(){
    document.title = 'My Cliplists - CCTWITCH';
  },
  async mounted() {
    const user = this.$store.state.userinfo.userInfo;
    if(user){
      const snap = await this.$firestore.collection('cliplist').orderBy(this.order.data, this.order.sort).where('authorId','==',this.$store.state.userinfo.userInfo.uid).limit(24).get();
        if(snap.docs.length === 24){
            this.lastVisible = last(snap.docs);
          } else {
            this.lastVisible = null;
          }
        if(snap.empty){
          this.cliplist = [];
          this.loading = false;
          return
        }
        snap.docs.forEach((doc) => {
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
    }
    this.loading = false;

  },
  destroyed() {
  },
};
</script>
<style lang="scss" scoped>

</style>
