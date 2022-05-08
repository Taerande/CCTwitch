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
    <v-col cols="12" xl="2" lg="3" md="4" sm="6" xs="12" class="pa-3" v-for="item in cliplist" :key="item.id">
      <v-card dark :height="imgHeight" class="d-flex flex-row" flat @click="$router.push({path:`cliplist/${item.id}`})" :img="item.thumbnail_url" style="background-size: cover;">
        <v-card-title class="pa-0 ma-0" style="{opacity: 1, width: 0px;}">
          <div class="mx-auto"><v-icon :color="item.isPublic ? 'info' : 'error'">{{item.isPublic ? 'mdi-earth' : 'mdi-lock'}}</v-icon></div>
        </v-card-title>
        <v-card-text class="d-flex justify-center align-center pa-0" :style="{background:item.color.substr(0,7)+'66', color: 'white'}">
          <div class="d-flex flex-column align-center">
            <v-icon color="white">mdi-playlist-play</v-icon>
            <span>{{item.clipCount}}</span>
          </div>
        </v-card-text>
      </v-card>
      <div class="d-flex">
        <span class="text-caption">{{item.display_name}}</span>
        <v-spacer></v-spacer>
        <span class="text-caption">{{setDate(item.createdAt)}}</span>
      </div>
      <div>
        <span>{{item.title}}</span>
      </div>
    </v-col>
  </v-row>
  <v-row v-else-if="cliplist.length === 0 && !loading" class="absolute-center">
    <v-alert type="error">
      Data Not Found
    </v-alert>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog';

export default {
  components: {
    AddNewCliplistDialog,
  },
  data() {
    return {
      cliplist: [],
      loading: false,
      unsubscribe: null,
    };
  },
  methods: {
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
        return '250';
      } else if(this.$vuetify.breakpoint.smAndDown){
        return '225'
      } else if (this.$vuetify.breakpoint.md){
        return '175'
      } else {
        return '150'
      }

    }
  },
  async created() {
    this.loading = true;
    await this.$firebase.auth().onAuthStateChanged( async (user) => {
      if(user){
        this.unsubscribe = await this.$firestore.collection('cliplist').where('authorId','==',user.uid).onSnapshot( async (sn) => {
          if(sn.empty){
            this.cliplist = []
            return
          }
          this.cliplist = await sn.docs.map( v => {
            const item = v.data()
            return {
              id: v.id,
              title: item.title,
              description: item.description,
              createdAt: item.createdAt.toDate(),
              display_name: item.authorName,
              authorId: item.authorId,
              clipIds: item.clipIds,
              isPublic: item.isPublic,
              color: item.color,
              thumbnail_url: item.thumbnail_url,
              clipCount: item.clipCount,
              viewCount: item.viewCount,
              likeCount: item.likeCount,
            }
          });
          this.cliplist.sort((a,b) => b.createdAt - a.createdAt);
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
