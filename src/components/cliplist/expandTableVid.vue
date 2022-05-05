<template>
<v-container fluid fill-height>
  <v-row>
    <v-spacer></v-spacer>
    <playAllClipsDialog></playAllClipsDialog>
  </v-row>
  <v-row class="d-flex">
    <v-col
      class="pr-3"
      @mouseover="hovering = true"
      @mouseleave="hovering = false"
      :cols="$vuetify.breakpoint.mdAndUp ? 9 : 12" style="position:relative;">
      <v-sheet v-if="hovering" class="controller-panel black px-10 d-flex justify-space-between align-center" width="100%" height="0">
        <v-btn text :style="vidIndex === 0 ? 'background:rgba(0,0,0,0)' : 'background:rgba(0,0,0,0.5)'" x-large>
          <v-icon v-if="vidIndex > 0" @click="prevVid()" size="80" color="white"> mdi-rotate-180 mdi-skip-next-outline</v-icon>
        </v-btn>
        <v-btn text :style="vidIndex === currList.length-1 ? 'background:rgba(0,0,0,0)' : 'background:rgba(0,0,0,0.5)'" x-large>
          <v-icon v-if="vidIndex < currList.length-1" @click="nextVid()" size="80" color="white">mdi-skip-next-outline</v-icon>
        </v-btn>
      </v-sheet>
      <iframe
      :src="`https://clips.twitch.tv/embed?clip=${currList[vidIndex].id}&parent=${$store.state.embedUrl}&autoplay=true&muted=false&preload=auto`"
      preload="auto"
      frameborder="0"
      :height="$vuetify.breakpoint.mdAndUp ? 720 : 500"
      width="100%"
      allowfullscreen="true"></iframe>
    </v-col>
    <v-col :cols="$vuetify.breakpoint.mdAndUp ? 3 : 12" class="overflow-y-auto overflow-x-hidden" :style="{height : $vuetify.breakpoint.mdAndUp ? '720px' : '300px'}">
      <v-card class="pa-0 ma-0" flat>
        <v-card-title class="d-flex align-center pb-10 rounded-0" :style="{background: clipListData.color, color:textColor}">
          <v-icon :color="textColor" class="pr-1">mdi-playlist-play</v-icon>
          <span>{{currList.length}}개</span>
          <v-icon></v-icon>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text v-for="(clip,index) in currList" :key="clip.id" class="pa-0 ma-0">
          <v-container class="d-flex align-center my-3 pa-2 px-3" flat @click="vidIndex = index" :class="vidIndex === index ? 'grey darken-3 white--text' : ''">
            <v-img max-width="100" height="100%" :src="clip.thumbnail_url" lazy-src="@/assets/img/404.jpg"></v-img>
            <div class="pl-2">
              <div class="text-truncate inline-block" style="max-width:15rem;">{{clip.title}}</div>
              <div>{{clip.broadcaster_name}}</div>
              <div class="text-caption d-flex align-center"><v-icon :color="vidIndex === index ? 'white' : ''" class="pr-1" x-small>mdi-eye</v-icon> {{viewerkFormatter(clip.view_count)}}</div>
              <div class="text-caption">{{setDate(clip.created_at)}}</div>
            </div>
            <v-spacer></v-spacer>
            <clipMenuVue :clip="{clipData:clip, listData:clipListData, dark:vidIndex === index}"></clipMenuVue>
          </v-container>
        </v-card-text>
      </v-card>

    </v-col>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';
// import ClipIframeDataTableDialog from '../dialog/ClipIframeDataTableDialog';
// import ClipIframeDataTableDialogMobile from '../dialog/ClipIframeDataTableDialogMobile';
import clipMenuVue from './clipMenu.vue';
import playAllClipsDialog from '../dialog/playAllClipsDialog';

export default {
  props:['clipListData'],
  components: {
    playAllClipsDialog,
    clipMenuVue,
    // ClipIframeDataTableDialog,
    // ClipIframeDataTableDialogMobile,
  },
  data() {
    return {
      hovering: false,
      vidIndex: 0,
      draggable: false,
      resultData: [],
      currentTooltipId: '',
      tableloading: false,
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
      dataLoading: false,
      lengthSort: '',
      page: 1,
      perPage: 20,
    };
  },
  methods: {
    prevVid(){
      this.vidIndex -= 1;
      this.scrollTarget.scrollTop = this.vidIndex * 113.33;
    },
    nextVid(){
      this.vidIndex += 1;
      this.scrollTarget.scrollTop = this.vidIndex * 113.33;

    },
    saveOrder(){
      this.draggable = !this.draggable;
      if(!this.draggable){
        console.log('ads');
      }
    },
    setCurrList(el) {
      return el === undefined ? el=[] : el.slice((this.page - 1) * this.perPage, this.page * this.perPage);
    },
    viewerkFormatter(el) {
      const num = el.toString();
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(num.length - 9, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`;
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`;
      }
      return Math.abs(num);
    },
    // sortByViews() {
    //   this.page = 1;
    //   if (this.viewSort === 'asc') {
    //     this.viewSort = 'desc';
    //     this.resultData.sort((a, b) => a.view_count - b.view_count);
    //   } else {
    //     this.viewSort = 'asc';
    //     this.resultData.sort((a, b) => b.view_count - a.view_count);
    //   }
    // },
    // sortByLength() {
    //   this.page = 1;
    //   if (this.lengthSort === 'asc') {
    //     this.lengthSort = 'desc';
    //     this.resultData.sort((a, b) => a.duration - b.duration);
    //   } else {
    //     this.lengthSort = 'asc';
    //     this.resultData.sort((a, b) => b.duration - a.duration);
    //   }
    // },
    // sortByCreated() {
    //   this.page = 1;
    //   if (this.createdSort === 'asc') {
    //     this.createdSort = 'desc';
    //     this.resultData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    //   } else {
    //     this.createdSort = 'asc';
    //     this.resultData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    //   }
    // },
    // sortByName() {
    //   this.page = 1;
    //   if (this.nameSort === 'asc') {
    //     this.nameSort = 'desc';
    //     this.resultData.sort((a, b) => b.broadcaster_name.localeCompare(a.broadcaster_name));
    //   } else {
    //     this.nameSort = 'asc';
    //     this.resultData.sort((a, b) => a.broadcaster_name.localeCompare(b.broadcaster_name));
    //   }
    // },
    setDate(el) {
      return this.$moment(el).format('l');
    },
    swapIndexDown(el){
      let temp = this.currList[el]
      let replacetemp = this.currList[el + 1]
      this.currList.splice(el, 2 , replacetemp, temp);
    },
    swapIndexUp(el){
      let temp = this.currList[el]
      let replacetemp = this.currList[el - 1]
      this.currList.splice(el-1, 2 , temp, replacetemp);
    },
    // resetData() {
    //   this.$store.commit('SET_currCliplist', { data: '' });
    // },
  },
  computed: {
    scrollTarget(){
      return document.getElementsByClassName('overflow-y-auto')[0];
    },
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
    currList(){
      return this.$store.state.currentCliplist;
    },
    textColor(){
      return this.$store.state.darkColorSet.includes(this.clipListData.color.substr(0,7)) ? 'white' : 'black';
    }
  },
  watch:{
    currList(value){
      this.$store.commit('SET_CurrentClipList', value);
    }
  },
  async created() {
    await axios.get('https://api.twitch.tv/helix/clips', {
      headers: this.$store.state.headerConfig,
      params: {
        id: [...this.clipListData.cliplist],
      },
    }).then(async (res) => {
      let result = new Array(res.data.data.length);
      await res.data.data.forEach((element) => {
        const index = this.clipListData.cliplist.findIndex((v) => v === element.id);
        result[index] = element;
      })
      const idArr = res.data.data.map((v) => {
        return v.id
      });
      this.$store.commit('SET_CurrentClipList', result);
      let diff = this.clipListData.cliplist.filter( x => !idArr.includes(x))
      if(res.data.data.length !== this.clipListData.cliplist.length)
      {
        for( let i = 0; i < diff.length; i++){
          console.log({id:'asdfsdf', title:'클립정보를 찾을 수 없습니다.'});
          this.$store.commit('ADD_ClipInCurrentCliplist',
          {
            id:diff[i],
            video_id: null,
            thumbnail_url: "@/assets/img/404.jpg",
            title:'클립정보를 찾을 수 없습니다.',
            broadcaster_name: '',
            created_at: new Date(),
            duration: 0,
            view_count:0,
            })
        }
      }
    });
    this.dataLoading = true;
  },
  destroyed() {
    this.$store.commit('SET_CurrentClipList', []);
  },

};
</script>
<style lang="scss" scoped>
tr{
  height: 56px;
}
th{
  height: 56px;
}
table{
  width: -webkit-fill-available;
}
tbody tr:nth-child(2n) {
  background-color: rgb(0,0,0,0.05);
}
tbody tr:nth-child(2n+1) {
  background-color: rgb(255,255,255,0.05)
}
.dark-table tr:hover{
  background-color: rgb(255,255,255,0.2);
}
.light-table tr:hover{
  background-color: rgb(0,0,0,0.2);
}
td{
  text-align: center;
  text-justify: center;
}
.canSort{
  cursor: pointer;
}
.expand-enter-active {
  transition: all 2s ease;
}
.ghost{
  background: red !important;

}
.select{
  opacity: 0 !important;
}
table{
  position: relative;
  width: 100%;
}
.table-thumbnail, .table-title, .table-channel, .table-date, .table-duration, .table-views, .table-description{
  max-width: 20rem;

}
.horizontalCenter{
  position: absolute;
  left:50%;
  transform: translate(-50%);
}
.dragHidden{
  display: hidden;
}
.v-card__title{
  position: sticky;
  right: 0;
  top: 0;
  z-index: 3;

}
.controller-panel{
  position: absolute;
  top: 50%;
}
</style>
