<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold">Liked:</span>
  </v-row>
  <v-row class="d-flex justify-start pb-5">
<v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center"
    v-for="(item, index) in currlist"
    :key="item.id">
      <v-card outlined class="rounded-xl" width="400px">
        <v-card-title>
          <router-link class="d-flex" :to="{name: 'Channel', query:{
            q: item.login}}">
            <div aria-label="avatar" class="flex-direction: column">
              <v-badge
                v-if="item.broadcaster_type == 'partner'"
                bordered
                color="rgb(119,44,232)"
                icon="mdi-check"
                overlap>
                <v-avatar
                outline
                size="40">
                    <v-img :src="item.thumbnail" alt="profile_img"></v-img>
                </v-avatar>
              </v-badge>
              <v-avatar size="40" v-else>
                <v-img :src="item.thumbnail" alt="profile_img"></v-img>
              </v-avatar>
              <div class="rounded-xl d-flex justify-center" v-if="item.is_live">
                <v-icon size="13" color="red">mdi-broadcast</v-icon>
                <span class="red--text text-caption">LIVE</span>
              </div>
              <div class="rounded-xl d-flex justify-center" v-else>
                <v-icon  size="13" color="blue">mdi-broadcast-off</v-icon>
                <span class="blue--text text-caption">OFF</span>
              </div>
            </div>
            <div aria-label="streamer info" class="pl-3" style="max-width:130px">
              <div class="d-flex text-truncate align-center">
                {{item.display_name}}
                <span v-if="item.viewer_count*1 > 0" class=" pl-1 red--text text-caption">{{
                  viewerkFormatter(item.viewer_count)}}</span>
              </div>
              <div class="text-caption text-truncate">
              Followers: {{kFormatter(item.follower_count)}}
              </div>
            </div>
          </router-link>
          <v-spacer></v-spacer>
          <div>
            <StarBtnDialogVue :liked="{data:item, index:index}"></StarBtnDialogVue>
          </div>
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-subheader>Recent Clips</v-subheader>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';
import StarBtnDialogVue from '../components/dialog/StarBtnDialog.vue';
// import LikedClip from '../components/LikedClip.vue';
export default {
  components: {
    StarBtnDialogVue,
    // LikedClip,
  },
  data() {
    return {
      currlist:[],
      dialog:[],
      clips: [],
      userInfo: [],
      dataLoading: false,
      searchUserList:[],
      check: false,
      searching: false,
    };
  },
  // toggleClip(el) {
  //     const toggleClips = document.getElementsByClassName(el.id);
  //     const check = [...toggleClips][0].classList.contains('hidden');
  //     const target = this.$store.state.likedStreamer.find((ele) => ele.id === el.id);
  //     target.is_checked = check;
  //     if (check) {
  //       [...toggleClips].forEach((item) => {
  //         item.classList.remove('hidden');
  //         this.$store.commit('SET_SnackBar', { type: 'success', text: `Filter : ${el.display_name} 님을 노출합니다.`, value: false });
  //       });
  //     } else {
  //       [...toggleClips].forEach((item) => {
  //         item.classList.add('hidden');
  //         this.$store.commit('SET_SnackBar', { type: 'error', text: `Filter : ${el.display_name} 님을 숨깁니다.`, value: true });
  //       });
  //     }
  //   },
  methods: {
    sortByFollower(element){
      return element.sort((a,b) => b.follower_count - a.follower_count);
    },
    initData(){
      this.searchUserList.forEach((element) =>{
        this.$store.commit('SET_isChecked', {target:element, data: false})
      })
      this.searchUserList = [];
    },
    toggleClip(el) {
      const userIdx =  this.searchUserList.findIndex((ele) => ele.id === el.id);
      if (!el.is_checked) {
        this.searchUserList.push(el);
        this.$store.commit('SET_isChecked', {target:el, data:true})
      } else {
        this.searchUserList.splice(userIdx,1);
        this.$store.commit('SET_isChecked', {target:el, data:false})
        // this.searchUserList.push(el)
      }
    },
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 48 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    getStartDate(el) {
      const endedAt = new Date(el).getTime();
      const startedAt = new Date(endedAt - 7 * 24 * 60 * 60 * 1000);
      return startedAt.toISOString();
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
    like(el) {
      this.$store.commit('SET_LikedStreamer', el);
    },

    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },
    async getStreamData(element, index){
    axios.get('https://api.twitch.tv/helix/streams', {
      params: {
        user_login: element.login,
        },
      headers: this.$store.state.headerConfig,
      }).then((respp) => {
        if(respp.data.data.length > 0 ){
          this.currlist[index].is_live = respp.data.data['0'].type;
          this.currlist[index].viewer_count = respp.data.data['0'].viewer_count;
        }else {
          this.currlist[index].is_live = '';
          this.currlist[index].viewer_count = '';
        }
      });
    },
    async postProcess(){
      this.currlist = this.$store.state.likedStreamer;
      await this.currlist.forEach((element,index) =>{
      this.getStreamData(element,index);
      });
    }

  },
  computed: {
    getTodayDate() {
      return new Date().toISOString();
    },
  },
  mounted() {
    this.postProcess();


  },
};
</script>
<style lang="scss">
.v-progress-circular {
  margin: 1rem;
}
#checkedIcon_partner, #checkedIcon_none{
  display: flex;
  background-color: rgb(0,0,0,0.3);
  width: inherit;
  > i {
    width: -webkit-fill-available;
  }
  :hover{
    cursor: pointer;
  }
}
.v-avatar:hover{
  cursor: pointer;
}
.custom5cols {
  width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}
</style>
