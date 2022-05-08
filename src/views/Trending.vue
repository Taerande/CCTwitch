<template>
<v-container>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold pr-3">Trending</span>
  </v-row>
  <v-divider></v-divider>
  <v-row v-if="loading" class="absolute-center">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-row>
  <v-row class="pt-5" v-else-if="cliplists.length > 0 && !loading">
    <v-col cols="12" xl="2" lg="3" md="4" sm="6" xs="12" class="pa-3" v-for="item in cliplists" :key="item.id">
      <v-card dark :height="imgHeight" class="d-flex flex-row" flat @click="$router.push({path:`cliplist/${item.id}`})" :img="item.thumbnail_url" style="background-size: cover;">
        <v-card-title class="pa-0 ma-0" style="{opacity: 1, width: 0px;}">
          <div style="display:none;">{{item.title}}</div>
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
  <v-row v-else-if="cliplists.length === 0 && !loading" class="absolute-center">
    <v-alert type="error" class="rounded-xl">
      Data Not Found
    </v-alert>
  </v-row>
</v-container>

</template>

<script>
import axios from 'axios';
export default {
  components:{
  },
  data() {
    return {
      loading:false,
      cliplists:[],
    };
  },
  methods: {
    setDate(el){
      return this.$moment(el).format('l');
    },
    async loadData(){
      this.loading = true;
      const sn = await this.$firestore.collection('cliplist').orderBy("createdAt","desc").where('isPublic','==',true).get();
      this.cliplists = sn.docs.map( (v) => {
        const item = v.data();
        return {
          id: v.id,
          title: item.title,
          description: item.description,
          createdAt: item.createdAt.toDate(),
          display_name: item.authorName,
          clipIds: item.clipIds,
          color: item.color,
          thumbnail_url: item.thumbnail_url,
          clipCount: item.clipCount,
          viewCount: item.viewCount,
          likeCount: item.likeCount,
        }
      })
    },
    // async getUserInfo(item){
    //   await axios.get('https://api.twitch.tv/helix/users',{
    //       headers: this.$store.state.headerConfig,
    //       params:{
    //         id: item.userInfo.split('twitch:')[1],
    //       }
    //     }).then( res => {
    //       item.userInfo = res.data.data[0]
    //     }).then( async () => {

    //     })
    // },
    async getClipData(item){
      await axios.get('https://api.twitch.tv/helix/clips',{
        headers: this.$store.state.headerConfig,
        params:{
          id: item.cliplist[0]
        },
      }).then( (res) => {
        this.$set(item, 'thumbnail_url', res.data.data[0].thumbnail_url);
      })
    },
    textColor(el){
      return this.$store.state.darkColorSet.includes(el.substr(0,7)) ? 'white' : 'black';
    }
  },
  computed: {
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
  async mounted() {
    await this.loadData();
    // this.cliplists.forEach(async (list) => {
    // if(list.cliplist.length > 0){
    //     await this.getClipData(list);
    //   } else {
    //     this.$set(list, 'thumbnail_url', "");
    //   }
    // })
    this.loading = false;
  },
}
</script>
<style lang="scss" scoped>
.v-card__title{
  opacity: 1 !important;
  width: 200% !important;
}
</style>
