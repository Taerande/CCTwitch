tes<template>
<v-container fluid>
  <v-row class="pt-10">
    <v-col cols="12" xl="3" lg="3" class="pa-2" v-for="item in streamerList" :key="item.id">
      <v-card>
        <v-card-text>
          <div>
            {{item.display_name}}
          </div>
          <div>
            {{item.id}}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :disabled="$store.state.userinfo.userInfo === null" color="success" @click="subNotification(item.id)">subscribe</v-btn>
          <v-btn :disabled="$store.state.userinfo.userInfo === null" color="error" @click="unsubNotification(item.id)">unsubscribe</v-btn>
          <v-btn color="info" icon @click="subscribe(item.id)"><v-icon>mdi-bell</v-icon></v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <v-row class="col-12">
    <v-col>
      <v-card>
        {{fcmToken}}
      </v-card>
    </v-col>
    <v-col>
      <v-card>
        {{navi}}
      </v-card>
      <v-card>
        {{userAgent}}
      </v-card>
      <v-btn color="success" @click="enrollFCM()" icon><v-icon>mdi-bell-ring</v-icon></v-btn>
      <v-btn color="error" @click="disenrollFCM()" icon><v-icon>mdi-bell-off</v-icon></v-btn>
    </v-col>
  </v-row>
  <v-row>

  </v-row>
</v-container>
</template>
<script>
import axios from 'axios'

export default {
  data() {
    return {
      streamData:[],
      streamingList:[],
      cursor:null,
      totalCount:0,
      dbdata:null,
      streamerList : [],
      fcmToken:'',
      navi:'',
      userAgent:'',
    }
  },
  methods: {
    async subscribe(id){
      let type = ['stream.offline','channel.update','stream.online'];
      const token = JSON.parse(localStorage.getItem('twitchAppAccessToken'));
      for(let i = 0; i < type.length; i++){
        let error;
        await axios.post(`${this.$store.state.backendUrl}/twitchWebHook/createWebhook`,{
          id: id,
          token: token,
          type: type[i],
        },
        {
          'Content-Type':'application/json',
        }
        ).then((res) => {
          console.log(res);
          error = res.data.error;
        });
        if(error !== undefined){
          break;
        };
      }
    },
    async enrollFCM(){
      await axios.post(`${this.$store.state.backendUrl}/fcm/create`,{
        uid: this.$store.state.userinfo.userInfo.uid,
        fcmToken: this.fcmToken,
        device: this.navi
      },
      {
        'Content-Type':'application/json',
      }).then((res) => {
        console.log(res);
      })

    },
    async disenrollFCM(){
      await axios.post(`${this.$store.state.backendUrl}/fcm/delete`,{
        uid: this.$store.state.userinfo.userInfo.uid,
        fcmToken: this.fcmToken,
      },
      {
        'Content-Type':'application/json',
      }).then((res) => {
        console.log(res);
      })

    },
    async subNotification(broadcaster_id){
      await this.$firertdb.ref(`/notification/${broadcaster_id}/subscribers`).update({
        [this.$store.state.userinfo.userInfo.uid] : true
      }).then(()=>{
        console.log('success')
      })
    },
    async unsubNotification(broadcaster_id){
      await this.$firertdb.ref(`/notification/${broadcaster_id}/subscribers`).update({
        [this.$store.state.userinfo.userInfo.uid] : false
      }).then(()=>{
        console.log('success')
      })
    },
    async getLiveStreamWithLang(){
      await axios.get('https://api.twitch.tv/helix/streams',{
        headers:this.$store.state.headerConfig,
        params:{
          language: navigator.language.split('-')[0],
          first: 100,
          after: this.cursor,
        }
      }).then(res => {
        res.data.data.map((v) => {
          const duplicatedElement = this.streamData.find(x => x.game_id === v.game_id );
          if(duplicatedElement){
            duplicatedElement.viewer_count += v.viewer_count;
            this.totalCount += v.viewer_count;
          } else {
            this.totalCount += v.viewer_count;
            this.streamData.push({
              game_id: v.game_id,
              viewer_count: v.viewer_count,
            })
          }
          this.streamingList.push({
            id: v.id,
            game_id: v.game_id,
            user_login: v.user_login,
            user_name: v.user_name,
            viewer_count: v.viewer_count,
          })
        })
        this.streamingList.sort((a,b) => b.viewer_count - a.viewer_count)
        this.streamData.sort((a,b) => b.viewer_count - a.viewer_count)
        this.cursor = res.data.pagination.cursor;
      }).then(()=>{
        if(this.streamData.length < 100){
          this.getLiveStreamWithLang();
        } else {
          this.streamData.splice(100);
        }
      })
    },
  },
  async created() {
    console.log(navigator)
    this.userAgent = navigator.userAgent;
    if(navigator.userAgent.match(/iPad/i)){
      this.navi = 'ipad';
    } else if (navigator.userAgent.match(/Tablet/i)){
      this.navi='adroid tablet'
    } else if (navigator.userAgent.match(/Android/i)){
      this.navi='android'
    } else if (navigator.userAgent.match(/iPhone|iPod/i)){
      this.navi='iphone'
    } else if (navigator.userAgent.match(/Edg/i)){
      this.navi = 'Edge'
    } else if (navigator.userAgent.match(/Whale/i)){
      this.navi = 'Whale'
    } else if (navigator.userAgent.match(/firefox/i)){
      this.navi = 'firefox'
    } else if (navigator.userAgent.match(/opera/i)){
      this.navi = 'opera'
    } else if (navigator.userAgent.match(/safari/i)){
        this.navi='safari'
    } else if (navigator.userAgent.match(/chrome/i)){
      this.navi='chrome'
    } else {
      this.navi='other'
    }
    this.fcmToken = await this.$messaging.getToken({ vapidKey:'BKLOaHl9k-gFVZJIFGnxNOB5pJ8KHuyNuHQQnRmL5pQFqPgPavVFtD8gZzlUwinf1V0ZxGBqgkwIBZ1gM2IunXQ'}).catch(()=>{});
    this.streamerList = JSON.parse(localStorage.getItem('alllikes'));
    // let db = await this.$firebase.database().ref(`/prediction/116727016`);
    // db.on('value', (snapshot) =>{
    //   const data = snapshot.val();
    //   this.dbdata = data;
    //   document.title = `${data.title} | CCTwitch`
    //   let audio = new Audio(require('@/assets/audio/alram.mp3'));
    //   audio.play()
    // });

    // await this.getLiveStreamWithLang();

  },

}
</script>
<style>

</style>
