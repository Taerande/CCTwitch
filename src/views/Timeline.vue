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
  <v-row v-if="broadcaster" class="d-flex pa-3">
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
        <span class="pl-3 text-h5 font-weight-bold">{{broadcaster.display_name}}</span>
      </div>
    </router-link>
  </v-row>
  <v-row v-if="timelineData">
    {{timelineData.title}}
  </v-row>
  <v-row v-if="!loading" class="absolute-center">
    <div class="d-flex justify-center">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  </v-row>
  <v-row v-else-if="loading" class="d-block">
    <div v-for=" (clip) in cliplist" :key="clip.id">
    <span>{{secToHMS(clip.offset)}}</span>
    <span>{{clip.title}}</span>
    <span>{{clip.view_count}}</span>
    <v-img width="200" lazy-src="@/assets/img/404.jpg" :src="clip.thumbnail_url"></v-img>
    </div>
  </v-row>
</v-container>
</template>
<script>

import { last, chunk } from 'lodash';
import axios from 'axios';

export default {
  components:{
  },
  data() {
    return {
      loading: false,
      cliplist: [],
      timelineData:{},
      broadcaster:{},
    }
  },
  computed:{
  },
  methods: {
    async getUserInfo(el){
      await axios.get('https://api.twitch.tv/helix/users',{
        headers: this.$store.state.headerConfig,
        params:{
          login:el,
        }
      }).then((res) => {
        this.broadcaster = res.data.data[0];
      })
    },
    async getClip(el){
      await axios.get('https://api.twitch.tv/helix/clips',{
        headers: this.$store.state.headerConfig,
        params:{
          id:el,
        }
      }).then((res) => {
        this.cliplist = res.data.data;
      })
    },
    getDurationTime(el) {
      const regex = /h|m|s/;
      const duration = el.split(regex);
      if (duration.length === 4) {
        if (duration[1] === '0') {
          return `${duration[0]}시간`;
        }
        return `${duration[0]}시간 ${duration[1]}분`;
      }
      if (duration.length === 3) {
        return `${duration[0]}분`;
      }
      return '1분 미만';
    },
    secToHMS(el){
      return el > 3600 ? this.$moment.duration(el,'seconds').format('hh:mm:ss') : `00:${this.$moment.duration(el,'seconds').format('mm:ss') }`;
    },
  },
  async created() {
    document.title = `${this.$route.params.id.split('-')[0]} | Timeline - CCTWITCH`
    const sn = await this.$firestore.collection('timeline').doc(this.$route.params.id).get();
    if(sn.exists){
      const item = sn.data();
      let clipIds = item.dataSet.map((v) => { return v.id });
      this.timelineData = {
        title: item.vidTitle,
        createdAt: item.vidCreatedAt,
        viewCount: item.viewCount,
        likeCount: item.likeCount,
        title: item.vidTitle,
        broadcaster_login: item.broadcaster,
      }
      await this.getUserInfo(item.broadcaster);
      await this.getClip(clipIds);
      this.cliplist.map((v) => {
        v.offset = item.dataSet.find(x => x.id === v.id).offset
      })
      this.cliplist.sort((a,b) => a.offset - b.offset);
      } else {
        this.$router.push({name:'Home'}).catch(()=>{});
        this.$store.commit('SET_SnackBar', {type:'error', text:"Can't find data", value:true});
      }
    this.loading = true;
  },

}
</script>
<style lang="scss" scoped>
</style>
