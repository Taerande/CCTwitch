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
  <v-row class="d-flex pt-10" v-else-if="cliplist.length > 0 && !loading">
    <v-col cols="12" xl="3" lg="4" md="4" sm="6" xs="12" class="pa-3" v-for="(item,index) in cliplist" :key="item.id+index">
      <v-card dark :height="imgHeight" class="d-flex flex-row" flat @click="$router.push({path:`cliplist/${item.id}`})" :img="item.thumbnail_url" style="background-size: cover;">
        <v-card-title class="pa-0 ma-0" style="{opacity: 1, width: 0px;}">
        </v-card-title>
        <v-card-text class="d-flex justify-center align-center pa-0" :style="{background:item.color.substr(0,7)+'66', color: 'white'}">
          <div class="d-flex flex-column align-center">
            <v-icon color="white">mdi-playlist-play</v-icon>
            <span class="py-1">{{item.clipCount}}</span>
            <v-icon>{{publicIcon(item.isPublic)}}</v-icon>
          </div>
        </v-card-text>
      </v-card>
      <div class="py-1">
        <span>{{item.title}}</span>
      </div>
      <div class="d-flex">
        <span class="text-subtitle">{{item.display_name}}</span>
        <v-spacer></v-spacer>
        <div class="d-flex align-center pr-3">
          <v-icon class="pr-1" small>mdi-thumb-up-outline</v-icon>
          <span class="text-subtitle">{{item.likeCount}}</span>
        </div>
        <span class="text-subtitle">{{setDate(item.createdAt)}}</span>
      </div>
      <v-divider></v-divider>
    </v-col>
  </v-row>
  <v-row v-else-if="cliplist.length === 0 && !loading" class="absolute-center">
    <v-alert type="error">
      Data Not Found
    </v-alert>
  </v-row>
  <v-row v-if="lastVisible" class="d-felx justify-center">
    <v-btn :loading="dataLoading" @click="getMoreData()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog';
import { last } from 'lodash';

export default {
  components: {
    AddNewCliplistDialog,
  },
  data() {
    return {
      lastVisible: null,
      cliplist: [],
      loading: false,
      unsubscribe: null,
      dataLoading: false,
    };
  },
  methods: {
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
      return this.$moment(el).format('llll');
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
  async created() {
    if(this.unsubscribe) this.unsubscribe()
    this.loading = true;
    await this.$firebase.auth().onAuthStateChanged( async (user) => {
      this.$store.commit('SET_UserInfo',user)
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
          // this.cliplist = await sn.docs.map( v => {
          //   const item = v.data()
          //   return {
          //     id: v.id,
          //     title: item.title,
          //     description: item.description,
          //     createdAt: item.createdAt.toDate(),
          //     display_name: item.authorName,
          //     authorId: item.authorId,
          //     clipIds: item.clipIds,
          //     isPublic: item.isPublic,
          //     color: item.color,
          //     thumbnail_url: item.thumbnail_url,
          //     clipCount: item.clipCount,
          //     viewCount: item.viewCount,
          //     likeCount: item.likeCount,
          //   }
          // });
        });
      }
    });
    this.loading = false;
  },
  mounted() {
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
.v-card__title{
  opacity: 1 !important;
  width: 200% !important;
}

</style>
