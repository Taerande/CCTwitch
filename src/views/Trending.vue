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
    <v-col cols="12" xl="3" lg="4" md="4" sm="6" xs="12" class="pa-2" v-for="item in cliplists" :key="item.id">
      <CliplistDefaultVue :item="item"></CliplistDefaultVue>
    </v-col>
  </v-row>
  <v-row v-else-if="cliplists.length === 0 && !loading" class="absolute-center">
    <v-alert type="error" class="rounded-xl">
      Data Not Found
    </v-alert>
  </v-row>
  <v-row v-if="lastVisible" class="d-felx justify-center">
    <v-btn :loading="dataLoading" @click="getMoreData()" block color="twitch" dark><v-icon>mdi-chevron-down</v-icon>더 보기</v-btn>
  </v-row>
</v-container>

</template>

<script>
import { last } from 'lodash';
import axios from 'axios';
import CliplistDefaultVue from '@/components/CliplistDefault.vue';

export default {
  components:{
    CliplistDefaultVue,
  },
  data() {
    return {
      lastVisible: null,
      loading:false,
      cliplists:[],
      dataLoading: false,
    };
  },
  methods: {
    async getMoreData(){
      this.dataLoading = true;
      try{
        await this.$firestore.collection('cliplist').orderBy('createdAt','desc').where('isPublic','==',2).startAfter(this.lastVisible).limit(12).get().then((sn) => {
          this.lastVisible = last(sn.docs);
          if(sn.docs.length > 0){
            sn.docs.forEach(async (el) => {
              const item = el.data();
              this.cliplists.push({
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
    setDate(el){
      return this.$moment(el).format('l');
    },
    async loadData(){
      this.loading = true;
      try{
        const sn = await this.$firestore.collection('cliplist').orderBy("createdAt","desc").where('isPublic','==',2).limit(12).get();

        this.lastVisible = last(sn.docs);

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
            tags: item.tags,
            thumbnail_url: item.thumbnail_url,
            clipCount: item.clipCount,
            viewCount: item.viewCount,
            likeCount: item.likeCount,
          }
        })
      }
      catch(err){
        console.log(err);
        this.$store.commit('SET_SnackBar',{type:'error', text:`${err.message}`, value:true});
      }

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
        return '200';
      } else if(this.$vuetify.breakpoint.smAndDown){
        return '225'
      } else if (this.$vuetify.breakpoint.md){
        return '150'
      } else {
        return '200'
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
