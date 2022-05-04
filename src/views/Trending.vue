<template>
<v-container>
  <v-row class="pb-5">
    <span class="text-h3 font-weight-bold pr-3">Trending</span>
  </v-row>
  <v-row v-if="loading" class="absolute-center">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-row>
  <v-row class="pt-15" v-else-if="cliplists.length > 0 && !loading">
    <v-col cols="12" xl="2" lg="3" md="4" sm="6" xs="12" class="pa-3" v-for="item in cliplists" :key="item.id">
      <v-card dark height="150" class="d-flex flex-row" flat @click="$router.push({path:`clip/${item.id}`})" :img="item.thumbnail_url" style="background-size: cover;">
        <v-card-title class="pa-0 ma-0" style="{opacity: 1, width: 0px;}">
          <div style="display:none;">{{item.title}}</div>
        </v-card-title>
        <v-card-text class="d-flex justify-center align-center pa-0" :style="{background:item.color.substr(0,7)+'66', color: 'white'}">
          <div class="d-flex flex-column align-center">
            <v-icon color="white">mdi-playlist-play</v-icon>
            <span>{{item.cliplist.length}}</span>
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
      const sn = await this.$firestore.collection('cliplist').where('isPublic','==',true).orderBy("createdAt","desc").get();
      this.cliplists = await sn.docs.map( v => {
        const item = v.data();
        return {
          id: v.id,
          title: item.title,
          description: item.description,
          createdAt: item.createdAt.toDate(),
          display_name: item.authorName,
          cliplist: item.cliplist,
          color: item.color
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
  async mounted() {
    await this.loadData();
    this.cliplists.forEach(async (list) => {
    if(list.cliplist.length > 0){
        await this.getClipData(list);
      } else {
        this.$set(list, 'thumbnail_url', "");
      }
    })
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
