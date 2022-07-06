<template>
<v-container fluid>
  <v-row v-if="loading">
    <v-progress-linear :indeterminate="true"></v-progress-linear>
  </v-row>
  <v-row v-else>
    <v-col cols="12">
      <div id="chart">
        <apexchart type="treemap" height="350" :options="chartOptions" :series="series"></apexchart>
      </div>
    </v-col>
  </v-row>
  <v-row>
    <v-col>생방송 갯수 {{streamerCount}}</v-col>
    <v-col>토탈 카운트(시청자) {{totalCount}}</v-col>
  </v-row>
  <v-row>
    <v-col v-for="item in streamData" :key="item.id" class="pa-1">
      <v-card :img="item.box_art_url">
        {{item}}
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
      streamerCount:0,
      loading:false,
      streamerList : [],
      fcmToken:'',
      navi:'',
      userAgent:'',
      series: [
      ],
      chartOptions: {
        legend: {
          show: false
        },
        chart: {
          height: 350,
          type: 'treemap'
        },
        fill: {
          type: 'image',
          image: {
            src: [
              "https://static-cdn.jtvnw.net/ttv-boxart/504504672_IGDB-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/509658-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/512111_IGDB-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/21779-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/504504672_IGDB-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/509658-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/504504672_IGDB-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/509658-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/504504672_IGDB-173x230.jpg",
              "https://static-cdn.jtvnw.net/ttv-boxart/509658-173x230.jpg",
              ],
          },
          pattern:{
            style:'squares',
          }
        },
        title: {
          text: 'Distibuted Treemap (different color for each cell)',
          align: 'center'
        },
        plotOptions: {
          treemap: {
            distributed: true,
            enableShades: true,
          }
        }
        },
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
    async getBoxArt(id){
      await axios.get('https://api.twitch.tv/helix/games',{
        headers:this.$store.state.headerConfig,
        params:{
          id:id
        }
      }).then((res) => {
        const duplicatedElement = this.streamData.findIndex(x => x.game_id === id );
         this.streamData[duplicatedElement]['box_art_url'] = res.data.data[0].box_art_url.split('{width}x{height}')[0] + '173x230.jpg';
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
      this.loading = true;
      await axios.get('https://api.twitch.tv/helix/streams',{
        headers:this.$store.state.headerConfig,
        params:{
          language: 'ko',
          first: 100,
          after: this.cursor,
        }
      }).then(async (res) => {
        this.streamerCount += res.data.data.length;
        await res.data.data.map(async (v) => {
          const duplicatedElement = this.streamData.find(x => x.game_id === v.game_id );
          if(duplicatedElement){
            duplicatedElement.viewer_count += v.viewer_count;
            this.totalCount += v.viewer_count;
          } else {
            this.totalCount += v.viewer_count;
            this.streamData.push({
              game_id: v.game_id,
              box_art_url: null,
              game_name: v.game_name,
              viewer_count: v.viewer_count,
            })
            await this.getBoxArt(v.game_id);
          }
          this.streamingList.push({
            id: v.id,
            game_id: v.game_id,
            user_login: v.user_login,
            user_name: v.user_name,
            viewer_count: v.viewer_count,
          })
        })
        // this.cursor = res.data.pagination.cursor;
        // if(res.data.data.length !== 0){
        //   this.getLiveStreamWithLang();
        // } else {

        // }
      })
    },
  },
  async created() {
    await this.getLiveStreamWithLang();
    this.streamingList.sort((a,b) => b.viewer_count - a.viewer_count)
    this.streamData.sort((a,b) => b.viewer_count - a.viewer_count)
    let newSeries1 = this.streamData.slice(0,10);
    // let newSeries2 = this.streamData.slice(5,10);
    // let boxart = []
    // newSeries1.map((v) => {
    //   boxart.push(v.box_art_url)
    // });
    // this.chartOptions.fill.image.src = boxart
    // newSeries1 = newSeries1.map((v) => {
    //   return {
    //     x: v.game_name,
    //     y: v.viewer_count,
    //   }
    // })
    // this.series[0].data = newSeries1;
    newSeries1.forEach(element => {
      this.series.push({data:[{x:element.game_name, y:element.viewer_count}]})
      // .src
    })
    this.loading = false;
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
