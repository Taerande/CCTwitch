<template>
  <v-container>
    <v-card class="pa-0 ma-0 black">
      <v-card-title class="d-block pa-0 ma-0">
        <div class="d-flex justify-end align-center copyBody">
          <span class="white--text pl-1">{{$moment(clipData.created_at).format('ll')}}</span>
          <v-spacer></v-spacer>
          <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
      </v-card-title>
      <v-card-text class="pa-0 ma-0">
        <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndDown ? 1/1 : 4/3" height="100%">
            <iframe
            allow="autoplay"
            v-if="dialog"
            :src="`https://clips.twitch.tv/embed?clip=${clipData.id}&parent=${$store.state.embedUrl}&autoplay=true&preload=auto`"
            preload="auto"
            frameborder="0"
            height="100%"
            width="100%"
            allowfullscreen="true"></iframe>
        </v-responsive>
      </v-card-text>
      <div class="ma-0 px-1 py-2">
        <Adsense
        data-ad-client="ca-pub-8597405222136575"
        data-ad-slot="3465851493"
        :ins-style="`display:inline-block;width:100%;height:90px;min-wdith:250px;`"
        ></Adsense>
      </div>
      <div class="d-flex justify-center align-center pa-0 pb-4 white--text">
        <div class="px-1 mx-1">
          <v-btn dark class="d-flex mx-auto" :disabled="clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${clipData.video_id}?t=${setTimeHMSformat(clipData.vod_offset)}`, setTimeHMSformat(clipData.vod_offset))"><v-icon>mdi-twitch</v-icon></v-btn>
          <div class="text-caption">다시보기</div>
        </div>
        <div class="px-1 mx-1">
          <v-btn class="d-flex mx-auto" color="error" icon @click="copyClip(clipData)">
            <v-icon>mdi-clipboard-multiple-outline</v-icon>
          </v-btn>
          <div class="text-caption">URL 복사</div>
        </div>
        <div class="px-1 mx-1">
          <v-btn class="d-flex mx-auto" color="error" icon @click="downloadClip(clipData)">
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <div class="text-caption">다운로드</div>
        </div>
        <div class="px-1 mx-1">
          <pinClip class="d-flex mx-auto" v-if="$store.state.userinfo.userInfo" name="channelClipPin" :clipData="{data:clipData}" :listData="listData"></pinClip>
          <v-btn class="d-flex mx-auto" v-else color="error" icon @click.stop="$store.commit('SET_SignInDialog',true)"><v-icon>mdi-plus-box-multiple</v-icon>
          </v-btn>
          <div class="text-caption">추가하기</div>
        </div>
        <AddNewHotClipDialogVue :clipData="clipData"></AddNewHotClipDialogVue>
      </div>
    </v-card>
  </v-container>
</template>
<script>
import axios from 'axios';
import AddNewHotClipDialogVue from '@/components/dialog/AddNewHotClipDialog.vue'
export default {
  components:{
    AddNewHotClipDialogVue
  },
  data() {
    return {
      clipData:{},
      listData:[],
      importLoading: false,
      dialog:false,
    }
  },
  methods: {
    setTimeHMSformat(item){
      const hour = Math.floor(item/3600);
      const min = Math.floor((item%3600)/60);
      const sec = Math.floor((item%60));

      return hour+'h'+min+'m'+sec+'s';
    },
    copyClip(el) {
      const tempArea2 = document.createElement('textarea');
      document.getElementsByClassName('copyBody')[0].appendChild(tempArea2);
      tempArea2.value = el.url;
      tempArea2.select();
      document.execCommand('copy');
      document.getElementsByClassName('copyBody')[0].removeChild(tempArea2);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Clip URL : ${el.title} 가 복사되었습니다.`, value: true });
    },
    async pushToTwitchVids(url, time) {
      await this.getVidInfo();
      if (window.confirm(`[${this.$moment(this.vidInfo.created_at).fromNow()}] ${this.vidInfo.title}\n[${time}]으로 이동하시겠습니까?`)) {
        window.open(url, '_blank');
      }
    },
    downloadClip(el) {
      let target = `${el.thumbnail_url.split('-preview')[0]}.mp4`;
      let a = document.createElement('A');
      a.href = target;
      a.download = target.substr(target.lastIndexOf('/') + 1);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    async getVidInfo(){
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/videos',
          params: {
            id: this.clipData.video_id,
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      await axios(axiosOption).then((res) => {
        this.vidInfo = res.data.data[0];
      })
    },
    async getClip(el){
      this.importLoading = true;
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/clips',
          params: {
            id: resultId,
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      let preClipId = el.trim();
      let resultId;
      if (preClipId.match('clip')){
        resultId = preClipId.split('/')[preClipId.split('/').length-1];
      }else if(preClipId.match('twitch.tv/')){
        resultId = preClipId.split('.tv/')[1].split('?')[0];
      }else{
        resultId = preClipId.split('?')[0];
      }
      await axios(axiosOption).then((res) => {
          if(res.data.data.length > 0){
            this.clipData = res.data.data[0];
            this.dialog = true;
          } else {
             this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 클립을 가져올 수 없습니다.`, value: true });
          }
          this.importLoading = false;
        }).catch(async (e) => {
          if(e.response.status === 401){
            await this.$store.dispatch('setNewTwitchAppToken');
            await this.getClip(el);
          }
        })
    },
    searchChannel(el) {
      if(el.match('https://')){ return this.getClip(el)}
      this.$store.state.searchQuery = el;
      this.$router.push({
        path: '/search',
        query: {
          q: el,
        },
        params: {
          q: el,
        },
      });
    },
  },
  async created(){
    let tempuserInfo = this.$store.state.userinfo.userInfo;
    if(!this.$store.state.userinfo.userInfo) {
      await this.$firebase.auth().onAuthStateChanged(async (user) => {
        if(user){
          this.$store.commit('SET_UserInfo',user);
        }
      })
    }
    if(tempuserInfo){
      this.unsubscribe = await this.$firestore.collection('cliplist').orderBy("createdAt","desc").where('authorId','==',tempuserInfo.uid).onSnapshot((sn) => {
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
  }
}
</script>
<style lang="">

</style>
