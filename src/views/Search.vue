<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold pr-3">Search | {{this.$route.query.q}}</span>
  </v-row>
  <v-divider></v-divider>
  <v-row v-if="!dataLoading" class="d-flex justify-center align-center" style="height:30vh;">
    <div class="d-flex justify-center">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  </v-row>
  <v-row v-else-if="searchList.length > 0 && dataLoading"
  class="pa-0 pt-3 d-flex">
    <v-col cols="6" :class="$vuetify.breakpoint.xl ? 'custom5cols' : ''"  lg="3" md="4" sm="6" xs="6"  class="pa-2 d-flex justify-center"
    v-for="item in searchList"
    :key="item.id">
      <v-card outlined dark class="rounded-lg d-flex flex-row" width="320px" :to="{name: 'Channel',
        query:{
            q: item.broadcaster_login
          },
        params:{
          data:item
        }
      }">
        <v-card-text  class="d-flex align-center pa-2 ma-0">
          <div aria-label="avatar" class="d-flex">
            <v-badge
              v-if="item.broadcaster_type == 'partner'"
              color="rgb(119,44,232)"
              icon="mdi-check"
              overlap>
              <v-avatar
              outline
              size="36">
                  <v-img :src="item.thumbnail_url" alt="profile_img"></v-img>
              </v-avatar>
            </v-badge>
            <v-avatar size="36" v-else>
              <v-img :src="item.thumbnail_url" alt="profile_img"></v-img>
            </v-avatar>
          </div>
          <div aria-label="streamer info" class="pl-3 text-truncate">
            <div class="text-truncate white--text">
              {{item.display_name}}
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-icon v-if="item.is_live" small color="error">mdi-circle</v-icon>
          <div>
          <v-btn v-if="$store.state.likedStreamer.find(ele =>
              ele.id == item.id)" icon @click.prevent="deleteFav({index:$store.state.likedStreamer.findIndex(el => el.id == item.id), display_name: item.display_name})">
              <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
            </v-btn>
          <v-btn v-else icon @click.prevent="like({id:item.id ,login: item.broadcaster_login, display_name: item.display_name, thumbnail:item.thumbnail_url, broadcaster_type:item.broadcaster_type})">
              <v-icon>mdi-star</v-icon>
          </v-btn>
        </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" class="d-flex justify-center py-8">
      <v-alert type="info" class="d-flex justify-cener" dense>
        스트리머를 찾지 못했다면, 스트리머의 아이디를 더 구체적으로 입력하세요.
      </v-alert>
    </v-col>
  </v-row>
  <v-row v-else-if="searchList.length === 0 && dataLoading" class="absolute-center">
    <v-alert type="error" class="d-flex justify-center">
      <div>
        유효한 스트리머가 검색되지 않습니다.
      </div>
    </v-alert>
  </v-row>
  <InArticleAdContainerVue></InArticleAdContainerVue>
</v-container>
</template>

<script>
import axios from 'axios';
import InArticleAdContainerVue from '../components/InArticleAdContainer.vue';

export default {
  components:{
    InArticleAdContainerVue,
  },
  data() {
    return {
      searchList:[],
      dataLoading: false,
    };
  },
  methods: {
    deleteFav(el) {
      this.$store.commit('DELETE_LikedStreamer', el);
    },
    like(el) {
      this.$store.commit('SET_LikedStreamer', el);
    },
    async getUserInfo(element) {
      return await axios.get('https://api.twitch.tv/helix/users',{
        params: {
          id : element,
        },
        headers:this.$store.state.headerConfig,
      });
    },
    async searchChannel(el) {
      await axios.get('https://api.twitch.tv/helix/search/channels', {
        params: {
          query: el,
          first: 60,
        },
        headers: this.$store.state.headerConfig,
      }).then(async (res) => {
        if(res.data.data.length > 0){
          this.searchList = res.data.data;
          let ids = [];
          res.data.data.map((element) => {
            return ids.push(element.id);
          })
          const result = await this.getUserInfo([...ids]);
          this.searchList.forEach((element) => {
            const index = result.data.data.findIndex((v) => v.id === element.id);
            element.broadcaster_type = result.data.data[index].broadcaster_type;
            element.view_count = result.data.data[index].view_count;
          })
          this.searchList.sort((a,b) => b.view_count - a.view_count);
        }
      }).catch(async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.searchChannel(el);
        }
      })
      this.dataLoading = true;

    },
    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },

  },
  async mounted() {
     if(!this.$route.query.q){
      this.$router.push({path:'/'}).catch(()=>{});
    }
    this.$store.commit('SET_SearchString','');
    document.title = `${this.$route.query.q} | Search - CCTwitch`;
    await this.searchChannel(this.$route.query.q);
  },
};
</script>
<style lang="scss" scoped>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  filter: none;
  justify-content: center;
  position: absolute;
  width: 100%;
}
</style>
