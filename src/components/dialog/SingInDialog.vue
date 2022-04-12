<template>
<v-dialog hide-overlay persistent no-click-animation v-model="dialog" max-width="900" @keydown.esc="dialog = false">
  <template v-slot:activator="{on}">
    <v-btn v-on="on" icon>
      <v-icon>mdi-account-outline</v-icon>
    </v-btn>
  </template>
  <v-card class="pa-5 rounded-xl">
    <v-card-title class="d-flex justify-center">
      <span class="px-3">로그인</span>
      <span class="px-3">회원가입</span>
      <v-btn class="absolute-right" color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-text>
      <v-subheader class="pa-0">이메일로 로그인</v-subheader>
      <v-row>
        <v-text-field
          outlined
          color="twitch"
          v-model="email"
          label="이메일"
          hide-details="auto"></v-text-field>
      </v-row>
      <v-row class="py-10">
        <v-text-field
          color="twitch"
          outlined
          v-model="password"
          :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
          :type="show ? 'text' : 'password'"
          @click:append="show = !show"
          label="비밀번호"
          hide-details="auto"></v-text-field>
      </v-row>
      <v-row class="d-flex justify-center">
        <v-btn x-large class="rounded-pill" depressed color="primary" @click="signInWithEmail">로그인</v-btn>
      </v-row>
      <v-row class="d-flex justify-center align-center py-10">
        <v-divider></v-divider>
        <span class="mx-3">OR</span>
        <v-divider></v-divider>
      </v-row>
      <v-subheader class="pa-0">소셜 로그인</v-subheader>
      <v-row class="d-flex justify-center py-5">
          <v-btn dark color="twitch" depressed rounded class="mx-3" @click="signInWithTwitch()">
            <v-icon>mdi-twitch</v-icon>
            <span>트위치로 로그인하기</span>
          </v-btn>
          <v-btn light depressed rounded class="mx-3" @click="signInWithGoogle">
            <v-icon>mdi-google</v-icon>
            <span>구글로 로그인하기</span>
          </v-btn>
          <v-btn dark depressed rounded class="mx-3">
            <v-icon>mdi-apple</v-icon>
            <span>애플로 로그인하기</span>
          </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
</v-dialog>
</template>
<script>
import cryptoRandomString from 'crypto-random-string';
export default {
  data() {
    return {
      show: false,
      email: '',
      password: '',
      dialog:false,
    }
  },
  methods: {
    async signInWithGoogle() {
      const provider = new this.$firebase.auth.GoogleAuthProvider();
      const r = await this.$firebase.auth().signInWithPopup(provider);
      console.log(r);
    },
    async signInWithEmail(){
      console.log(this.email, this.password);
      const r = await this.$firebase.auth().createUserWithEmailAndPassword(this.email, this.password);
      console.log(r);
    },
    signInWithTwitch() {
      let state = cryptoRandomString({length: 16});
      window.open(`https://id.twitch.tv/oauth2/authorize?response_type=token+id_token&client_id=c3ovwwcs9lhrx1rq13fsllzqfu9o9t&redirect_uri=http://localhost:8080/random&scope=openid+user%3Aread%3Aemail&state=${state}&claims={"id_token":{"email":null,"email_verified":null},"userinfo":{"preferred_username":null,"email":null,"email_verified":null,"picture":null}}`,'_self');
    },
}
}
</script>
<style lang="scss" scoped>
.absolute-right{
  position: absolute !important;
  right: 1rem !important;
}

</style>
