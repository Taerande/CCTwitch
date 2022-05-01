<template>
  <v-row class="pb-5">
    <v-row>
      <v-spacer></v-spacer>
      <playAllClipsDialog></playAllClipsDialog>
    </v-row>
    <table v-if="$vuetify.breakpoint.smAndUp" border="0" cellspacing="0" cellpadding="0" :class="theme">
      <thead :style="{background:this.clipListData.color}">
        <th>
          <v-icon @click="draggable = !draggable">mdi-pencil</v-icon>
        </th>
        <th class="table-thumbnail">썸네일</th>
        <th class="table-title text-center">제목</th>
        <th class="table-channel">
          <div class="canSort d-inline" @click="sortByName()">
            <span>채널</span>
            <v-icon v-show="this.nameSort === 'asc'">mdi-sort-ascending</v-icon>
            <v-icon v-show="this.nameSort === 'desc' || this.nameSort === '' ">mdi-sort-descending</v-icon>
          </div>
        </th>
        <th class="table-date">
          <div class="canSort d-inline" @click="sortByCreated()">
            <span>날짜</span>
            <v-icon v-show="this.createdSort === 'asc'">mdi-sort-ascending</v-icon>
            <v-icon v-show="this.createdSort === 'desc' || this.createdSort === '' ">mdi-sort-descending</v-icon>
          </div>
        </th>
        <th class="table-duration canSort" @click="sortByLength()">
          <span>길이</span>
          <v-icon v-show="this.lengthSort === 'asc'">mdi-sort-ascending</v-icon>
          <v-icon v-show="this.lengthSort === 'desc' || this.lengthSort === '' ">mdi-sort-descending</v-icon>
        </th>
        <th class="table-views">
          <div class="canSort d-inline" @click="sortByViews()">
            <span>시청수</span>
            <v-icon v-show="this.viewSort === 'asc'">mdi-sort-ascending</v-icon>
            <v-icon v-show="this.viewSort === 'desc' || this.viewSort === '' ">mdi-sort-descending</v-icon>
          </div>
        </th>
        <th class="d-flex align-center justify-center table-menu">
          메뉴
        </th>
      </thead>
      <tbody v-if="dataLoading">
        <tr v-for="(clip, clipIndex) in currList" :key="clip.id">
          <td>
            <div v-if="draggable" class="d-flex flex-column">
              <v-btn v-show="clipIndex > 0" @click="swapIndexUp(clipIndex)" color="error" icon>
                <v-icon large>mdi-menu-up</v-icon>
              </v-btn>
              <v-btn  v-show="clipIndex < $store.state.currentCliplist.length - 1" color="success" @click="swapIndexDown(clipIndex)" icon>
                <v-icon large>mdi-menu-down</v-icon>
              </v-btn>
            </div>
          </td>
          <ClipIframeDataTableDialog :clipData="clip"></ClipIframeDataTableDialog>
          <td class="table-channel">{{clip.broadcaster_name}}</td>
          <td class="table-date">{{setDate(clip.created_at)}}</td>
          <td class="table-duration">{{Math.floor(clip.duration)}}</td>
          <td class="table-views">{{viewerkFormatter(clip.view_count)}}</td>
          <td class="d-flex align-center justify-center table-menu" style="height:inherit">
            <clipMenuVue :clip="{clipData:clip, listData:clipListData}"></clipMenuVue>
          </td>
        </tr>
      </tbody>
      <v-row v-else class="pt-3">
        <v-progress-circular class="horizontalCenter pt-3" indeterminate></v-progress-circular>
      </v-row>
    </table>
    <v-container v-else>
    <v-progress-linear value="100" :color="clipListData.color"></v-progress-linear>
      <v-container v-for="clip in currList" :key="clip.id">
          <v-row class="justify-space-between py-3">
            <ClipIframeDataTableDialogMobile :clipData="clip"></ClipIframeDataTableDialogMobile>
            <div class="d-flex align-center">
              <clipMenuVue :clip="{clipData:clip, listData:clipListData}"></clipMenuVue>
            </div>
          </v-row>
          <v-divider></v-divider>
      </v-container>
    </v-container>
    <v-row class="d-flex justify-center pt-15">
      <v-pagination
      color="twitch"
      v-model="page"
      :total-visible="7"
      :length="Math.ceil(($store.state.currentCliplist.length || 0) / this.perPage)">
      </v-pagination>
    </v-row>
  </v-row>
</template>

<script>
import axios from 'axios';
import ClipIframeDataTableDialog from '../dialog/ClipIframeDataTableDialog';
import ClipIframeDataTableDialogMobile from '../dialog/ClipIframeDataTableDialogMobile';
import clipMenuVue from './clipMenu.vue';
import playAllClipsDialog from '../dialog/playAllClipsDialog';

export default {
  props:['clipListData'],
  components: {
    playAllClipsDialog,
    clipMenuVue,
    ClipIframeDataTableDialog,
    ClipIframeDataTableDialogMobile,
  },
  data() {
    return {
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
    swapIndexDown(el){
      console.log('down',el);
      this.$store.commit('SWAPDOWN_currentCliplist', el)
    },
    swapIndexUp(el){
      console.log('up',el);
      this.$store.commit('SWAPUP_currentCliplist', el)
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
      return this.$moment(el).format('ll').substring(2);
    },
    // resetData() {
    //   this.$store.commit('SET_currCliplist', { data: '' });
    // },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
    currList:{
      get(){
        return this.$store.state.currentCliplist
      },
      set(value, old){
        console.log(value, old);
        // this.$store.commit('SET_CurrentClipList', value)
      }
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
</style>
