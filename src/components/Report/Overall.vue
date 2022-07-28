<template>
<v-container>
  <v-btn color="success" @click="getStream()" block>getStream</v-btn>
  <v-row class="col-12">
    <v-col cols="12" class="py-3">
      <v-card  elevation="5">
        <v-card-title>
          <v-icon color="yellow" x-large>mdi-chart-timeline-variant-shimmer</v-icon>
          <span class="px-1">Today's Viewers & Streams</span>
        </v-card-title>
        <div>
          This Area is for Today's viewer, stream flow chart

          When click certain time, dialog pop out and show treemap at that time.
        </div>
        <div id="chart" v-if="loading" class="ma-5">
          <apexchart type="line" height="350" :options="linechartOptions" :series="lineSeries"></apexchart>
        </div>
        <div v-else class="d-flex justify-center">
          <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
      </v-card>
    </v-col>
  </v-row>
  <v-subheader>Top Streamers</v-subheader>
  <v-row>
    <v-slide-group
      center-active
      show-arrows>
      <v-slide-item
        class="pa-2"
        v-for="streamer in topStreams" :key="streamer.id">
        <v-card
        class="d-flex justify-center align-center flex-column hoverCursor">
         <v-avatar size="48" color="black">
           <v-img
             sizes="36"
             :src="streamer.profile_image_url"
             alt="profile_img"
           ></v-img>
         </v-avatar>
         <div class="d-flex align-center">
           <span>{{streamer.display_name}}</span>
         </div>
         <div class="error--text d-flex align-center pr-3">
           <v-icon small color="error">mdi-account</v-icon>
           {{streamer.viewer_count}}
         </div>
       </v-card>
      </v-slide-item>
     </v-slide-group>
    </v-row>
  <v-subheader>Top Categories</v-subheader>
   <v-row>
    <v-slide-group
      v-model="model"
      center-active
      show-arrows>
      <v-slide-item
        class="ma-2"
        v-slot="{ active, toggle }"
         v-for="(game, idx) in topGames" :key="idx">
        <v-card
        @click="toggle"
        width="100" class="pa-0 ma-0" flat>
        <v-img
          size="150"
          :src="game.box_art_url"
        >
        <v-card class="d-flex justify-center align-center" height="100%" :color="active ?  'rgb(0,0,0,0.5)' : 'rgb(0,0,0,0)'">
          <v-icon v-if="active" color="green" x-large>mdi-check-bold</v-icon>
        </v-card>
        </v-img>
        <div class="d-flex justify-center pr-3">
          <span class="red--text text-caption align-center">
            <v-icon color="red" small>mdi-account</v-icon>{{game.total_viewer}}
          </span>
        </div>
    </v-card>
      </v-slide-item>
     </v-slide-group>
  </v-row>
  <v-dialog
    scrollable
    v-model="dialog"
  >
    <v-card v-if="dataloading">
      <v-card-title primary-title>
        {{new Date(dialogTime*1)}}
      </v-card-title>
      <div id="chart">
        <apexchart type="treemap" height="350" :options="treemapchartOptions" :series="treemapSeries"></apexchart>
      </div>

    </v-card>

    <v-overlay
    v-else
    opacity="0"
    >
      <v-container fluid>
        <v-row class="d-block">
          <div class="d-flex justify-center">
            <v-progress-circular size="36" width="6" color="twitch" :indeterminate="true"></v-progress-circular>
          </div>
        </v-row>
      </v-container>
    </v-overlay>
  </v-dialog>
</v-container>
</template>
<script>
import axios from 'axios';
import { last } from 'lodash';

export default {
  components:{
  },
  data() {
    return {
      model:null,
      openGameTopStreamer:null,
      streamerInfo:null,
      date:'',
      loading:false,
      dialog:false,
      dataloading:false,
      streamerCount:0,
      topGames:[],
      tempIdList:[],
      topStreams:[],
      viewerCount:0,
      dialogTime:0,
      streamData:[],
      lineSeries:[
        {name:'Viewers', type:'line', data:[]},
        {name:'Streams', type:'column', data:[]}
      ],
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
           events: {
            dataPointSelection: (event, chartContext, config) => {
              this.dialog = true;
              this.getTreemap(this.linechartOptions.labels[config.dataPointIndex]);
            }
          },
          height: 350,
          type: "line",
          backgroud:'#FFFFFF',
        },
        theme:{
          mode:'light'
        },
        colors:['#00E396', '#6633ff'],
        title: {
          text: "Viewers & Streams Twitch-KR (cctwitch.xyz)"
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
        curve:'smooth',
        markers: {
          size: 1
        },
        yaxis: [
          {
            title: {
              text: "Viewers"
            }
          },
          {
            opposite: true,
            title: {
              text: "Streams"
            }
          }
        ],
        labels: [],
      },
      treemapSeries:[],
      treemapchartOptions:{
         legend: {
          show: true
        },
        chart: {
          height: 500,
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
  methods: {
    async getGame(){
      this.topGames = [];
      const tartget = this.$streamData.ref(`/treemap/22-07-14/topGame`).orderByChild('viewer_count').limitToLast(24);
      tartget.get().then((sn) => {
        for(let item in sn.val()){
          this.topGames.push({id:item, ...sn.val()[item]});
        }
      this.topGames.sort((a,b) => b.viewer_count - a.viewer_count);
      })

    },
    async getStream(){
      this.topStreams = [];
      const tartget = this.$streamData.ref(`/treemap/22-07-24/topStream`);
      await tartget.get().then( async (sn) => {
        for(let item in sn.val()){
          this.topStreams.push({id:item, ...sn.val()[item]});
          this.tempIdList.push(item);

          const idx = this.topGames.findIndex((x) => x.game_name === sn.val()[item].game_name);
          if(idx >= 0){
            this.topGames[idx].topStreamer.push(sn.val()[item]);
            this.topGames[idx].total_viewer += sn.val()[item].viewer_count;
          } else {
            this.topGames.push({
              game_name: sn.val()[item].game_name,
              topStreamer: [sn.val()[item]],
              total_viewer: sn.val()[item].viewer_count,
              box_art_url: await this.getBoxArt(sn.val()[item].game_name)
            })
          }
        }
      });
      await axios.get('https://api.twitch.tv/helix/users',{
        headers: this.$store.state.headerConfig,
        params:{
          id: this.tempIdList,
        }
      }).then( async (res) => {
        await res.data.data.forEach((el) => {
          const idx = this.topStreams.findIndex((x) => x.id === el.id );
          this.topStreams[idx] = { ...this.topStreams[idx],...{
            profile_image_url: el.profile_image_url,
            display_name: el.display_name
          }};
        })
      })
    this.topGames.sort((a,b) => b.total_viewer - a.total_viewer);
    this.topStreams.sort((a,b) => b.viewer_count - a.viewer_count);
    },
    async getBoxArt(gameName){
      return await axios.get('https://api.twitch.tv/helix/games',{
        headers: this.$store.state.headerConfig,
        params:{
          name:gameName
        }
      }).then((res) => {
        return res.data.data[0].box_art_url.split('{width}x{height}')[0] + '100x173.jpg'
      })
// "https://static-cdn.jtvnw.net/ttv-boxart/516575-{width}x{height}.jpg"
    },
    async getTreemap(datetimeId){
      this.treemapSeries = [];
      this.streamData = [];
      this.treemapchartOptions.fill.image.src = [];
      const tartget = this.$streamData.ref(`/treemap/22-07-24/timeSeries/${datetimeId}`).orderByChild('viewer_count').limitToLast(10);
      await tartget.get().then((sn) => {
        for (let name in sn.val()){
          this.streamData.push(sn.val()[name])
        }
        this.streamData.sort((a,b) => b.viewer_count - a.viewer_count);

      });
      let newSeries1 = this.streamData.slice(0,10);
      newSeries1.sort((a,b) => b.viewer_count - a.viewer_count);
      newSeries1.forEach( async (element, index) => {
        const result = await this.getBoxArt(element.game_name);
        this.treemapchartOptions.fill.image.src.push(result);
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
        this.treemapSeries.push({name:`${element.game_name}[${element.viewer_count}(${element.stream_count})]`,viewer:element.viewer_count, data: index > 5 ? topStremers.slice(0,5) : topStremers.slice(0,7)} )
        this.treemapSeries[this.treemapSeries.length-1].data.push({x:`etc(${etcStream
        })`, y:etcView})
        this.treemapSeries.sort((a,b) => b.viewer_count - a.viewer_count);
      })
      this.dataloading = true;
    },
    async getStreamData(){
      const topStream = this.$streamData.ref('/treemap/22-07-17/topStream');
      // const sebom = this.$streamData.ref('/stream_data/49045679');

      let data;
      let topStreamData;
      let viewCountLimit;
      let lastId;
      let temppArr = [];
      await topStream.get().then( async (sn) => {
        topStreamData = sn.val();
        for(let item in topStreamData) {
          temppArr.push({id:item, ...topStreamData[item]});
        }
        await temppArr.sort((a,b) => b.viewer_count - a.viewer_count);
        viewCountLimit = temppArr[temppArr.length - 1].viewer_count;
        lastId = temppArr[temppArr.length - 1].id;
        // console.log(viewCountLimit, lastId);
      })

      console.log(topStreamData['49045679'].viewer_count);

    },
  },
  async created() {
    const date = new Date().getDate()
    const month = new Date().getMonth();
    const hour = new Date().getHours()
    console.log(date, month, hour);
    // this.date =
    await this.$streamData.ref('/treemap/22-07-24/overall').get().then((sn) =>{
      for(let item in sn.val()){
        this.linechartOptions.labels.push( new Date(item*1).getTime());
        this.lineSeries[0].data.push(sn.val()[item].total_viewer);
        this.lineSeries[1].data.push(sn.val()[item].total_stream);
      }
    })
    this.loading = true
  },

}
</script>
<style>
.v-slide-group__content {
  justify-content: center;
}
.topStreamerDialog{
  position: absolute;
}
.hoverBack{
  color: rgba(255,255,255,0.8);
}
</style>
