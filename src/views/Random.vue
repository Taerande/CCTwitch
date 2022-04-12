<template>
<v-container>
  <v-row v-for="(item,i) in items" :key="i">
    <v-btn @click="addSnackBar()">{{item.data}}</v-btn>
  </v-row>

  <v-snackbar
  id="snack-bar"
  timeout="1500"
  v-model="$store.state.snackbar.value"
  :color="$store.state.snackbar.type">
    <div class="d-flex justify-space-between align-center">
      <div>
        {{ $store.state.snackbar.text }}
      </div>
      <v-btn
        icon
        @click="$store.commit('SET_SnackBar',{value: false})">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
  </v-snackbar>

</v-container>
</template>
<script>
import axios from 'axios'

export default {
  data() {
    return {
      items: [
        { data: '1st Snack', type: 'info', value: true },
        { data: '2nd Snack', type: 'error', value: true },
        { data: '3rd Snack', type: 'success', value: true },
        { data: '4th Snack', type: 'primary', value: true },
      ],
      snackbarQue: [],
    };
  },
  methods: {
    getuserInfo(){

    },
    postProcess(){

    }

  },
  mounted() {
    const accessToken = document.location.hash.split('&')[0].split('=')[1];
    axios.get('https://id.twitch.tv/oauth2/userinfo',{
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }).then((res) =>{
      this.$firebase.auth().createUserWithEmailAndPassword(res.data.email, 'twitch:'+res.data.sub).then( async () => {
        const user = await this.$firebase.auth().currentUser;
        user.updateProfile({
          displayName: res.data.preferred_username,
          photoURL: res.data.picture
        }).then(() => {
          this.$store.commit('SET_UserInfo', user);
        })
      })
      .catch( async () => {
        await this.$firebase.auth().signInWithEmailAndPassword(res.data.email,'twitch:'+res.data.sub).then(() => console.log('sign up success'));
        const user = await this.$firebase.auth().currentUser;
        user.updateProfile({
          displayName: res.data.preferred_username,
          photoURL: res.data.picture
        }).then(() => {
          this.$store.commit('SET_UserInfo', user);
        })
        });
      }).then(() => {
        this.$router.push('/');
      })
  },

};
</script>
<style lang="scss" scoped>
#snack-bar{
  position: fixed;
  margin: 0 auto;
  left: 0;
  right: 0%;
  bottom: 85%;
}
</style>
