<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold text-uppercase">REPORT | {{this.$route.query.type}}</span>
  </v-row>
  <v-row class="d-block">
    <div class="text-caption">
      *데이터 집계는 30분마다 Twitch API를 통해 이루어집니다.
    </div>
    <div class="text-caption">
      *해당 일 07:00부터 다음날 07:00까지 집계합니다.
    </div>
  </v-row>
  <v-row class="py-3">
    <v-spacer></v-spacer>
    <v-btn-toggle>
      <v-btn small dense :outlined="this.$route.query.type !== 'overall'" :class="this.$route.query.type === 'overall' ? 'white--text' : ''"  color="twitch" @click="routerPush('?type=overall')">Overall</v-btn>
      <v-btn small dense :outlined="this.$route.query.type !== 'channel'" :class="this.$route.query.type === 'channel' ? 'white--text' : ''" color="twitch" @click="routerPush('?type=channel')">Channel</v-btn>
    </v-btn-toggle>
  </v-row>
  <v-row class="d-flex justify-center">
    <OverallVue :listData="cliplist" v-if="this.$route.query.type === 'overall'"></OverallVue>
    <ChannelVue :listData="cliplist" v-else-if="this.$route.query.type === 'channel'"></ChannelVue>
    <v-col v-else cols="12" class="d-flex justify-center aling-center" style="height:40vh;">
      <div class="d-flex align-center text-h4">
        404 Page Not Found
      </div>
    </v-col>
  </v-row>
</v-container>
</template>
<script>
import OverallVue from '../components/Report/Overall.vue'
import ChannelVue from '../components/Report/Channel.vue'
export default {
  data() {
    return {
      cliplist:[],
      btnToggle:0,
    }
  },
  methods: {
    routerPush(path){
      this.$router.push({path:path}).catch(() => {});
    },
    async openCalendar(id){

      await this.$streamData.ref(`/stream_data/${id}`).get().then((sn) => {

      })

    },

  },
  components:{
    OverallVue,
    ChannelVue
  },
  async created(){
    if(this.$route.query.type === undefined){
      this.$router.push({path:'?type=overall'});
    }
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
          this.cliplist = [];
          return
          }
          this.cliplist = sn.docs.map( v => {
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
<style lang="scss" scoped>
.v-card:hover{
  z-index: 3;
  transition: all ease 0.2s 0s;
  transform: scale(1.1) !important;
  box-shadow: 5px 5px 0 var(--twitch-color);
}


</style>
