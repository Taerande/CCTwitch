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
             Archive : {{$moment(timelineData.createdAt).format('YY.MM.DD')}}
            </span>
            <v-spacer></v-spacer>
            <div class="justify-end">
              <div>
                <span class="text-caption">Updated: {{$moment(timelineData.updatedAt).fromNow()}}</span>
              </div>
              <div class="d-flex justify-center align-center">
                <div class="text-caption px-1">
                  <v-icon small>mdi-eye</v-icon>
                  {{viewerkFormatter(timelineData.total_view || 0)}}
                </div>
                <div class="text-caption px-1">
                  <v-icon small>mdi-movie-open-outline</v-icon>
                  {{cliplist.length}}
                </div>
                <div>
                </div>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <v-img
            width="250"
            class="rounded-lg mx-auto"
            :src="timelineData.thumbnail_url"
            lazy-src="@/assets/img/404.jpg"
            ></v-img>
            <strong class="text-h6 font-weight-bold pt-2 d-flex justify-center">{{timelineData.title}}</strong>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
      <v-timeline-item
      class="pa-0"
      fill-dot
      small
      color="twitch"
      v-for=" (clip) in cliplist" :key="clip.id">
      <template v-slot:icon v-if="clip.rank !== undefined">
        <v-icon :color="rankColor(clip.rank)">mdi-crown</v-icon>
      </template>
      <span v-if="!$vuetify.breakpoint.smAndDown" slot="opposite">
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
        <strong>{{secToHMS(clip.offset)}}</strong>
      </v-card-title>
        <v-card-text class="ma-a pa-0">
          <ClipIframeDialogVue :clipData="clip" :listData="listData"></ClipIframeDialogVue>
          <div class="d-flex justify-center pt-2" :class="!$vuetify.theme.dark ? 'white--text':'black--text'">{{clip.title}}</div>
        </v-card-text>
      </v-card>
        <!-- <div v-if="!$vuetify.breakpoint.smAndDown" slot="opposite">{{secToHMS(clip.offset)}}</div>
        <div v-else class="d-flex justify-end">{{secToHMS(clip.offset || 0)}}</div>
          <v-card
            :dark="!$vuetify.theme.dark"
            :light="$vuetify.theme.dark"
            class="mx-auto rounded-lg pa-3"
            elevation="12"
            width="800"
          >
            <v-card-text class="ma-a pa-0">
              <ClipIframeDialogVue :clipData="clip" :listData="listData"></ClipIframeDialogVue>
              <div class="d-flex justify-center pt-2">{{clip.title}}</div>
            </v-card-text>
          </v-card> -->
      </v-timeline-item>
    </v-timeline>
  </v-row>
</v-container>
</template>
<script>
import ClipIframeDialogVue from '../components/dialog/ClipIframeDialog.vue';
import axios from 'axios';

export default {
  components:{
    ClipIframeDialogVue,
  },
  data() {
    return {
      loading: false,
      cliplist: [],
      timelineData:{},
      broadcaster:{},
      unsubscribe: null,
      listData:[],
    }
  },
  computed:{
  },
  methods: {
    rankColor(el){
      if(el < 5) {return '#FFD700'}
      else if( el < 10) {return '#C0C0C0'}
      else {return '#CD7F32'}
    },
     viewerkFormatter(el) {
      const num = el.toString();
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(num.length - 9, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`;
      }
      return Math.abs(num);
    },
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
    secToHMS(el){
      if(el > 3600){
        return this.$moment.duration(el,'seconds').format('hh:mm:ss')
      } else if ( el ===  0) {
        return '00:00:00'
      } else {
        return `00:${this.$moment.duration(el,'seconds').format('mm:ss') }`;
      }
    },
  },
  async created() {
    const sn = await this.$firestore.collection('timeline').doc(this.$route.params.id).get();

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

    if(sn.exists){
      const item = sn.data();
      let clipIds = item.dataSet.map((v) => { return v.id });
      document.title = `${item.vidTitle} (${item.broadcaster}) | Timeline - CCTWITCH`
      this.timelineData = {
        title: item.vidTitle,
        createdAt: item.vidCreated,
        viewCount: item.viewCount,
        thumbnail_url: item.thumbnail_url,
        updatedAt: item.updatedAt.toDate(),
        likeCount: item.likeCount,
        title: item.vidTitle,
        broadcaster_login: item.broadcaster,
        total_view: 0,
      }
      await this.getUserInfo(item.broadcaster);
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
  },

  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
  },

}
</script>
<style lang="scss" scoped>
</style>
