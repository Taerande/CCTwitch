<template>
<v-container>
  <v-row class="py-3">
    <v-col class="d-flex justify-center">
      <v-text-field
        name="name"
        solo
        flat
        type="text"
        v-model="searchString"
        :loading="searchLoading"
        color="twitch"
        loader-height="6"
        hide-details
        class="d-flex align-center justify-center ma-0 pa-0"
        append-icon="mdi-magnify"
        label="Search Channel (Only KR Channels are available.)"
        @click:append="searchChannel(searchString)"
        @keydown.enter="searchChannel(searchString)"
        outlined
      >
      <template
      v-slot:prepend-inner>
      <div class="ma-0 mr-1 py-1" style="width:80px;">
        <v-select
          disabled
          v-model="lang"
          :items="lang"
          full-width
          dense
          hide-details
          :label="lang[0]"
          solo
          flat
        ></v-select>
      </div>
      </template>
      </v-text-field>
    </v-col>
  </v-row>
  <v-row v-if="!searchLoading && searchResult.length > 0">
    <v-col v-for="(searchItem) in searchResult" :key="`${searchItem.id}:${searchItem.broadcaster_login}`" cols="6" :class="$vuetify.breakpoint.xl ? 'custom5cols' : ''"  lg="3" md="4" sm="6" xs="6"  class="pa-2 d-flex justify-center">
      <v-card
      @click="routerPush(`?type=channel&id=${searchItem.broadcaster_login}`)"
      outlined dark class="rounded-lg d-flex flex-row" width="320px" :disabled="searchItem.date.length === 0" :class="searchItem.date.length === 0 ? '' : 'hoverCursor'">
        <v-card-text class="d-flex align-center pa-2 ma-0">
          <v-avatar size="36">
            <v-img :src="searchItem.thumbnail_url" alt="profile_img"></v-img>
          </v-avatar>
          <div class="px-1 white--text" :class="searchItem.date.length === 0 ? 'text-decoration-line-through' : ''">
            {{searchItem.display_name}}
          </div>
          <v-spacer></v-spacer>
          <div v-if="searchItem.date.length > 0">
            <v-icon color="red">mdi-calendar</v-icon>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row class="py-5">
    <v-col v-if="streamerModel.id !== null" cols="12" class="d-flex justify-center py-3">
      <v-date-picker
        v-model="date"
        :landscape="!$vuetify.breakpoint.smAndDown"
        locale="ko-KR"
        color="twitch"
        event-color="#81C784"
        show-current
        :allowed-dates="allowedDates"
        :events="streamerModel.date"
        @click:date="changeDate(date)"
        :min="streamerModel.date[0]"
        :max="streamerModel.date[streamerModel.date.length-1]"
        >
      </v-date-picker>
    </v-col>
    <v-expand-transition>
      <v-card
        outlined
        v-if="streamerModel.id !== null"
        style="width:100%;"
      >
      <v-subheader>
        <span>
          Chart
        </span>
        <v-spacer></v-spacer>
        <v-icon color="red" @click="streamerModel = { id:null }">mdi-close</v-icon>
      </v-subheader>
        <v-card-title class="d-flex align-center">
            <router-link :to="{name:'Channel', query:{
              q:streamerModel.login}}" class="d-flex align-center">
              <v-avatar size="48">
                 <v-img
                   sizes="48"
                   :src="streamerModel.thumbnail_url"
                   alt="profile_img"
                 >
                 </v-img>
               </v-avatar>
               <div class="twitch--text px-3">
                {{streamerModel.display_name}}
               </div>
            </router-link>
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
                <span class="text-caption pa-0" :class="annoXaxis ? 'twitch--text' : 'grey--text text-decoration-line-through'">Category</span>
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
        </v-card-title>
        <v-card-text>
          <div v-if="!streamLoading" class="ma-2">
            <apexchart ref="channelstreamchart" type="line" height="350" :options="streamLineChartOptions" :series="streamLineSeries"></apexchart>
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
            v-model="clipModel"
            center-active
            show-arrows
            >
              <v-slide-item
              v-slot="{ active, toggle }"
              class="pa-2" v-for="item in streamerClips" :key="item.id">
                <v-card class="ma-1 pa-0 rounded-lg" flat style="width:250px;" :color="active ?  'rgb(0,0,0,0.2)' : 'rgb(0,0,0,0)'">
                  <div class="d-flex justify-center ma-0 pa-0" @click.capture="toggle">
                    <ClipIframeDialogVue :listData="listData" :clipData="item"></ClipIframeDialogVue>
                  </div>
                  <div class="d-flex justify-center pt-2 pr-3 text-body-2 font-weight-bold" style="width:inherit">{{item.title}}</div>
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
  </v-row>
  <InArticleAdContainerVue></InArticleAdContainerVue>
</v-container>
</template>
<script>
import axios from 'axios'
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
      clipLoading:false,
      streamerClips:[],
      availableDates:[],
      date:'',
      streamerModel:{
        id:null,
        display_name:null,
        box_art:null,
      },
      streamLoading:false,
      searchLoading:false,
      searchString:'',
      lang:['KR','JP','EN'],
      searchResult:[],
      requiredRules:[(value) => !!value || 'Required.'],
      streamLineChartOptions:{
        legend:{
          show:true,
        },
        theme:{
          mode: 'light'
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
        annotations:{
          xaxis:[],
          points:[],
        },
        chart: {
          id: 'streamchart',
          toolbar:{
            show:true,
            tools:{
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false,
            },
          },
          },
        height: 350,
        type: "line",
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
      streamLineSeries:[
        {name:'Viewers', type:'line', data:[]},
      ],
      annoXaxis:true,
      annoPoint:true,
      annotations:{
        xaxis:[],
        points:[],
      },
    }

  },
   watch:{
    isDark:{
      deep: true,
      handler(){
        if(this.isDark){
          this.$refs.channelstreamchart.updateOptions({
            theme:{mode: 'dark'},
            chart:{
              background:'#424242'
            }
          });
        }else{
          this.$refs.channelstreamchart.updateOptions({
            theme:{mode: 'light'},
            chart:{
              background:'#FFFFFF'
            }
          });
        }
      }
    },
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
  },
  methods: {
      // splitArr(){
      //   this.streamLineSeries[0].data.forEach((el,idx) => {
      //     if(el !== null && this.streamLineSeries[0].data[el-1] === null){
      //       console.log('불연속',el,idx);
      //     }
      // })
      // const indexArr = [];
      // const max = Math.max(...this.streamLineSeries[0].data);
      // const maxIdx = this.streamLineSeries[0].data.indexOf(max);
      // this.streamLineSeries[0].data.forEach((el, idx) => {
      //   if(el){
      //     indexArr.push(idx)
      //   }
      // });
      // for(let i=0; i<this.streamLineSeries[0].data.length-1 ;i++){
      //   if(this.streamLineSeries[0].data[i] !== null && this.streamLineSeries[0].data[i+1] === null){
      //     console.log('불연속', this.streamLineSeries[0].data[i], i);
      //   }
      // }
      // },
    async getBoxArt(gameName){
      await axios.get('https://api.twitch.tv/helix/games',{
        headers: this.$store.state.headerConfig,
        params:{
          name:gameName
        }
      }).then((res) => {
        if(res.data.data[0] === undefined) {
          return "https://static-cdn.jtvnw.net/ttv-static/404_boxart-200x346.jpg"
        }else{
          this.streamerModel.box_art = res.data.data[0].box_art_url.split('{width}x{height}')[0] + '200x346' + res.data.data[0].box_art_url.split('{width}x{height}')[1];
        }
      })
    },
    async getClips(el){
      this.clipLoading = true;
      let axiosOption;
      if (this.$store.state.lang === 'ko') {
        axiosOption = {
          method: 'get',
          baseURL: this.$store.state.lang === 'ko' ? this.$store.state.clipVidKr : 'https://api.twitch.tv/helix',
          url: '/clips',
          params: {
            broadcaster_id: el,
            started_at: new Date(this.streamLineChartOptions.labels[0]).toISOString(),
            ended_at: new Date(this.streamLineChartOptions.labels[this.streamLineChartOptions.labels.length - 1]).toISOString(),
          },
          headers: this.$store.state.lang === 'ko' ? null : this.$store.state.headerConfig,
        }
      }
      await axios(axiosOption).then((res) => {
        this.streamerClips = res.data.data;
        this.clipLoading = false;
      }).catch( async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getClips(el);
        }
      });
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
    async routerPush(path){
      if(path.slice(17) === this.$route.query.id){
        const channelId = this.$route.query.id;
        const userInfo = await this.getUserInfo(channelId);
        await this.toggleTopStream(userInfo);
      }else{
        this.$router.push({path:path}).catch(() => {});
      }
    },
    async changeDate(el){
      this.date = el;
      await this.toggleTopStream(this.streamerModel);
    },
    async toggleTopStream(el){
      this.date = this.date === '' ? el.date[el.date.length-1] : this.date;
      this.searchResult = [];
      this.streamLineChartOptions.labels = [];
      this.streamLineChartOptions.theme.mode = this.$vuetify.theme.isDark ? 'dark' : 'light';
      this.streamLineSeries[0].data = [];
      this.streamLoading = true;
      this.streamerModel = el;
      this.annoXaxis = true;
      this.annoPoint = true;
      this.streamerModel = {...el};
      this.streamLineChartOptions.title.text = `${el.display_name}'s ${this.date} viewers (cctwitch.xyz)`
      await this.$streamData.ref(`/stream_data/${el.id}/${this.date.slice(2)}`).get().then((sn) => {
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
      await this.getBoxArt(this.streamLineChartOptions.annotations.xaxis[0].label.text);
      this.streamLoading = false;
    },
    async getFollower(element) {
      return await axios.get('https://api.twitch.tv/helix/users/follows',{
        params: {
          to_id: element,
        },
        headers:this.$store.state.headerConfig,
      }).then((res) => {
        return res.data.total;
      });
    },
    async getStreamData(el){
      return await this.$streamData.ref(`/stream_data/${el}`).get().then((sn) => {
        const streamData = sn.val();
        let dates = [];
        if(sn.exists()){
          for(let item in streamData){
            dates.push('20'+item);
          }
        }
        return dates;
      });
    },
    allowedDates(el){
      return this.streamerModel.date.includes(el);
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
    async searchChannel(searchString){
      this.searchLoading = true;
      this.searchResult = [];
      this.date = '';
      this.streamerModel = {
        id:null,
        display_name:null,
      };
      if(searchString === ''){
        this.$store.commit('SET_SnackBar',{type:'error', text:'채널명을 입력해주세요!', value: true});
        this.searchLoading = false;
        return
      }
      await axios.get('https://api.twitch.tv/helix/search/channels', {
        params:{
          query: searchString,
          first: 20,
        },
        headers: this.$store.state.headerConfig,
      }).then((res) => {
        res.data.data.forEach(async (element) => {
          if(element.broadcaster_language === 'ko'){
            const followers = await this.getFollower(element.id);
            const dates = await this.getStreamData(element.id);
            this.searchResult.push({
              ...element,
              followers: followers,
              date:dates,
            })
          }
        this.searchResult.sort((a,b) => b.followers - a.followers);
        });
      }).catch( async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.searchChannel(searchString);
        }
      });
      this.searchLoading = false;
    },
    async getUserInfo(id){
      return await axios.get('https://api.twitch.tv/helix/users',{
        params:{
          login:id,
        },
        headers: this.$store.state.headerConfig
      }).then( async (res) => {
        const dates = await this.getStreamData(res.data.data[0].id);
        return {
          ...res.data.data[0],
          thumbnail_url: res.data.data[0].profile_image_url,
          date: dates,
        }
      }).catch( async (e) => {
        if(e.response.status === 401){
          await this.$store.dispatch('setNewTwitchAppToken');
          await this.getUserInfo(id);
        }
      });

    }
  },
  computed: {
    isDark(){
      return this.$vuetify.theme.dark;
    }

  },
  async created() {
    if(this.$route.query.id !== undefined){
      const channelId = this.$route.query.id;
      const userInfo = await this.getUserInfo(channelId);
      document.title = `${userInfo.display_name} | Report - CCTWITCH`
      await this.toggleTopStream(userInfo);
    }else{
      document.title = `Channel | Report - CCTWITCH`
    }
  },
}
</script>
<style>
</style>
