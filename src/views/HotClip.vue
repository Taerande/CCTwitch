<template>
<v-container fluid>
    <v-row class="d-flex align-center py-5">
    <div class="text-h3 font-weight-bold pr-3">
      Hot Clip |
    </div>
    <div class="text-h4 font-weight-bold" v-if="hotClipData.title.length > 0">
      {{hotClipData.title}}
    </div>
  </v-row>
  <v-divider></v-divider>
  <v-row class="d-flex col-12 justify-center">
    <v-col cols="12" xl="9" lg="9" md="9" sm="12" class="copyBody">
      <v-card class="pa-0 ma-0 black">
        <v-card-text class="pa-0 ma-0">
          <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndDown ? 1/1 : 16/11" height="100%">
          <iframe
              allow="autoplay"
              :src="`https://clips.twitch.tv/embed?clip=${hotClipData.id}&parent=${$store.state.embedUrl}&preload=auto`"
              preload="auto"
              frameborder="0"
              height="100%"
              width="100%"
              allowfullscreen="true"></iframe>
          </v-responsive>
          <div class="d-flex justify-center align-center pa-0 pb-4 white--text">
            <div class="px-1 mx-1">
              <v-btn dark class="d-flex mx-auto" :disabled="hotClipData.clipData.video_id === ''" color="error" icon @click="pushToTwitchVids(`https://twitch.tv/videos/${hotClipData.clipData.video_id}?t=${setTimeHMSformat(hotClipData.clipData.videoOffsetSeconds)}`,hotClipData.clipData.title, setTimeHMSformat(hotClipData.clipData.videoOffsetSeconds))"><v-icon>mdi-twitch</v-icon></v-btn>
              <div class="text-caption">다시보기</div>
            </div>
            <div class="px-1 mx-1">
              <v-btn class="d-flex mx-auto" color="error" icon @click="copyClip(hotClipData.clipData)">
                <v-icon>mdi-clipboard-multiple-outline</v-icon>
              </v-btn>
              <div class="text-caption">URL 복사</div>
            </div>
            <div class="px-1 mx-1">
              <v-btn class="d-flex mx-auto" color="error" icon @click="downloadClip(hotClipData.clipData)">
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
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row class="d-flex justify-center" style="height:300px;">
    <div>
      here's hotclip data sortly. with broadcaster info
    </div>
  </v-row>
  <v-row class="d-flex justify-center" style="height:300px;">
    <div>
      here's for comments
    </div>
  </v-row>
</v-container>
</template>
<script>
import axios from 'axios';
import pinClip from '../components/pinClip.vue';

export default {
  components:{
    pinClip,
  },
  data() {
    return {
      hotClipData:{
        id:'',
        title:'',
        clipData:{},
        commentCount:0,
        likeCount:0,
        title:'',
        tags:[],
        broadcaster:{},
      }
    }
  },
  computed:{
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
    pushToTwitchVids(url, title, time) {
      if (window.confirm(`${title}[${time}]으로 이동하시겠습니까?`)) {
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
    async getBroadcasterInfo(el){
      return await axios.get('https://api.twitch.tv/helix/users', {
        headers: this.$store.state.headerConfig,
        params: { id: el }
      }).then((res) =>{
        return res.data.data[0];
      })
    },
    async getClipInfo(el){
      return await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: { id: el }
      }).then((res) =>{
        return res.data.data[0];
      })
    }
  },
  async created() {
    const sn = await this.$firestore.collection('hotclip').doc(this.$route.params.id);

    sn.get().then( async (doc) => {
      const item = doc.data();
      if(doc.exists){
        this.hotClipData.id = doc.id;
        this.hotClipData.clipData = await this.getClipInfo(doc.id);
        this.hotClipData.broadcaster = await this.getBroadcasterInfo(item.broadcaster_id);
        this.hotClipData.commentCount = item.commentCount;
        this.hotClipData.likeCount = item.likeCount;
        this.hotClipData.tags = item.tags;
        this.hotClipData.title = item.title;
      }

    })


  }

}
</script>
<style lang="scss" scoped>
</style>
