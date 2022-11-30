<template>
  <v-app-bar class="white--text indigo lighten-3" height="60" app flat absolute>
    <v-dialog
      content-class="drawer"
      v-model="$store.state.drawer"
      no-click-animation
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="blue">
          <div class="white--text">Quick Menu</div>
          <v-spacer></v-spacer>
          <v-btn color="white" @click="changeDrawer(false)" icon>
            <v-icon>mdi-chevron-double-down</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-3">
          <v-list class="mb-16">
            <div class="text-caption pl-5">Search</div>
            <v-form
            @submit.prevent="searchChannel($store.state.searchString)">
              <v-text-field
                v-model="$store.state.searchString"
                @click:prepend="searchChannel($store.state.searchString)"
                color="twitch"
                outlined
                flat
                type="text"
                dense
                prepend-inner-icon="mdi-magnify"
                placeholder="Find streamer"
                solo
              ></v-text-field>
            </v-form>
            <div class="text-caption pl-5 pt-3">Menu</div>
            <v-divider class="my-3"></v-divider>
            <v-list-item to="/" @click="changeDrawer(false)">
              <v-icon color="twitch" class="pr-1">mdi-home</v-icon>
              <span class="text-subtitle-2 text-lg-body-1 pr-1">Home</span>
            </v-list-item>
            <v-list-item to="/trending" @click="changeDrawer(false)">
              <v-icon color="green" class="pr-1">mdi-trending-up</v-icon>
              <span class="text-subtitle-2 text-lg-body-1 pr-1">Trending</span>
            </v-list-item>
            <v-list-item to="/timelines" @click="changeDrawer(false)">
              <v-icon color="cyan" class="pa-0 ma-0 pr-1">mdi-timeline</v-icon>
              <span class="text-subtitle-2 text-lg-body-1 pr-1">Timeline</span>
            </v-list-item>
            <v-list-item to="/mycliplist" @click="changeDrawer(false)">
              <v-icon color="blue" class="pr-1">mdi-playlist-check</v-icon>
              <span class="text-subtitle-2 text-lg-body-1 pr-1">My Cliplist</span>
            </v-list-item>
            <v-list-item to="/streamer" @click="changeDrawer(false)">
              <v-icon color="red" class="pa-0 ma-0 pr-1">mdi-heart</v-icon>
              <span class="text-subtitle-2 text-lg-body-1 pr-1">Streamer</span>
            </v-list-item>
            <v-list-item to="/report?type=overall" @click="changeDrawer(false)">
              <v-icon color="orange" class="pa-0 ma-0 pr-1">mdi-poll</v-icon>
              <span class="text-subtitle-2 text-lg-body-1 pr-1">Report</span>
            </v-list-item>
            <div class="text-caption pl-5 pt-8">User</div>
            <v-divider class="my-3"></v-divider>
            <v-card flat v-if="$store.state.userinfo.userInfo">
              <v-card-text>
                <v-avatar
                size="24">
                  <img
                    :src="$store.state.userinfo.userInfo.photoURL" lazy-src="@/assets/img/404.jpg">
                </v-avatar>
              <span class="text-subtitle px-1">{{$store.state.userinfo.userInfo.displayName}}</span>
              <div class="d-flex justify-center py-3">
                <v-btn width="100%" @click="logOut()" :loading="logoutLoading" color="error">Logout</v-btn>
              </div>
              </v-card-text>
            </v-card>
            <v-card flat v-else>
              <div class="d-flex justify-center px-10 pt-5">
                <v-btn color="twitch" dark width="100%" @click="$store.commit('SET_SignInDialog', true)">Log In</v-btn>
              </div>
            </v-card>
            <div class="pa-0 ma-0" v-if="$store.state.userinfo.userInfo">
              <div class="text-caption pl-5 pt-3">Alram</div>
              <v-divider class="my-3"></v-divider>
              <v-list>
                <v-subheader class="text-caption">Current Device</v-subheader>
                <v-list-item class="d-flex align-center" v-if="!isListed && !isIOS">
                  <v-text-field
                    v-model="deviceName"
                    color="twitch"
                    name="device name"
                    :rules="[deviceRules.required, deviceRules.counter]"
                    counter
                    :disabled="subscribeDeviceLoading"
                    flat
                    type="text"
                    maxlength="15"
                    full-width
                    label="Device Name"
                    :prepend-icon="deviceLogo(navi)"
                    dense
                  >
                    <template v-slot:append>
                      <v-btn :disabled="deviceName === ''" :loading="subscribeDeviceLoading" @click="enrollFCM()" color="twitch" text class="text-caption" small><v-icon small>mdi-bell</v-icon> <span>구독하기</span></v-btn>
                    </template>
                  </v-text-field>
                </v-list-item>
                <v-list-item v-else-if="isIOS">
                  <div class="text-caption error--text pa-0 ma-0">Can't available in IOS.</div>
                </v-list-item>
                <v-list-item v-else>
                  <div class="text-caption error--text pa-0 ma-0">This device is already listed.</div>
                </v-list-item>
                <v-subheader class="text-caption">Listed Device</v-subheader>
                <v-list-item v-for="(item, index) in devices" :key="index" class="d-flex">
                <v-icon>{{deviceLogo(item[1].device)}}</v-icon>
                <span class="text-caption px-1">{{item[1].name}}</span>
                <span class="text-caption px-1 success--text" v-if="item[0] === fcmToken">(current device)</span>
                <v-spacer></v-spacer>
                <v-btn small color="error" :loading="unsubloadingId === item[0]" depressed class="text-caption" @click="disenrollFCM(item[0])"><v-icon small>mdi-bell-off-outline</v-icon><span>구독해제</span></v-btn>
                </v-list-item>
                <v-list-item v-if="devices.length === 0">
                    <div class="text-caption error--text pa-0 ma-0">구독된 기기가 없습니다.</div>
                </v-list-item>
              </v-list>
              <v-icon>mdi-alram</v-icon>
            </div>
            <div class="text-caption pl-5 pt-3">Option</div>
            <v-divider class="my-3"></v-divider>
            <div>
              <v-btn
              width="105"
              depressed
              dark
              v-if="!$vuetify.theme.dark"
              class="text-capitalize text-caption pa-0 ma-0 px-1"
              @click="toggleDarkTheme()">
                <v-icon color="yellow darken-3">mdi-weather-night</v-icon>
                <span>Dark Theme</span>
              </v-btn>
              <v-btn v-else
              depressed
              light
              width="105"
              class="text-capitalize text-caption pa-0 ma-0 px-1"
              @click="toggleDarkTheme()">
                <v-icon color="red">mdi-weather-sunny</v-icon>
                <span>Light Theme</span>
              </v-btn>
            </div>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-container
    class="align-center justify-center">
      <v-row class="d-flex align-center">
        <div class="d-flex">
          <v-btn icon @click="changeDrawer(!drawer)">
            <v-icon color="white">mdi-menu</v-icon>
          </v-btn>
          <router-link class="d-flex" :to="{name: 'Home'}">
            <v-img
              class="shrink mr-1"
              contain
              src="@/assets/logo.png"
              width="30"
            />
          <div
            :class="$route.name === 'Home' ? 'twitch--text' : '' "
            class="text-lg-h4 text-h5 font-weight-bold d-flex align-center pl-3 appbar-text">CCTwitch</div>
          </router-link>
        </div>
        <div v-if="$vuetify.breakpoint.mdAndUp" class="d-flex pl-3">
          <router-link to="/trending">
            <div class="px-1 appbar-text" to="/trending">
              <span :class="$route.name === 'Trending' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">Trending</span>
            </div>
          </router-link>
          <router-link class="ma-0 pa-0" to="/timelines">
            <div class="px-1 appbar-text">
              <span :class="$route.name === 'Timelines' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">Timeline</span>
            </div>
          </router-link>
          <router-link to="/mycliplist">
            <div class="px-1 appbar-text">
              <span :class="$route.name === 'Mycliplist' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">My Cliplist</span>
            </div>
          </router-link>
          <router-link class="ma-0 pa-0" to="/streamer">
            <div class="px-1 appbar-text">
              <span :class="$route.name === 'Streamer' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">Streamer</span>
            </div>
          </router-link>
          <router-link class="ma-0 pa-0" to="/report?type=overall">
            <div class="px-1 appbar-text">
              <span :class="$route.name === 'Report' ? 'twitch--text' : '' " class="text-subtitle-2 text-lg-body-1 pr-1">Report</span>
            </div>
          </router-link>
        </div>
      </v-row>
    </v-container>
    <v-spacer></v-spacer>
    <div class="px-3">
    <SearchBar></SearchBar>
    </div>
    <v-avatar
      class="hoverCursor"
      @click="changeDrawer(!drawer)"
      v-if="$store.state.userinfo.userInfo"
      size="36"
    >
      <img
      :src="$store.state.userinfo.userInfo.photoURL" lazy-src="@/assets/img/404.jpg">
    </v-avatar>
    <SignInDialog v-else :type="{parent:'appBar'}"></SignInDialog>
  </v-app-bar>
</template>
<script>

import SearchBar from '@/components/SearchBar.vue';
import SignInDialog from '@/components/dialog/SignInDialog.vue';
import axios from 'axios';
import { mapState } from 'vuex'
import { mapMutations } from 'vuex'
export default {
  components: {
    SearchBar,
    SignInDialog,
  },
  data() {
    return {
      dialog: false,
      logoutLoading: false,
      subscribeDeviceLoading:false,
      unsubloadingId:'',
      devices:[],
      fcmToken:'',
      navi:'',
      deviceName:'',
      deviceRules:{
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length < 16 || 'Max 15 characters',
      },
    };
  },
  methods: {
    ...mapMutations({
      changeDrawer: 'SET_Drawer',
      changeIsListed: 'SET_isListed',
    }),
    deviceLogo(element){
      if(element === 'Chrome'){
        return 'mdi-google-chrome'
      }else if (element === 'iPhone' || element === 'iPod' || element === 'iPad'){
        return 'mdi-apple'
      }else if (element === 'Android Tablet'){
        return 'mdi-tablet-android'
      }else if (element === 'Edge'){
        return 'mdi-microsoft-edge'
      }else if (element === 'Android'){
        return 'mdi-android'
      }else if (element === 'Safari'){
        return 'mdi-apple-safari'
      }else if (element === 'Firefox'){
        return 'mdi-firefox'
      }else if (element === 'Opera'){
        return 'mdi-opera'
      } else {
        return 'mdi-web'
      }
    },
    toggleDarkTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('dark', this.$vuetify.theme.dark);
    },
    async logOut(){
      this.logoutLoading = true;
      await this.$firebase.auth().signOut().then(() =>{
      this.logoutLoading = false;
      this.changeDrawer(false);
      this.$router.push({name:'Home'}).catch(()=>{});
      this.$store.commit('SET_SnackBar',{type: 'error', text:'로그아웃', value:true})
      });
    },
    async enrollFCM(){
      this.subscribeDeviceLoading = true;
      await axios.post(`${this.$store.state.backendUrl}/fcm/create`,{
        uid: this.$store.state.userinfo.userInfo.uid,
        fcmToken: this.fcmToken,
        device: this.navi,
        name: this.deviceName,
      },
      {
        'Content-Type':'application/json',
      }).then((res) => {
        this.deviceName = ''
        this.subscribeDeviceLoading = false;
      })

    },
    async disenrollFCM(fcmToken){
      this.unsubloadingId = fcmToken;
      await axios.post(`${this.$store.state.backendUrl}/fcm/delete`,{
        uid: this.$store.state.userinfo.userInfo.uid,
        fcmToken: fcmToken,
      },
      {
        'Content-Type':'application/json',
      }).then((res) => {
        if(fcmToken === this.fcmToken){
          this.changeIsListed(false);
        };
        this.unsubloadingId = '';
      })

    },
    searchChannel(el) {
      if(el === '' || null){ return }
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
      this.changeDrawer(false);
    },
  },
  computed: {
    ...mapState({
      drawer: 'drawer',
      isListed: 'isListed',
    }),
    isIOS(){
      const upper = this.navi.toUpperCase();
      if(upper === 'IPAD' || upper === 'IPHONE' || upper === 'SAFARI'){
        return true;
      } else {
        return false;
      }
    },
  },
  async created() {
    if(navigator.userAgent.match(/iPad/i)){
      this.navi = 'iPad';
    } else if (navigator.userAgent.match(/Tablet/i)){
      this.navi='Adroid Tablet'
    } else if (navigator.userAgent.match(/Android/i)){
      this.navi='Android'
    } else if (navigator.userAgent.match(/iPhone|iPod/i)){
      this.navi='iPhone'
    } else if (navigator.userAgent.match(/Edg/i)){
      this.navi = 'Edge'
    } else if (navigator.userAgent.match(/Whale/i)){
      this.navi = 'Whale'
    } else if (navigator.userAgent.match(/firefox/i)){
      this.navi = 'Firefox'
    } else if (navigator.userAgent.match(/opera/i)){
      this.navi = 'Opera'
    } else if (navigator.userAgent.match(/chrome/i)){
      this.navi='Chrome'
    } else if (navigator.userAgent.match(/safari/i)){
      this.navi='Safari'
    } else {
      this.navi='other'
    }
    if(this.navi !== 'ipad' && this.navi !== 'iphone' && this.navi !== 'safari'){
      this.fcmToken = await this.$messaging.getToken({ vapidKey:this.$store.state.fcmApiKey}).catch(()=>{});
    }

    this.$firebase.auth().onAuthStateChanged( async (user) => {
      if(user){
        await this.$firertdb.ref(`/users/${this.$store.state.userinfo.userInfo.uid}/register_ids`).on('value', (sn) => {
          if(sn.val() !== null){
            const item = sn.val();
            this.devices = Object.entries(item);
            if(item[this.fcmToken]){
              this.changeIsListed(true);
            }
          }else {
            this.devices = [];
          }
        })
      }
    });
  },
};
</script>
<style lang="scss">
.v-toolbar__content{
  padding: 0px !important;
}
.v-toolbar__extension{
  padding-top: 0px !important;
}
#app-bar{
  position: absolute;
  top: 0;
  margin-left: 15%;
  margin-right: 15%;
}
.v-dialog.drawer{
  border-radius: 5px;
  overflow-y: auto;
  pointer-events: auto;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 100%;
  height:inherit;
  z-index: inherit;
  box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);
}
.v-dialog--fullscreen.drawer{
  border-radius: 5px;
  position: fixed;
  top: 30vh;
  height: 70vh;
  left: 15%;
  width: 40%;
}
@media screen and (min-width: 600px) and (max-width: 1264px) {
  .v-dialog--fullscreen.drawer{
    border-radius: 5px;
    top: 10vh;
    height:90vh;
    left: 10px;
    width: 70%;
  }
}
@media screen and (max-width: 600px){
    .v-dialog--fullscreen.drawer{
    top: 60px;
    left: 0;
    height:95vh;
    width: 100%;
  }
}
.appbar-text:hover{
  color: var(--twitch-color);
}
</style>
