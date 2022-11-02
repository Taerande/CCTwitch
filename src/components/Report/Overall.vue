<template>
<v-container>
  <InArticleAdContainerVue></InArticleAdContainerVue>
  <v-divider class="my-8"></v-divider>
  <v-row class="d-flex justify-center align-center">
    <v-dialog
    v-model="dialog"
    scrollable
    max-width="500"
    transition="dialog-transition"
    >
    <v-card class="justify-center pa-0 ma-0">
      <v-card-text class="justify-center pa-0 ma-0">
        <v-date-picker
        class="d-flex justify-center"
          v-model="reportDate"
          color="twitch"
          full-width
          locale="ko-KR"
          min="2022-08-10"
          :max="new Date().getHours() > 6 ? this.$moment().format('YYYY-MM-DD') : this.$moment().add(-1,'days').format('YYYY-MM-DD')"
        ></v-date-picker>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text class="text-caption" color="error" @click="dialog = !dialog">close</v-btn>
        <v-btn text class="text-caption" color="success" :disabled="reportDate === null"  @click="changeDate(), dialog = !dialog">Apply</v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
    <span  @click="dialog = !dialog" class="d-flex align-center mx-16 hoverCursor">
      <v-icon color="error" class="px-1">mdi-calendar</v-icon>
      <span class="text-h5 twitch--text font-weight-blod">{{this.$moment(`20${this.date}`).format('ll')}}</span>
    </span>
  </v-row>
  <v-row v-if="overallLoading">
  <v-subheader>Viewers & Streams</v-subheader>
    <v-col cols="12" class="py-3 d-flex justify-center align-center">
      <v-card flat style="width:100%;">
        <div id="chart" v-if="loading" class="ma-2">
          <apexchart ref="linechart" type="line" height="350" :options="linechartOptions" :series="lineSeries"></apexchart>
        </div>
        <div v-else class="d-flex justify-center">
          <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
      </v-card>
    </v-col>
    <v-subheader>Top Streamers</v-subheader>
    <v-col class="pb-3 d-flex justify-center align-center" cols="12">
      <v-slide-group
        center-active
        show-arrows>
        <v-slide-item
          class="pa-2"
          v-for="streamer in topStreams" :key="streamer.id">
          <v-card
          width="80"
          @click="toggleTopStream(streamer)"
          flat
          :color="streamerModel.id === streamer.id ?  'rgb(0,0,0,0.2)' : 'rgb(0,0,0,0)'"
          class="pa-0 ma-0 d-flex justify-center align-center flex-column hoverCursor text-truncate">
           <v-avatar size="48" color="black">
             <v-img
               sizes="48"
               :src="streamer.profile_image_url"
               alt="profile_img"
             >
              <v-icon v-if="streamerModel.id === streamer.id" color="green" large>mdi-check-bold</v-icon>
             </v-img>
           </v-avatar>
           <div class="d-flex align-center text-caption text-truncate">
             <span>{{streamer.display_name === undefined ? 'Undefined' : streamer.display_name}}</span>
           </div>
           <div class="d-flex justify-center pr-3">
            <span class="red--text d-flex text-caption align-baseline">
              <v-icon color="red" small>mdi-account</v-icon>{{streamer.viewer_count}}
            </span>
          </div>
         </v-card>
        </v-slide-item>
      </v-slide-group>
    </v-col>
    <v-expand-transition>
      <v-card
        outlined
        v-if="streamerModel.id !== null"
        style="width:100%;"
      >
      <v-card-title class="d-flex align-center">
        <v-subheader>Chart</v-subheader>
        <v-spacer></v-spacer>
        <v-icon color="red" @click="streamerModel = {
                id:null
              }">mdi-close</v-icon>
      </v-card-title>
        <v-card-text class="d-flex align-center">
            <router-link :to="{name:'Channel', query:{
              q:streamerModel.login}}" class="d-flex align-center">
              <v-avatar size="48" color="black">
                 <v-img
                   sizes="48"
                   :src="streamerModel.profile_image_url"
                   alt="profile_img"
                 >
                 </v-img>
               </v-avatar>
               <div class="twitch--text px-3">
                {{streamerModel.display_name}}
               </div>
            </router-link>
            <v-spacer></v-spacer>
            <div class="d-flex align-center px-3">
              <v-checkbox
                class="pa-0 ma-0"
                v-model="annoXaxis"
                dense
                label="Category"
                :hide-details="true"
                :hide-spin-buttons="true"
                color="twitch"
              >
              <template v-slot:label>
                <span class="text-caption pr-5" :class="annoXaxis ? 'twitch--text' : 'grey--text text-decoration-line-through'">Category</span>
              </template>
              </v-checkbox>
              <v-checkbox
                class="pa-0 ma-0"
                v-model="annoPoint"
                dense
                :hide-details="true"
                :hide-spin-buttons="true"
                color="red"
              >
               <template v-slot:label>
                <span class="text-caption" :class="annoPoint ? 'red--text' : 'grey--text text-decoration-line-through'">Title</span>
              </template>
              </v-checkbox>
            </div>
        </v-card-text>
        <v-card-text>
          <div v-if="!streamLoading" class="ma-2">
            <apexchart ref="streamchart" type="line" height="350" :options="streamLineChartOptions" :series="streamLineSeries"></apexchart>
          </div>
          <div v-else class="d-flex align-center justify-center" style="height:350px;">
            <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
          </div>
        </v-card-text>
        <InArticleAdContainerVue></InArticleAdContainerVue>
        <v-subheader>Clips</v-subheader>
        <v-row class="d-flex justify-center col-12" v-if="streamerClips.length > 0 && !clipLoading">
          <v-col class="d-flex justify-center align-center py-10" cols="12">
            <v-slide-group
              center-active
              show-arrows>
              <v-slide-item
              v-slot="{active, toggle}"
              class="pa-2" v-for="item in streamerClips" :key="item.id">
                <v-card
                class="ma-0 pa-0" flat style="width:250px;" :color="active ?  'rgb(0,0,0,0.2)' : 'rgb(0,0,0,0)'">
                  <div @click.capture="toggle">
                    <ClipIframeDialogVue :listData="listData" :clipData="item"></ClipIframeDialogVue>
                  </div>
                  <div class="d-flex justify-center pt-2" style="width:inherit">{{item.title}}</div>
                </v-card>
              </v-slide-item>
            </v-slide-group>
          </v-col>
        </v-row>
        <v-row v-else-if="streamerClips.length === 0 && !clipLoading" class="d-flex justify-center col-12">
          <v-col class="d-flex justify-center align-center py-10" cols="12">
            No Clips
          </v-col>
        </v-row>
        <v-row class="d-flex justify-center" v-else>
          <div class="d-flex align-center justify-center" style="height:350px;">
            <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
          </div>
        </v-row>
      </v-card>
    </v-expand-transition>
    <v-subheader>Top Categories</v-subheader>
     <v-col class="pb-3 d-flex justify-center align-center" cols="12">
      <v-slide-group
        v-model="topGameModel"
        center-active
        show-arrows>
        <v-slide-item
          v-slot="{active , toggle}"
          class="pa-2"
           v-for="(game, idx) in topGames" :key="idx">
          <v-card
          @click="toggle, toggleTopGame(game)"
          class="pa-0 ma-0 d-flex justify-center align-center flex-column hoverCursor text-truncate"
          :color="active ?  'rgb(0,0,0,0.2)' : 'rgb(0,0,0,0)'"
          width="100" flat>
          <v-img
            :src="game.box_art_url"
            class="d-flex justify-center align-center"
          >
            <v-icon class="d-flex justify-center" v-if="gameModel.id === game.id" color="green" x-large>mdi-check-bold</v-icon>
          </v-img>
          <div class="d-flex justify-center pr-3 pt-2">
            <span class="red--text d-flex text-body-2 align-baseline">
              <v-icon color="red" small>mdi-account</v-icon>{{game.viewer_count}}
            </span>
          </div>
      </v-card>
        </v-slide-item>
       </v-slide-group>
    </v-col>
    <v-expand-transition>
      <v-card
        outlined
        style="width:100%;"
        v-if="gameModel.id !== null"
      >
        <v-subheader>
          Top 10 Streams
        </v-subheader>
        <v-row v-if="!gameLoading" class="d-flex">
          <v-col class="d-flex justify-center" cols="12" xl="3" lg="3" md="3" sm="6">
            <div class="ma-2 d-flex align-center">
              <div style="width:200px;">
                <div class="d-flex justify-center pb-2">
                  <div class="d-flex align-center">
                    <v-icon color="red" class="pr-1">mdi-clock-outline</v-icon> {{$moment(gameModel.time).format('MM-DD HH:mm')}}
                  </div>
                </div>
                <v-img
                  width="200"
                  :src="gameModel.box_art_url"
                  class="rounded-lg rounded-b-0 d-flex align-center"
                >
                </v-img>
                <div class="text-h6 white--text black rounded-lg rounded-t-0 d-flex justify-center">
                  {{gameModel.game_name}}
                </div>
                <div class="d-flex pt-3 px-2">
                  <div class="d-flex align-center">
                    <v-icon color="red" class="pr-1">mdi-account</v-icon>{{gameModel.viewer_count}}
                  </div>
                  <v-spacer></v-spacer>
                  <div class="d-flex align-center">
                    <v-icon color="red" class="pr-1">mdi-video</v-icon> {{gameModel.stream_count}}
                  </div>
                </div>
              </div>
              <!-- <div id="topGameBarChart" class="ma-2" style="width:300px;">
                <apexchart type="bar" height="350" :options="barCahrtOptions" :series="barSeries"></apexchart>
              </div> -->
            </div>
          </v-col>
          <v-col  cols="12" xl="9" lg="9" md="9" sm="6" class="pa-1">
            <v-row class="d-flex col-12 justify-space-between">
              <v-col
              cols="12"
              xl="4" lg="4" md="6"
              v-for="streamer in gameModel.topStreamer" :key="streamer.id"
              >
                <v-card elevation="3" outlined class="d-flex rounded-lg py-1 streamer-list" style="width:100%;" :to="{name: 'Report', query:{
              type: 'channel', id: streamer.login}}" :title="streamer.title">
                  <v-card-text class="d-flex align-center justify-center pa-2">
                      <div aria-label="avatar" class="flex-direction: column">
                        <v-avatar size="36">
                          <v-img :src="streamer.profile_image_url" alt="profile_img"></v-img>
                        </v-avatar>
                      </div>
                      <div class="text-truncate pl-4">
                        <div :class="isDark ? 'white--text' : 'twitch--text'">
                          {{streamer.user_name}}
                        </div>
                        <div class="text-caption text-truncate font-weight-bold">
                          {{streamer.title}}
                        </div>
                      </div>
                      <v-spacer></v-spacer>
                      <div class="d-flex justify-end">
                        <div class="d-flex error--text text-caption"><v-icon color="error" x-small class="pr-1">mdi-account</v-icon>{{streamer.viewer_count}}</div>
                      </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row v-else class="d-flex align-center justify-center" style="height:350px;">
          <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </v-row>
      </v-card>
    </v-expand-transition>
  </v-row>
  <v-row v-else class="d-flex justify-center align-center">
    <div class="d-flex justify-center align-center" style="height:45vh;">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  </v-row>
  <InArticleAdContainerVue></InArticleAdContainerVue>
</v-container>
</template>
<script>
import axios from 'axios';
import ClipIframeDialogVue from '../dialog/ClipIframeDialog.vue';
import InArticleAdContainerVue from '../InArticleAdContainer.vue';

export default {
  props:['listData'],
  components:{
    ClipIframeDialogVue,
    InArticleAdContainerVue,
    // StreamerChartVue,
  },
  data() {
    return {
      clipModel:null,
      topGameModel:null,
      dialog:false,
      afterCursor:'',
      reportDate:null,
      dateloading:false,
      hotClips:[],
      streamerClips:[],
      overallLoading:false,
      annoXaxis:true,
      annoPoint:true,
      annotations:{
        xaxis:[],
        points:[],
      },
      tempGameIdList:[],
      streamLoading:false,
      gameModel:{
        id:null,
      },
      streamerModel:{
        id:null,
        display_name:null,
      },
      streamerInfo:null,
      date:'',
      loading:false,
      gameLoading:false,
      streamerCount:0,
      topGames:[],
      tempIdList:[],
      topStreams:[],
      viewerCount:0,
      dialogTime:0,
      streamData:[],
      // barCahrtOptions:{
      //   chart:{
      //     type:'bar',
      //     height:500,
      //   },
      //   dataLabels:{
      //     enabled: true,
      //     style: {
      //         colors: ['#000000']
      //     },
      //   },
      //   plotOptions: {
      //       bar: {
      //         borderRadius: 4,
      //         horizontal: true,
      //       }
      //   },
      // },
      // barSeries:[
      //   {
      //     name:'Viewers',
      //     data:[]
      //   }
      // ],
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
          height: 350,
          type: "line",
          backgroud:'#FFFFFF',
        },
        theme:{
          mode:'light',
        },
        colors:['#00E396', '#6633ff'],
        title: {
          text: `Viewers & Streams Twitch-KR (cctwitch.xyz)`
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
      streamLineSeries:[
        {name:'Viewers', type:'line', data:[]},
      ],
      streamLineChartOptions:{
        legend:{
          show:true,
        },
        tooltip:{
          enabled: true,
          custom: function({series, seriesIndex, dataPointIndex, w}) {
            const time = new Date(w.config.labels[dataPointIndex]*1).toTimeString();
            let points = []
            w.config.annotations.points.forEach((v) =>
            {
              if(v.x <= w.config.labels[dataPointIndex]){
                points.push(v)
              }
            });
            const point = points.pop();
            let xaxises = []
            w.config.annotations.xaxis.forEach((v) =>
            {
              if(v.x <= w.config.labels[dataPointIndex]){
                xaxises.push(v)
              }
            });
            const xaxis = xaxises.pop();
            if(series[seriesIndex][dataPointIndex] !== null && w.config.annotations.points.length !== 0 && w.config.annotations.xaxis.length !== 0){
              return '<div class="rounded-md v-card">' +
              '<div class="v-card-title pa-1 ma-0 grey lighten-3">'+
                '<div class="black--text text-caption pa-1">'+
                  time.split(' ')[0].slice(0,5) +
                '</div>'+
              '</div>'+
              '<div class="v-card-text">'+
                '<div class="pa-1">' + '<span class="text-caption" style="color:#00E396;">'+'Viewers : '+'</span>'  + '<span class="text-caption text--black font-weight-black">'+series[seriesIndex][dataPointIndex]+'</span>' + '</div>' +
                '<div class="pa-1 red--text text-caption">' + 'Title : ' + point.label.text + '</div>' +
                '<div class="pa-1 twitch--text text-caption">' + 'Category : ' + xaxis.label.text + '</div>' +
              '</div>'+
            '</div>'
            } else if(series[seriesIndex][dataPointIndex] !== null && w.config.annotations.points.length === 0 && w.config.annotations.xaxis.length !== 0){
              return '<div class="rounded-md v-card">' +
              '<div class="v-card-title pa-1 ma-0 grey lighten-3">'+
                '<div class="black--text text-caption pa-1">'+
                  time.split(' ')[0].slice(0,5) +
                '</div>'+
              '</div>'+
              '<div class="v-card-text">'+
                '<div class="pa-1">' + '<span class="text-caption" style="color:#00E396;">'+'Viewers : '+'</span>'  + '<span class="text-caption text--black font-weight-black">'+series[seriesIndex][dataPointIndex]+'</span>' + '</div>' +
                '<div class="pa-1 twitch--text text-caption">' + 'Category : ' + xaxis.label.text + '</div>' +
              '</div>'+
            '</div>'
            } else if(series[seriesIndex][dataPointIndex] !== null && w.config.annotations.points.length !== 0 && w.config.annotations.xaxis.length === 0){
              return '<div class="rounded-md v-card">' +
              '<div class="v-card-title pa-1 ma-0 grey lighten-3">'+
                '<div class="black--text text-caption pa-1">'+
                  time.split(' ')[0].slice(0,5) +
                '</div>'+
              '</div>'+
              '<div class="v-card-text">'+
                '<div class="pa-1">' + '<span class="text-caption" style="color:#00E396;">'+'Viewers : '+'</span>'  + '<span class="text-caption text--black font-weight-black">'+series[seriesIndex][dataPointIndex]+'</span>' + '</div>' +
                '<div class="pa-1 red--text text-caption">' + 'Title : ' + point.label.text + '</div>' +
              '</div>'+
            '</div>'
            } else if(series[seriesIndex][dataPointIndex] !== null) {
              return '<div class="rounded-md v-card">' +
              '<div class="v-card-title pa-1 ma-0 grey lighten-3">'+
                '<div class="black--text text-caption pa-1">'+
                  time.split(' ')[0].slice(0,5) +
                '</div>'+
              '</div>'+
              '<div class="v-card-text">'+
                '<div class="pa-1">' + '<span class="text-caption" style="color:#00E396;">'+'Viewers : '+'</span>'  + '<span class="text-caption text--black font-weight-black">'+series[seriesIndex][dataPointIndex]+'</span>' + '</div>' +
              '</div>'+
            '</div>'
            }else {
              return null
            }
          },
          x:{
            show:true,
            format: 'HH:mm'
          },
        },
        theme:{
          mode: 'light',
        },
        annotations:{
          xaxis:[],
          points:[],
        },
        chart: {
          id: 'Streamchart',
          },
        height: 350,
        type: "line",
        backgroud:'#FFFFFF',
        colors:['#00E396'],
        title: {
          text:''
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
        curve:'straight',
        markers: {
          size: 3
        },
        yaxis: [
          {
            title: {
              text: "Viewers"
            },
          },
        ],
        labels: [],
      },
      clipLoading:true,
    }
  },
  methods: {
    async getClips(el){
      this.streamerClips = [];
      this.clipLoading = true;
      await axios.get('https://api.twitch.tv/helix/clips',{
        params:{
          first:100,
          broadcaster_id:el,
          started_at:new Date(this.streamLineChartOptions.labels[0]).toISOString(),
          ended_at:new Date(this.streamLineChartOptions.labels[this.streamLineChartOptions.labels.length - 1]).toISOString(),
        },
        headers:this.$store.state.headerConfig
      }).then((res) => {
        this.streamerClips = res.data.data;
        this.clipLoading = false;
      }).catch(async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getClips(el);
        }
      })
    },
    cleaerAnnotation(){
      this.annotations.xaxis = this.streamLineChartOptions.annotations.xaxis;
      this.streamLineChartOptions = {
        ...this.streamLineChartOptions,
        annotations : {
          xaxis:[],
        }
      }
    },
    topOrBottom(curr, last, avg, top){
      const coefficient = Math.abs(curr-last.y)*0.3 / (Math.abs(top-avg));
      if(last.label.offsetY === -2){
        if(coefficient < 0.1){
          return 35;
        }else{
          return -2;
        }
      }else{
        if(coefficient < 0.1){
          return -2;
        }else{
          return 35;
        }
      }

    },
    async toggleTopGame(el){
      const tempIds = [];
      this.gameLoading = true;
      if(el.id === this.gameModel.id){
        this.gameModel = {
          id:null,
        };
      } else {
        this.gameModel = el;
        // this.barSeries[0].data = [];
        el.topStreamer.forEach((el) => {
          tempIds.push(el.id)
        })
        await axios.get('https://api.twitch.tv/helix/users',{
          headers: this.$store.state.headerConfig,
          params:{
            id: tempIds,
          }
        }).then(async (res)=> {
        await res.data.data.forEach((el) => {
          const idx = this.gameModel.topStreamer.findIndex((x) => x.id === el.id );
          this.gameModel.topStreamer[idx] = { ...this.gameModel.topStreamer[idx],...{
            profile_image_url: el.profile_image_url,
            login: el.login,
          }};
        })
      });
      // this.gameModel.topStreamer.forEach((el) => {
      //   this.barSeries[0].data.push({
      //     x:el.user_name,
      //     y:el.viewer_count
      //   })
      // });
      // this.barSeries[0].data.sort((a,b) => b.y - a.y);
      // this.barSeries[0].data.splice(10);
      }
      this.gameLoading = false;
    },
    async toggleTopStream(el){
      this.streamLineChartOptions.labels = [];
      this.streamerClips = [];
      this.streamLineSeries[0].data = [];
      this.streamLoading = true;
      this.streamLineChartOptions.theme.mode = this.$vuetify.theme.isDark ? 'dark' : 'light';
      if(el.id === this.streamerModel.id){
        this.streamerModel = {
          id:null,
          display_name:null,
        };
        this.annoXaxis = false;
        this.annoPoint = false;
        this.streamLoading = false;
        this.streamLineChartOptions.title.text = '';
        this.annotations.xaxis = [];
        this.annotations.points = [];
      } else {
        this.annoXaxis = true;
        this.annoPoint = true;
        this.streamerModel = el;
        this.streamLineChartOptions.title.text = `${el.display_name}'s ${this.date} viewers (cctwitch.xyz)`
        await this.$streamData.ref(`/stream_data/${el.id}/${this.date}`).get().then((sn) => {
          const streamData = sn.val();
          let formerGameName = '';
          let formerTitle = '';
          let viewerStreams = [];
          for(let item in streamData){
            viewerStreams.push(streamData[item].viewer_count);
          }
          viewerStreams.sort((a,b) => b-a);
          const avg = (viewerStreams[0]+viewerStreams[viewerStreams.length-1])/2;
          this.streamLineChartOptions.annotations.xaxis = [];
          this.streamLineChartOptions.annotations.points = [];
          for(let item in streamData){
            const diffIdx = (item*1 - this.streamLineChartOptions.labels[this.streamLineChartOptions.labels.length-1])/1800000;
            const lastPoint = this.streamLineChartOptions.annotations.points[this.streamLineChartOptions.annotations.points.length - 1] === undefined ? {
              x:0,
              y:0,
              label:{
                offsetY:-2,
              },
            } : this.streamLineChartOptions.annotations.points[this.streamLineChartOptions.annotations.points.length - 1];
            if(formerGameName !== streamData[item].game_name){
              this.streamLineChartOptions.annotations.xaxis.push({
                x: new Date(this.momentRound(item*1)).getTime(),
                strokeDashArray: 0,
                borderColor: '#775DD0',
                label: {
                  borderColor: '#775DD0',
                  position:  streamData[item].viewer_count > avg ? 'bottom' : 'top',
                  offsetX: 16,
                  style: {
                    color: '#fff',
                    background: '#775DD0',
                  },
                  text: streamData[item].game_name,
                }
              })
            }
            if(formerTitle !== streamData[item].title){
              this.streamLineChartOptions.annotations.points.push({
                x: new Date(this.momentRound(item*1)).getTime(),
                y: streamData[item].viewer_count,
                marker: {
                  size: 6,
                  strokeColor: 'red',
                  radius: 2,
                },
                label: {
                  borderWidth: 0,
                  textAnchor: 'start',
                  borderColor: 'red',
                  offsetY: this.topOrBottom(streamData[item].viewer_count, lastPoint, avg, viewerStreams[0]),
                  style: {
                    color: '#fff',
                    background: 'red',
                    cssClass: 'apexcharts-point-annotation-label',
                  },
                  text: streamData[item].title,
                }
              })
            }
            formerGameName = streamData[item].game_name ;
            formerTitle = streamData[item].title;


            if(diffIdx > 1){
              for(let i = 0; i < diffIdx-1; i++){
                this.streamLineChartOptions.labels.push( new Date(this.streamLineChartOptions.labels[this.streamLineChartOptions.labels.length-1] + 1800000).getTime());
                this.streamLineSeries[0].data.push(null);
              }
            }
            this.streamLineChartOptions.labels.push( new Date(this.momentRound(item*1)).getTime());
            this.streamLineSeries[0].data.push(streamData[item].viewer_count);
          }
        });
        this.annotations.xaxis = this.streamLineChartOptions.annotations.xaxis;
        this.annotations.points = this.streamLineChartOptions.annotations.points;
        this.streamLineSeries[0].data.unshift(null);
        this.streamLineChartOptions.labels.unshift( this.streamLineChartOptions.labels[0] - 1800000);
        this.streamLineChartOptions.labels.push( this.streamLineChartOptions.labels[this.streamLineChartOptions.labels.length - 1] + 1800000);
        this.streamLineSeries[0].data.push(null);
        await this.getClips(el.id);
        this.streamLoading = false;
      }
    },
    async getTopStream(){
      this.topStreams = [];
      this.tempIdList = [];
      const tartget = this.$streamData.ref(`/treemap/${this.date}/topStream`).orderByChild('viewer_count').limitToLast(100);
      await tartget.get().then( async (sn) => {
        for(let item in sn.val()){
          this.topStreams.push({id:item, ...sn.val()[item]});
          this.tempIdList.push(item);
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
            login: el.login,
            display_name: el.display_name
          }};
        })
      })
    this.topStreams.sort((a,b) => b.viewer_count - a.viewer_count);
    this.topGames.sort((a,b) => b.total_viewer - a.total_viewer);
    },

    async getTopGame(){
      this.topGames = [];
      this.tempGameIdList = [];
      const tartget = this.$streamData.ref(`/treemap/${this.date}/topGame`).orderByChild('viewer_count').limitToLast(50);
      await tartget.get().then( async (sn) => {
        const data = sn.val();
        for(let item in data){
          const topStreamers = [];
          for(let topStream in data[item].topStreamer){
            topStreamers.push({
              id:topStream,
              title:data[item].topStreamer[topStream].title,
              user_name:data[item].topStreamer[topStream].user_name,
              viewer_count:data[item].topStreamer[topStream].viewer_count,
            })
          }
          topStreamers.sort((a,b) => b.viewer_count - a.viewer_count);
          topStreamers.splice(10);
          this.topGames.push({
            id: item,
            time: data[item].time,
            game_name: data[item].game_name,
            stream_count: data[item].stream_count,
            viewer_count: data[item].viewer_count,
            topStreamer: topStreamers,
          });
          this.tempGameIdList.push(item);
        }
      });
      await axios.get('https://api.twitch.tv/helix/games',{
        headers: this.$store.state.headerConfig,
        params:{
          id: this.tempGameIdList,
        }
      }).then( async (res) => {
        await res.data.data.forEach((el) => {
          const idx = this.topGames.findIndex((x) => x.id === el.id );
          this.topGames[idx] = { ...this.topGames[idx],...{
            box_art_url: el.box_art_url.split('{width}x{height}')[0] + '200x346' + el.box_art_url.split('{width}x{height}')[1],
          }};
        })
      })
    this.topGames.sort((a,b) => b.viewer_count - a.viewer_count);
    },
    async getBoxArt(gameName){
      return await axios.get('https://api.twitch.tv/helix/games',{
        headers: this.$store.state.headerConfig,
        params:{
          name:gameName
        }
      }).then((res) => {
        if(res.data.data[0] === undefined) {
          return "https://static-cdn.jtvnw.net/ttv-static/404_boxart-200x346.jpg"
        }else{
          return res.data.data[0].box_art_url.split('{width}x{height}')[0] + '200x346' + res.data.data[0].box_art_url.split('{width}x{height}')[1];
        }
      })
    },
    async beforeDate(){
      this.dateloading = true;
      this.date = this.$moment(`20${this.date}`).add(-1,'days').format('YY-MM-DD');
      this.reportDate = '20' + this.date;
      await this.newOverall();
      this.dateloading = false;

    },
    async afterDate(){
      this.dateloading = true;
      this.date = this.$moment(`20${this.date}`).add(1,'days').format('YY-MM-DD');
      this.reportDate = '20'+this.date;
      await this.newOverall();
      this.dateloading = false;
    },
    async changeDate(){
      this.date = this.$moment(this.reportDate).format('YY-MM-DD');
      await this.newOverall();
    },
    momentRound(el){
      const now = this.$moment(el);
      const hour = now.hour();
      const minute = now.minute();
      if(minute < 15){
        return now.set({minute: 0, second: 0});
      }else if(minute >  44){
        return now.set({hour: hour + 1, minute: 0, second: 0});
      } else {
        return now.set({minute: 30, second: 0});
      }
    },
    async newOverall(){
      this.streamerModel = {id:null};
      this.gameModel = {id:null};
      this.overallLoading = false;
      this.loading = false;
      this.linechartOptions.labels = [];
      this.linechartOptions.theme.mode = this.$vuetify.theme.isDark ? 'dark' : 'light';
      this.lineSeries[0].data = [];
      this.lineSeries[1].data = [];
      await this.$streamData.ref(`/treemap/${this.date}/overall`).get().then((sn) =>{
        for(let item in sn.val()){
          this.linechartOptions.labels.push( new Date(this.momentRound(item*1)).getTime());
          this.lineSeries[0].data.push(sn.val()[item].total_viewer);
          this.lineSeries[1].data.push(sn.val()[item].total_stream);
        }
      })
      this.linechartOptions.title.text = `20${this.date} KR Viewers & Streams (cctwitch.xyz)`
      await this.getTopStream();
      await this.getTopGame();
      this.hotClips = [];
      // this.tempGameIdList.forEach(async (el) => {
      //   await this.getHotClips(el);
      //   this.hotClips.sort((a,b) => b.view_count - a.view_count);
      //   this.hotClips.splice(100);
      // })
      // this.tempIdList.forEach(async (el) => {
      //   await this.getHotClips(el);
      //   this.hotClips.sort((a,b) => b.view_count - a.view_count);
      //   this.hotClips.splice(100);
      // })
      this.overallLoading = true;
      this.loading = true;
    },
    async getHotClips(game_id){
      await axios.get('https://api.twitch.tv/helix/clips',{
        params:{
          game_id: game_id,
          started_at: this.$moment(`20${this.date}`).add(7,'hours').toISOString(),
          ended_at: this.$moment(`20${this.date}`).add(31,'hours').toISOString(),
          first:100,
          after:this.afterCursor
        },
        headers:this.$store.state.headerConfig
      }).then( async (res) => {
        this.afterCursor = res.data.pagination.cursor;
        res.data.data.forEach((el) => {
          if(el.language === 'ko' && el.view_count > 99){
            this.hotClips.push(el)
          }
        });
        // if(res.data.data[0].view_count > this.hotClips[this.hotClips.length - 1].view_count){
        //   await this.getHotClips(game_id);
        // }
      })
    },
  },
  watch:{
    annoXaxis(val){
      if(!val){
        this.streamLineChartOptions = {
          ...this.streamLineChartOptions,
          annotations : {
            xaxis:[],
          }
        }
      }else{
        this.streamLineChartOptions = {
          ...this.streamLineChartOptions,
          annotations : {
            xaxis:this.annotations.xaxis,
          }
        }
      }
    },
    annoPoint(val){
      if(!val){
        this.streamLineChartOptions = {
          ...this.streamLineChartOptions,
          annotations : {
            points:[],
          }
        }
      }else{
        this.streamLineChartOptions = {
          ...this.streamLineChartOptions,
          annotations : {
            points:this.annotations.points,
          }
        }
      }
    },
    isDark:{
      deep: true,
      handler(){
        if(this.isDark){
          this.$refs.linechart.updateOptions({theme:{mode: 'dark'},chart:{background:'#424242'}});
          this.$refs.streamchart.updateOptions({theme:{mode: 'dark'},chart:{background:'#424242'}});
        }else{
          this.$refs.linechart.updateOptions({theme:{mode: 'light'},chart:{background:'#FFFFFF'}});
          this.$refs.streamchart.updateOptions({theme:{mode: 'light'},chart:{background:'#FFFFFF'}});
        }
      }
    }
  },
  computed: {
    isDark(){
      return this.$vuetify.theme.isDark;
    }
  },
  async created() {
    if(new Date().getHours() > 6){
      this.date = this.$moment().format('YY-MM-DD');
    }else{
      this.date = this.$moment().add(-1,'days').format('YY-MM-DD');
    }
    document.title = `Overall | Report - CCTWITCH`
    await this.newOverall();
  },
}
</script>
<style scoped>
.v-input--selection-controls__ripple {
  margin: 0;
}
.v-slide-group__content {
  justify-content: center;
}
.topStreamerDialog{
  position: absolute;
}
.hoverBack{
  color: rgba(255,255,255,0.8);
}
.apexcharts-point-annotation-label{
  z-index: -1 !important;
}
.streamer-list:hover{
  z-index: 3;
  transition: all ease 0.2s 0s;
  transform: scale(1.1) !important;
}
</style>
