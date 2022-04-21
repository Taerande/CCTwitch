<template>
  <v-row class="pb-5">
    <table v-if="$vuetify.breakpoint.smAndUp" border="0" cellspacing="0" cellpadding="0" :class="theme">
      <thead :style="{background:this.clipListData.color}">
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
      <tbody>
          <tr v-for="clip in setCurrList(resultData)" :key="clip.id">
            <ClipIframeDataTableDialog :clipData="clip"></ClipIframeDataTableDialog>
            <td class="table-channel">{{clip.broadcaster_name}}</td>
            <td class="table-date">{{setDate(clip.created_at)}}</td>
            <td class="table-duration">{{Math.floor(clip.duration)}}</td>
            <td class="table-views">{{viewerkFormatter(clip.view_count)}}</td>
            <!-- <td class="table-description pr-3">
              <v-tooltip bottom color="primary" v-if="clip.description">
                <template v-slot:activator="{on, attrs}">
                  <v-icon
                  v-on="on"
                  v-bind="attrs"
                  >mdi-note-outline</v-icon>
                </template>
                <v-card flat color="primary" class="pa-0 ma-0" max-width="500px">
                  <v-card-text class="ma-0 pa-0">
                    {{clip.description}}
                  </v-card-text>
                </v-card>
              </v-tooltip>
            </td> -->
            <td class="d-flex align-center justify-center table-menu" style="height:inherit">
              <clipMenuVue :clip="clip"></clipMenuVue>
            </td>
          </tr>
        </tbody>
    </table>
    <v-container v-else v-for="clip in setCurrList(resultData)" :key="clip.id">
        <v-container class="d-flex justify-space-between py-3">
          <ClipIframeDataTableDialogMobile :clipData="clip"></ClipIframeDataTableDialogMobile>
          <div class="d-flex align-center">
            <clipMenuVue :clip="clip"></clipMenuVue>
          </div>
        </v-container>
        <v-divider></v-divider>
    </v-container>
    <v-row class="d-flex justify-center pt-10">
      <v-pagination
      color="twitch"
      v-model="page"
      :total-visible="7"
      :length="Math.ceil((resultData.length || 0) / 10)">
      </v-pagination>
    </v-row>
  </v-row>
</template>

<script>
import axios from 'axios';
import ClipIframeDataTableDialog from '../dialog/ClipIframeDataTableDialog';
import ClipIframeDataTableDialogMobile from '../dialog/ClipIframeDataTableDialogMobile';
import clipMenuVue from './clipMenu.vue';

export default {
  props:['clipListData'],
  components: {
    clipMenuVue,
    ClipIframeDataTableDialog,
    ClipIframeDataTableDialogMobile,
  },
  data() {
    return {
      resultData: [],
      currentTooltipId: '',
      tableloading: false,
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
      lengthSort: '',
      page: 1,
    };
  },
  methods: {
    setCurrList(el) {
      return el === undefined ? el=[] : el.slice((this.page - 1) * 10, this.page * 10);
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
    sortByViews() {
      this.page = 1;
      if (this.viewSort === 'asc') {
        this.viewSort = 'desc';
        this.resultData.sort((a, b) => a.view_count - b.view_count);
      } else {
        this.viewSort = 'asc';
        this.resultData.sort((a, b) => b.view_count - a.view_count);
      }
    },
    sortByLength() {
      this.page = 1;
      if (this.lengthSort === 'asc') {
        this.lengthSort = 'desc';
        this.resultData.sort((a, b) => a.duration - b.duration);
      } else {
        this.lengthSort = 'asc';
        this.resultData.sort((a, b) => b.duration - a.duration);
      }
    },
    sortByCreated() {
      this.page = 1;
      if (this.createdSort === 'asc') {
        this.createdSort = 'desc';
        this.resultData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else {
        this.createdSort = 'asc';
        this.resultData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    },
    sortByName() {
      this.page = 1;
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.resultData.sort((a, b) => b.broadcaster_name.localeCompare(a.broadcaster_name));
      } else {
        this.nameSort = 'asc';
        this.resultData.sort((a, b) => a.broadcaster_name.localeCompare(b.broadcaster_name));
      }
    },
    setDate(el) {
      return this.$moment(el).format('ll').substring(2);
    },
    resetData() {
      this.$store.commit('SET_currCliplist', { data: '' });
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
    currList:{
      get(){
        return this.$store.state.currentCliplist.pinnedClips
      },
      set(value){
        this.$store.commit('UPDATE_List', value)
      }
    }
  },
  async created() {
    await axios.get('https://api.twitch.tv/helix/clips', {
      headers: this.$store.state.headerConfig,
      params: {
        id: [...this.clipListData.id],
      },
    }).then((res) => {
      this.resultData = res.data.data;
    });
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
  background-color: rgb(255,255,255,0.2)
}
.light-table tr:hover{
  background-color: rgb(0,0,0,0.2)
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
</style>
