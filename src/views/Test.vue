<template>
<v-container fluid>
  <v-row class="pt-10">
    <v-col cols="12" xl="3" lg="3" class="pa-2" v-for="item in streamerList" :key="item.id">
      <v-card>
        <v-card-text>
          <div>
            {{item.display_name}}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="subscribe(item.id)">subscribe</v-btn>
          <v-btn color="error">unsubscribe</v-btn>
        </v-card-actions>
      </v-card>

    </v-col>
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
