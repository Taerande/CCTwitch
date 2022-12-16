<template>
<v-container fluid>
  <v-row class="d-flex align-center py-5">
    <div class="text-h3 font-weight-bold pr-3">
      Timeline |
    </div>
    <div class="text-h4 font-weight-bold">
      {{this.$route.params.id.split('-')[0]}}
    </div>
  </v-row>
  <v-divider></v-divider>
  <v-row v-if="timelineData" class="d-block pt-5">
    <v-row class="d-flex justify-center">
      <v-col cols="12" class="pa-3">
        <v-card
        outlined
        class="mx-auto rounded-lg">
          <v-card-title class="d-flex ma-0 pa-3" v-if="broadcaster">
            <router-link :to="`/channel?q=${broadcaster.login}`">
              <div class="d-flex align-center">
                <v-badge v-if="broadcaster.broadcaster_type == 'partner'"
                color="rgb(119,44,232)"
                icon="mdi-check"
                overlap>
                  <v-avatar
                  outline
                  size="36">
                    <v-img :src="broadcaster.profile_image_url" alt="profile_img"></v-img>
                  </v-avatar>
                </v-badge>
                <v-avatar
                v-else
                outline
                size="36">
                  <v-img :src="broadcaster.profile_image_url" alt="profile_img"></v-img>
                </v-avatar>
                <span class="pl-3 twitch--text text-h5 font-weight-bold">{{broadcaster.display_name}}</span>
              </div>
            </router-link>
            <span class="pl-3">
             Archive : {{$moment(timelineData.createdAt).format('MM/DD/YY')}}
            </span>
            <v-spacer></v-spacer>
            <div class="d-flex justify-end">
              <div>
                <div class="text-caption">Updated: {{$moment(timelineData.updatedAt).fromNow()}}</div>
                <div class="d-flex justify-center align-center">
                  <div class="text-caption px-1">
                    <v-icon small>mdi-movie-open-outline</v-icon>
                    {{cliplist.length}}
                  </div>
                  <div class="text-caption px-1">
                    <v-icon small>mdi-eye</v-icon>
                    {{timelineData.total_view || 0 | commaCase}}
                  </div>
                </div>
              </div>

              <v-tooltip bottom>
                <template v-slot:activator="{on}">
                  <div class="d-flex align-center" v-on="on">
                    <v-btn @click="createTimeline(broadcaster.login, broadcaster.id, vidInfo[0].id)"  :disabled="!canUpdate" :loading="btnLoading" color="twitch" icon><v-icon>mdi-refresh</v-icon></v-btn>
                  </div>
                </template>
                <span> {{vidInfo[0] === undefined ? "Video data is invalid. Can't update anymore" : 'Can update every 3 hour'}}</span>
              </v-tooltip>
            </div>
          </v-card-title>
          <v-card-text>
            <v-img
            width="300"
            class="rounded-lg mx-auto"
            :src="timelineData.thumbnail_url"
            lazy-src="@/assets/img/404.jpg"
            ></v-img>
            <strong class="text-h6 font-weight-bold pt-2 d-flex justify-center">{{timelineData.title}}</strong>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="!loading" class="d-block">
      <div class="d-flex justify-center">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
      <div class="d-flex justify-center ">Loading Data</div>
    </v-row>
    <v-row v-else-if="loading" class="d-flex justify-center">
      <v-timeline
      :dense="$vuetify.breakpoint.smAndDown"
      :align-top="$vuetify.breakpoint.smAndDown"
      >
        <div v-for="(chunck, index) in cliplistChunk" :key="index" class="pa-0 ma-0">
          <v-timeline-item
          class="pa-0"
          fill-dot
          small
          color="twitch"
          v-for=" (clip) in chunck" :key="clip.id">
          <template v-slot:icon v-if="clip.rank !== undefined">
            <v-icon :color="rankColor(clip.rank)">mdi-crown</v-icon>
          </template>
          <span v-if="!$vuetify.breakpoint.smAndDown" slot="opposite">
            <v-icon v-if="clip.video_id === ''">mdi-approximately-equal</v-icon>
            {{secToHMS(clip.offset)}}
          </span>
          <v-card
            :dark="!$vuetify.theme.dark"
            :light="$vuetify.theme.dark"
            class="mx-auto rounded-lg pa-3"
            :class="$vuetify.breakpoint.smAndDown ? 'mb-16 pt-0' : ''"
            elevation="10"
            :max-width="$vuetify.breakpoint.smAndDown ? '250' : '480'"
          >
          <v-card-title class="pa-0" v-if="$vuetify.breakpoint.smAndDown">
            <v-icon v-if="clip.video_id === ''">mdi-approximately-equal</v-icon>
            <strong>{{secToHMS(clip.offset)}}</strong>
          </v-card-title>
            <v-card-text class="ma-a pa-0">
              <ClipIframeDialogVue :clipData="clip" :listData="listData"></ClipIframeDialogVue>
              <div class="d-flex justify-center pt-2" :class="!$vuetify.theme.dark ? 'white--text':'black--text'">{{clip.title}}</div>
            </v-card-text>
          </v-card>
          </v-timeline-item>
          <div class="d-flex justify-center align-center py-5">
            <InArticleAdsense
              data-ad-client="ca-pub-8597405222136575"
              data-ad-slot="4194229053"
              data-ad-format="fluid"
              ins-style="display:inline-block;width:90%;min-width:266px;"
            ></InArticleAdsense>
          </div>
        </div>
      </v-timeline>
    </v-row>
  </v-row>
</v-container>
</template>
<script>
import ClipIframeDialogVue from '../components/dialog/ClipIframeDialog.vue';
import axios from 'axios';
import chunk from 'lodash/chunk';

export default {
  components:{
    ClipIframeDialogVue,
  },
  data() {
    return {
      btnLoading:false,
      loading: false,
      cliplist: [],
      timelineData:{},
      broadcaster:{},
      unsubscribe: null,
      listData:[],
      vidInfo:[],
    }
  },
  computed:{
    canUpdate(){
      return this.$moment().add(-3,'hours').isAfter(this.timelineData.updatedAt) && this.vidInfo[0] !== undefined;
    },
    cliplistChunk(){
      return chunk(Object.values(this.cliplist),10);
    }
  },
  methods: {
    rankColor(el){
      if(el < 5) {return '#FFD700'}
      else if( el < 10) {return '#C0C0C0'}
      else {return '#CD7F32'}
    },
    async getUserInfo(el){
      await axios.get('https://api.twitch.tv/helix/users',{
        headers: this.$store.state.headerConfig,
        params:{
          login:el,
        }
      }).then((res) => {
        this.broadcaster = res.data.data[0];
      }).catch( async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getUserInfo(el);
        }
      });
    },
    async createTimeline(user_login, broadcaster_id, vidId){
      this.loading = false;
      this.btnLoading = true;
      this.dbLoading = true;
      this.$store.commit('SET_SnackBar',{type:'info', text:'Timeline 생성은 1분 정도 소요됩니다.', value:true});
      await axios.post('https://asia-northeast2-twitchhotclip.cloudfunctions.net/timeLine/timeline',{
        user_login: user_login,
        broadcaster_id: broadcaster_id,
        vidId: vidId,
        appAccessToken: `${this.$store.state.headerConfig.Authorization}`,
      }).then( async (res) => {
        await this.postProccess();
        this.$store.commit('SET_SnackBar', {type:'success', text:`${res.data.message}`, value:true})
        this.loading = true;
        this.dbLoading = false;
        this.btnLoading = false;

      }).catch((err)=>{
        this.$store.commit('SET_SnackBar', {type:'error', text:`${res.data.message}`, value:true})
        this.loading = true;
        this.btnLoading = false;
        this.dbLoading = false;
      })
    },
    async getVidInfo(el) {
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/videos',
          params: {
            id: el,
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      await axios(axiosOption).then((res) => {
        this.vidInfo = res.data.data;
      }).catch( async (e) => {
          if(e.response.status === 401){
            await this.$store.dispatch('setNewTwitchAppToken');
            await this.getVidInfo(el);
          }
        });
    },
    async getClip(el){
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/clips',
          params: {
            id: el,
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      await axios(axiosOption).then((res) => {
        this.cliplist = res.data.data;
      }).catch( async (e) => {
          if(e.response.status === 401){
            await this.$store.dispatch('setNewTwitchAppToken');
            await this.getClip(el);
          }
        });
    },
    secToHMS(el){
      if(el > 3600){
        return this.$moment.duration(el,'seconds').format('hh:mm:ss')
      } else if ( el ===  0) {
        return '00:00:00'
      } else {
        return `00:${this.$moment.duration(el,'seconds').format('mm:ss') }`;
      }
    },
    async postProccess(){
      this.timelineData = {};
      this.cliplist = [];
      const sn = await this.$firestore.collection('timeline').doc(this.$route.params.id).get();
      if(sn.exists){
        const item = await sn.data();
        let clipIds = item.dataSet.map((v) => { return v.id });
        document.title = `${item.vidTitle} (${item.broadcaster}) | Timeline - CCTWITCH`
        this.timelineData = {
          title: item.vidTitle,
          createdAt: item.vidCreated.toDate(),
          viewCount: item.viewCount,
          thumbnail_url: item.thumbnail_url,
          updatedAt: item.updatedAt.toDate(),
          likeCount: item.likeCount,
          title: item.vidTitle,
          broadcaster_login: item.broadcaster,
          total_view: 0,
        }
        if(this.broadcaster.id === undefined){
          this.getUserInfo(item.broadcaster);
          this.getVidInfo(this.$route.params.id.split(`${item.broadcaster}-`)[1]);
        }
        await this.getClip(clipIds);
        this.cliplist.sort((a,b) => b.view_count - a.view_count);
        for(let i = 0; i < 15; i++){
          if(this.cliplist[i] === undefined) { break; }
          this.cliplist[i].rank = i;
        }
        this.cliplist.map((v) => {
          this.timelineData.total_view += v.view_count
          v.offset = item.dataSet.find(x => x.id === v.id).offset
        })
        this.cliplist.sort((a,b) => a.offset - b.offset);
        } else {
          this.$router.push({name:'Home'}).catch(()=>{});
          this.$store.commit('SET_SnackBar', {type:'error', text:"Can't find data", value:true});
        }
      this.loading = true;

      }
  },
  async created() {
    if(this.$store.state.userinfo.userInfo){
      this.unsubscribe = await this.$firestore.collection('cliplist').orderBy("createdAt","desc").where('authorId','==',this.$store.state.userinfo.userInfo.uid).onSnapshot((sn) => {
        if(sn.empty){
          this.listData = [];
          return
          }
          this.listData = sn.docs.map( v => {
            const item = v.data()
            return {
              id: v.id,
              title: item.title,
              createdAt: item.createdAt,
              color: item.color,
              clipCount: item.clipCount,
              clipIds: item.clipIds,
            }
          })
        })
    }
    await this.postProccess();

  },

  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
  },

}
</script>
<style lang="scss" scoped>
// .adswrapper{
//   display: flex;
//   justify-content: center;
//   margin: 10px 8px 30px 8px;
// }
</style>
