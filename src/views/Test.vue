<template>
<v-container fluid>
  <v-row v-if="dataloading">
    <v-col cols="12">
      <div id="chart">
        <apexchart type="treemap" height="1500" :options="chartOptions" :series="series"></apexchart>
      </div>
    </v-col>
  </v-row>
  <v-row class="col-12" v-if="lineloading">
    <v-col cols="12">
      <div id="chart">
        <apexchart type="line" height="350" :options="linechartOptions" :series="lineSeries"></apexchart>
      </div>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-text-field
        name="name"
        label="label"
        id="id"
        v-model="userSearch"
      ></v-text-field>
      <v-btn color="success" @click="searchUser()">search</v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-btn color="success" block @click="getTreemap()">text</v-btn>
    <v-btn color="error" block @click="addNewData()">load Data</v-btn>
    <v-btn color="info" block @click="removeData()">remove</v-btn>
  </v-row>
  <v-row>
    <v-col>날짜 {{asdf}}</v-col>
    <v-col>생방송 갯수 {{streamerCount}}</v-col>
    <v-col>토탈 카운트(시청자) {{viewerCount}}</v-col>
  </v-row>
  <v-row>
    <v-col v-for="item in streamData" :key="item.id" class="pa-1">
    <div class="green">
      {{item.game_name}}
    </div>
    <div class="red">
      {{item.viewer_count}}
    </div>
    </v-col>
  </v-row>
</v-container>
</template>
<script>
import axios from 'axios'

export default {
  data() {
    return {
      userSearch:'',
      lineloading:false,
      streamData:[],
      streamingList:[],
      cursor:null,
      viewerCount:0,
      userSearchLoading:false,
      treemap:{
        total_stream:0,
        total_viewer:0,
      },
      dbdata:null,
      dataloading:false,
      streamerCount:0,
      loading:true,
      fcmToken:'',
      navi:'',
      userAgent:'',
      series: [
      ],
      lineSeries:[],
      linechartOptions:{
        legend:{
          show:true,
        },
        tooltip:{
          enabled: true,
          x:{
            show:true,
            format: 'HH:mm'
          },
        },
        chart: {
          height: 350,
          type: "line"
        },
        title: {
          text: "Stream & Viewers Twitch-KR (cctwitch.xyz)"
        },
        xaxis: {
          type: "datetime",
          labels:{
            datetimeUTC: false,
            datetimeFormatter: {
              hour: 'HH:mm',
            },
          }
        },
        markers: {
          size: 1
        },
        yaxis: [
          // {
          //   title: {
          //     text: "Streams"
          //   }
          // },
          {
            opposite: true,
            title: {
              text: "Viewers"
            }
          }
        ],
         labels: [],
      },
      chartOptions: {
        legend: {
          show: true
        },
        chart: {
          height: 1500,
          type: 'treemap',
        },
        fill: {
          type: 'image',
          image: {
            src: [
              ],
              width:75,
              height:100
          },
        },
        theme:{
          mode:'dark'
        },
        title: {
          text: 'Distibuted Treemap (cctwitch.xyz)',
          align: 'center'
        },
      }
    }
  },
  computed:{
    asdf(){
        const korTime = this.$moment().add(-22,'hours').hours();
        const min = this.$moment().minutes();
        const hour = this.$moment().hours();
        const streamDateId = this.$moment(`${hour}:${min}`,'hh:mm').valueOf();
        let date;
        // if(korTime.hours() < 7 ){
        //   date = korTime.add(-1,'days').format('YY-MM-DD');
        // } else {
        //   date = korTime.format('YY-MM-DD')
        // }

      return korTime;
    },
    streamDate(){
      const min = new Date().getMinutes();
      const hour = new Date().getHours();
      if( min < 15 ){
        return this.$moment(hour+':00','hh:mm').toISOString();
      } else if (min < 30) {
        return this.$moment(hour+':15').toISOString();
      } else if (min < 45) {
        return this.$moment(hour+':30','hh:mm').toISOString();
      } else if (min < 59) {
        return this.$moment(hour+':45','hh:mm').toISOString();
      } else {
        return this.$moment(hour+':00','hh:mm').toISOString();
      }
    }
  },
  methods: {
    async getUserInfo(element) {
      return await axios.get('https://api.twitch.tv/helix/users',{
        params: {
          id : element,
        },
        headers:this.$store.state.headerConfig,
      }).then((res) => {
        return res.data.data[0].display_name;
      });
    },
    async searchChannel(el) {
      await axios.get('https://api.twitch.tv/helix/search/channels', {
        params: {
          query: el,
          first: 60,
        },
        headers: this.$store.state.headerConfig,
      }).then(async (res) => {
        if(res.data.data.length > 0){
          this.searchList = res.data.data;
          let ids = [];
          res.data.data.map((element) => {
            return ids.push(element.id);
          })
          const result = await this.getUserInfo([...ids]);
          this.searchList.forEach((element) => {
            const index = result.data.data.findIndex((v) => v.id === element.id);
            element.broadcaster_type = result.data.data[index].broadcaster_type;
            element.view_count = result.data.data[index].view_count;
          })
          this.searchList.sort((a,b) => b.view_count - a.view_count);
        }
      })
      .catch(() =>{
      });
      this.dataLoading = true;
    },
    async getTreemap(){
      await axios.get('https://api.twitch.tv/helix/streams',{
        headers:this.$store.state.headerConfig,
        params:{
          language: 'ko',
          first: 100,
          after: this.cursor,
        }
      }).then(async (res) => {
        this.cursor = res.data.pagination.cursor;
        this.streamerCount += res.data.data.length;
        res.data.data.forEach((element) => {
          if(element.viewer_count < 20) {
            this.viewerCount += 1;
          }
        })
        if(res.data.data.length !== 0){
          await this.getTreemap()
        }
      })
      // .then(() => {
      //   this.$streamData.ref('treemap/'+this.asdf).set(this.treemap);
      // })
    },
    async removeData(){
      this.linechartOptions.title.text = '22-07-09 Statistics (cctwitch.xyz)'
      const streamerList = ['49045679','195641865','203667951','169700336','237570548']
      // const streamerList = ["103861159"]
      let result = [];
      streamerList.forEach(async (element) => {
        await this.$streamData.ref(`/stream_data/${element}/22-07-09`).get().then( async (sn) =>{
          this.lineSeries.push({name: await this.getUserInfo(element), id:element, data:[]});
          for(let name in sn.val()){
            const idx = result.findIndex( x => x.time === new Date(name*1).getTime());
            if(idx > -1){
              result[idx][element] = sn.val()[name].viewer_count;
            } else {
              let resultObj = {
                time: new Date(name*1).getTime(),
              };
              streamerList.map(v => {
                if(v === element){
                  resultObj[v] = sn.val()[name].viewer_count;
                } else {
                  resultObj[v] = null;
                }
              });
              result.push(resultObj);
            }
          }
        })
      });
      result.sort((a,b) => {a.time*1 - b.time*1});
      setTimeout(() => {
        result.map((v) => {
          this.linechartOptions.labels.push(v.time);
          streamerList.map((x) => {
            const idx = this.lineSeries.findIndex((i) => i.id === x)
            this.lineSeries[idx].data.push(v[x]);
          })
        });
        console.log(result);

        this.lineloading = true;
      }, 5000);
    },
    async addNewData(){
      const tartget = this.$streamData.ref('/treemap/1657204200000').orderByChild('viewer_count').limitToLast(15);
      await tartget.get().then((sn) => {
        console.log(sn.val());
        this.streamerCount = sn.val().total_stream
        this.viewerCount = sn.val().total_viewer
        for (let name in sn.val()){
          this.streamData.push(sn.val()[name])
        }
        this.streamData.sort((a,b) => b.viewer_count - a.viewer_count);

      });
      let newSeries1 = this.streamData.slice(0,15);
      newSeries1.sort((a,b) => b.viewer_count - a.viewer_count);
      newSeries1.forEach( async (element, index) => {
        const result = await this.getBoxArt(element.game_name);
        this.chartOptions.fill.image.src.push(result);
        let topStreamer = element.topStreamer
        let topStremers = [];
        let etcView = element.viewer_count;
        let etcStream = element.stream_count;
        for (let name in topStreamer){
          if(topStreamer[name].viewer > 99){
            etcView -= topStreamer[name].viewer;
            topStremers.push({x: topStreamer[name].user_name, y:topStreamer[name].viewer});
          }
        }
        topStremers.sort((a,b) => b.y - a.y);
        etcStream -= topStremers.length;
        this.series.push({name:`${element.game_name}[${element.viewer_count}(${element.stream_count})]`,viewer:element.viewer_count, data: index > 5 ? topStremers.slice(0,5) : topStremers.slice(0,11)} )
        this.series[index].data.push({x:`etc(${etcStream
        })`, y:etcView})
        this.series.sort((a,b) => b.viewer_count - a.viewer_count);
      })
      this.dataloading = true;
    },
    // async wak(){
    //   this.dbLoading = true;
    //   await axios.get(this.$store.state.backendUrl+'/weeklyWaktaverse/waktaverse'+`?appAccessToken=${this.$store.state.headerConfig.Authorization}`).then((res) => {
    //     this.$store.commit('SET_SnackBar', {type:'success', text:'업데이트', value:true})
    //     console.log(res);
    //     this.dbLoading = false;
    //   }).catch(()=>{
    //       this.dbLoading = false;
    //     })

    // },

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
    async getBoxArt(name){
      return await axios.get('https://api.twitch.tv/helix/games',{
        headers:this.$store.state.headerConfig,
        params:{
          name:name
        }
      }).then((res) => {
        return  res.data.data[0].box_art_url.split('{width}x{height}')[0] + '173x230.jpg';
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
        this.cursor = res.data.pagination.cursor;
        await res.data.data.map(async (v) => {
          const duplicatedElement = this.streamData.find(x => x.game_id === v.game_id );
          if(duplicatedElement){
            duplicatedElement.viewer_count += v.viewer_count;
            if(v.viewer_count > 30){
              duplicatedElement.streamer.push({x:v.user_name, y:v.viewer_count});
              duplicatedElement.streamer.sort((a,b) => b.viewer_count - a.viewer_count);
            }
            this.totalCount += v.viewer_count;
          } else {
            this.totalCount += v.viewer_count;
            this.streamData.push({
              game_id: v.game_id,
              game_name: v.game_name,
              viewer_count: v.viewer_count,
              streamer:[{x:v.user_name, y:v.viewer_count}],
            })
          }
        })
        if(res.data.data.length !== 0){
          await this.getLiveStreamWithLang()
        } else {
          this.loading = false;
        }
      })
    },
  },
  async created() {
    // await this.getLiveStreamWithLang();
    // this.streamingList.sort((a,b) => b.viewer_count - a.viewer_count)
    // this.streamData.sort((a,b) => b.viewer_count - a.viewer_count)
    // let newSeries1 = this.streamData.slice(0,15);
    // newSeries1.sort((a,b) => b.viewer_count - a.viewer_count);
    // newSeries1.forEach( async (element, index) => {
    //   const result = await this.getBoxArt(element.game_id);
    //   this.chartOptions.fill.image.src.push(result);
    //   this.series.push({name:`${element.game_name}[${element.viewer_count} / (${element.streamer.length})]`, data: index > 5 ? element.streamer.slice(0,4) : element.streamer.slice(0,10)} )
    // })
    // this.loading = false;
  },

}
</script>
<style>

</style>
