<template>
<v-container v-if="loading">
  <v-row class="pb-5">
    <v-col>Trending Page</v-col>
  </v-row>
  <v-row>
    <v-btn color="success" @click="loadData">Load Data</v-btn>
    <AddNewCliplistDialog></AddNewCliplistDialog>
  </v-row>
  <v-row class="pt-15">
    <v-col cols="3" class="pa-3" v-for="item in items" :key="item.id">
      <v-card outlined @click="$router.push({path:`clip/${item.id}`})">
        <v-card-title class="d-flex">
          <div>
            {{item.title}}
          </div>
          <v-spacer></v-spacer>
          <div>
            {{setDate(item.createdAt)}}
          </div>
        </v-card-title>
        <v-progress-linear value="100" :color="item.color"></v-progress-linear>
        <v-card-text>
          <div class="d-flex align-center py-3">
            <v-avatar
              size="24">
              <img
              :src="item.userInfo.profile_image_url" lazy-src="@/assets/img/404.jpg">
            </v-avatar>
            {{item.userInfo.display_name}}
            <v-spacer></v-spacer>
            <span class="text-caption --text mx-3">
              <v-icon small>mdi-playlist-play</v-icon>
              {{item.cliplist.length}}
            </span>
            <span class="text-caption --text">
              <v-icon small>mdi-thumb-up-outline</v-icon>
              {{item.cliplist.length}}
            </span>
          </div>
          <v-list v-if="item.cliplist.length > 0">
            <v-list-item v-for="clip in item.clip" :key="clip.id">
              <v-card light>
                <v-card-title primary-title>
                  {{clip.title}}
                </v-card-title>
                <v-card-text>
                  <span>
                    {{clip.desc}}
                  </span>
                  <span class="error--text">
                    {{clip.offset}}
                  </span>
                </v-card-text>
              </v-card>
            </v-list-item>
          </v-list>
          <v-alert v-else type="error" class="rounded-xl">
            <span>
              저장된 클립이 없습니다.
            </span>
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>

<v-container v-else fluid fill-height>
  <v-progress-circular class="absolute-center" color="twitch" size="60" width="6" indeterminate></v-progress-circular>
</v-container>
</template>

<script>
import axios from 'axios';
import AddNewCliplistDialog from '../components/dialog/AddNewCliplistDialogFirebase';
export default {
  components:{
    AddNewCliplistDialog,
  },
  data() {
    return {
      loading:false,
      items:null,
    };
  },
  methods: {
    setDate(el){
      return this.$moment(el).format('lll');
    },
    async loadData(){
      const sn = await this.$firestore.collection('cliplist').where('isPublic','==',true).orderBy("createdAt","desc").get();
      this.items = await sn.docs.map( v => {
        const item = v.data();
        return {
          id: v.id,
          title: item.title,
          description: item.description,
          createdAt: item.createdAt.toDate(),
          userInfo: item.authorId,
          cliplist: item.cliplist,
          color: item.color
        }
      })
    },
    async getUserInfo(item){
      await axios.get('https://api.twitch.tv/helix/users',{
          headers: this.$store.state.headerConfig,
          params:{
            id: item.userInfo.split('twitch:')[1],
          }
        }).then( res => {
          item.userInfo = res.data.data[0]
        });
    }
  },
  async created() {
    await this.loadData();
    this.items.forEach((item) => {
      this.getUserInfo(item);
    })
    this.loading = true;
  },
}
</script>
<style lang="scss">

</style>
