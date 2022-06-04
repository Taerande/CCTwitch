<template>
<v-overlay
>
  <v-container fluid>
    <v-row class="d-block">
      <div class="d-flex justify-center">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
      <div>
        Login Processing CCTwitch...
      </div>
    </v-row>
  </v-container>
</v-overlay>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Login',
  components: {
  },
  data() {
    return {
    };
  },
  methods: {
  },
  created(){
    document.title = 'Login - CCTWITCH'
    const autoLogin = localStorage.getItem('autoLogin');
    axios.get(`${this.$store.state.backendUrl}/twitchAuth/signin/twitch/callback?code=${this.$route.query.code}`).then( async (res) =>{
      if(autoLogin === 'true'){
        await this.$firebase.auth().setPersistence(this.$firebase.auth.Auth.Persistence.LOCAL).then(() => {
          return this.$firebase.auth().signInWithCustomToken(res.data.token);
        })
      } else {
        await this.$firebase.auth().setPersistence(this.$firebase.auth.Auth.Persistence.SESSION).then(() => {
          return this.$firebase.auth().signInWithCustomToken(res.data.token);
        })
      }
      localStorage.setItem('twitchOAuthToken', JSON.stringify(res.data.twitchOAuthToken));
    }).then(()=>{
      localStorage.setItem('state',null);
      this.$router.push({name:'Home'});
      this.$store.commit('SET_SnackBar',{type:'success', text:'로그인 성공', value:true})
    }).catch(() =>{
      this.$router.push({name:'Home'});
      this.$store.commit('SET_SnackBar',{type:'error', text:'로그인 정보가 잘못되었습니다.', value:true})
    });
  },
};
</script>
