<template>
<v-dialog persistent no-click-animation v-model="$store.state.signInDialog" max-width="900">
  <template v-slot:activator="{on}">
    <v-btn v-if="type.parent == 'pinclip'" icon>
      <v-icon v-on="on" size="20" color="red">mdi-plus-box-multiple</v-icon>
    </v-btn>
    <v-btn v-on="on" :loading="loginLoading" v-else-if="type.parent == 'appBar'" dark color="twitch">Log In</v-btn>
  </template>
  <v-card class="pa-5">
    <v-card-title class="d-flex justify-center">
      <span class="px-3 text-h4 font-weight-black">CCTwitch</span>
      <v-btn class="absolute-right" color="error" icon
      @click="closeDialog()"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text>
      <v-row class="d-flex justify-center py-5">
        <v-btn x-large dark color="twitch" depressed rounded class="mx-3" @click="AuthenticateWithTwitch()" :loading="loginLoading">
          <v-icon large>mdi-twitch</v-icon>
          <span>Sign In with Twitch</span>
        </v-btn>
      </v-row>
      <v-row class="d-flex justify-center align-center">
        <v-checkbox :disabled="loginLoading" color="twitch" v-model="autoLogin"></v-checkbox>
        <span class="text-title" :class=" loginLoading ? 'text-decoration-line-through' : ''">Stay signed in</span>
      </v-row>
    </v-card-text>
  </v-card>
</v-dialog>
</template>
<script>
import crypto from "crypto";

export default {
  props:['type'],
  data() {
    return {
      autoLogin: false,
      loginLoading: false,
    }
  },
  methods: {
    closeDialog(){
      this.loginLoading = false;
      this.$store.commit('SET_SignInDialog', false);
    },
     AuthenticateWithTwitch(){
      this.loginLoading = true;
      const state = crypto.randomBytes(16).toString("hex");
      localStorage.setItem('state',state);
      localStorage.setItem('path',this.$route.fullPath);
      localStorage.setItem('autoLogin',this.autoLogin);
      // const codeUri =
      // `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=c3ovwwcs9lhrx1rq13fsllzqfu9o9t&redirect_uri=http://localhost:8080/login&scope=user%3Aread%3Aemail+user%3Aread%3Afollows&state=${state}`;
      window.location.href = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=c3ovwwcs9lhrx1rq13fsllzqfu9o9t&redirect_uri=${this.$store.state.redirectUri}&scope=user%3Aread%3Aemail%20user%3Aread%3Afollows&state=${state}`;
      // const code = await this.getCode(codeUri);
      // const twitchOAuthToken = JSON.stringify(Buffer.from(code.twitchOAuthToken, 'base64').toString());
      // if(this.autoLogin){
      //   await this.$firebase.auth().setPersistence(this.$firebase.auth.Auth.Persistence.LOCAL).then(() => {
      //     return this.$firebase.auth().signInWithCustomToken(code.token);
      //   })
      // } else {
      //   await this.$firebase.auth().setPersistence(this.$firebase.auth.Auth.Persistence.SESSION).then(() => {
      //     return this.$firebase.auth().signInWithCustomToken(code.token);
      //   })
      // }
      // localStorage.setItem('twitchOAuthToken', JSON.parse(twitchOAuthToken));
      // this.loginLoading = false;
      // this.$store.commit('SET_SignInDialog', false);
      // this.$store.commit('SET_Drawer', false);
      // this.$router.push({name:'Home'}).catch(()=>{});
      // this.$store.commit('SET_SnackBar',{type: 'info', text:'로그인 성공', value:true})

    },
    async getAuthToken(id){
      try {
        const token = await admin.auth().createCustomToken(id);
        return token;
      } catch (err) {
        throw err;
      }
    },
    getCode(uri){
    return new Promise((resolve, reject) => {
      const leftPosition = (window.screen.width / 2) - ((500 / 2) + 10);

      const topPosition = (window.screen.height / 2) - ((900 / 2) + 50);
      const authWindow = window.open(
        uri,
        "_blank",
        `toolbar=yes,scrollbars=yes,resizable=yes,width=500,height=900,top=${topPosition},left=${leftPosition}`
      );
      let url = '';

      let timeExceed = setTimeout(() => {
        if(!authWindow.closed){
          authWindow.close();
          clearInterval(tracking);
          this.closeDialog()
          this.$store.commit('SET_Drawer', false);
          this.$store.commit('SET_SnackBar',{type: 'error', text:'대기시간을 초과했습니다.', value:true})
        } else {
          clearInterval(tracking);
        }
      }, 300000);
      let tracking = setInterval(async () => {
        try {
          url = authWindow && authWindow.location && authWindow.location.search
        } catch (e) { clearInterval()}
        if (url) {
          const parsedCode = {
            'token' : url.split('?token=')[1].split('&twitchOAuthToken=')[0],
            'twitchOAuthToken' : url.split('?token=')[1].split('&twitchOAuthToken=')[1],
          }
          authWindow.close();
          clearInterval(tracking);
          clearTimeout(timeExceed);
          resolve(parsedCode);
        }
      }, 500);
    });
    },
  },
  mounted() {

  },
}
</script>
<style lang="scss" scoped>
.absolute-right{
  position: absolute !important;
  right: 1rem !important;
}

</style>
