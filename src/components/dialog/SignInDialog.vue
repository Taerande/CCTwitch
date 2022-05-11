<template>
<v-dialog persistent no-click-animation v-model="dialog" max-width="900" @keydown.esc="dialog = false">
  <template v-slot:activator="{on}">
    <v-btn v-if="type.parent == 'pinclip'" icon>
      <v-icon v-on="on" size="20" color="red">mdi-plus-box-multiple</v-icon>
    </v-btn>
    <v-btn v-on="on" :loading="loginLoading" v-else-if="type.parent == 'quickMenu'" width="100%" dark color="twitch">Login</v-btn>
    <v-btn v-else v-on="on" class="twitch" :loading="loginLoading">
      <span>로그인</span>
    </v-btn>
  </template>
  <v-card class="pa-5">
    <v-card-title class="d-flex justify-center">
      <span class="px-3">로그인</span>
      <v-btn class="absolute-right" color="error" icon
      @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text>
      <v-row class="d-flex justify-center py-5">
        <v-btn x-large dark color="twitch" depressed rounded class="mx-3" @click="AuthenticateWithTwitch" :loading="loginLoading">
          <v-icon large>mdi-twitch</v-icon>
          <span>트위치로 로그인하기</span>
        </v-btn>
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
      loginLoading: false,
      dialog:false,
    }
  },
  methods: {
    closeDialog(){
      this.loginLoading = false;
      this.dialog = false;
    },
    async AuthenticateWithTwitch(){
      this.loginLoading = true;
      const state = crypto.randomBytes(16).toString("hex");
      const codeUri =
      `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=c3ovwwcs9lhrx1rq13fsllzqfu9o9t&force_verify=true&redirect_uri=`+this.$store.state.redirectUri+`/signin/twitch/callback&scope=user%3Aread%3Aemail+user%3Aread%3Afollows&state=${state}&claims={"userinfo":{"preferred_username":null,"email":null,"email_verified":null,"picture":null}}`;
      const code = await this.getCode(codeUri);
      const twitchOAuthToken = JSON.stringify(Buffer.from(code.twitchOAuthToken, 'base64').toString());

      await this.$firebase.auth().setPersistence(this.$firebase.auth.Auth.Persistence.LOCAL).then(() => {
        return this.$firebase.auth().signInWithCustomToken(code.token);
      })

      localStorage.setItem('twitchOAuthToken', JSON.parse(twitchOAuthToken));
      if(this.type.parent === 'quickMenu'){
        this.$store.commit('SET_Drawer')
      }
      this.loginLoading = false;
      this.dialog = false;
      this.$router.push('/');
      this.$store.commit('SET_SnackBar',{type: 'info', text:'로그인 성공', value:true})

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

      let tracking = setInterval(async () => {
        try {
          url = authWindow && authWindow.location && authWindow.location.search
        } catch (e) {}
        if (url) {
          const parsedCode = {
            'token' : url.split('?token=')[1].split('&twitchOAuthToken=')[0],
            'twitchOAuthToken' : url.split('?token=')[1].split('&twitchOAuthToken=')[1],
          }
          authWindow.close();
          clearInterval(tracking);
          resolve(parsedCode);
        }
      }, 100);
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
.pinClip{
  border-radius: 100%;
  background: rgb(0, 0, 0, 0.3);
}

</style>
