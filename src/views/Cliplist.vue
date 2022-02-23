<template>
<v-container fluid>
  <v-row class="d-flex align-center pt-5">
     <v-col>
      <h1>My Cliplists</h1>
    </v-col>
    <v-col class="d-flex justify-end align-center">
      <AddNewCliplistDialog :type="{type:'button'}"></AddNewCliplistDialog>
    </v-col>
  </v-row>
  <v-expand-transition change>
  <v-row class="d-block" v-if="$store.state.cliplist.find((el) => el.id === currentData.id)">
    <v-row class="d-flex justify-space-between align-baseline">
      <div class="pt-10 pb-3">
        <span class="text-h3 font-weight-bold">{{currentData.title}}</span>
        <span class="text-subtitle-1">(총 {{currentData.pinnedClips.length}}개)</span>
      </div>
      <div>
        <v-btn-toggle borderless>
          <DeleteDialog @initCurrentData="initData" :type="{type:'cliplist', index:$store.state.cliplist.findIndex(el => el.id == currentData.id), title: currentData.title, color:currentData.color}"></DeleteDialog>
          <v-btn icon>
            <v-icon>mdi-clipboard-multiple-outline</v-icon>
          </v-btn>
          <v-btn
          @click="loading = !loading"
          icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <AddNewCliplistDialog :type="{type:'edit', data:{
            color: currentData.color,
            title: currentData.title,
          }}"></AddNewCliplistDialog>
          <v-btn icon @click="resetData(currentData)">
            <v-icon>mdi-close-thick</v-icon>
          </v-btn>
       </v-btn-toggle>
        </div>
    </v-row>
    <v-row>
      <table border="0" cellspacing="0" cellpadding="0" :class="theme">
        <thead :style="{background:currentData.color}">
          <th width="10%">썸네일</th>
          <th width="40%">제목</th>
          <th width="15%" @click="sortByName()">
            <div class="canSort d-inline">
              <span>채널</span>
              <v-icon v-show="this.nameSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.nameSort === 'desc' || this.nameSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th class="canSort" width="15%" @click="sortByCreated()">
            <div class="canSort d-inine">
              <span>날짜</span>
              <v-icon v-show="this.createdSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.createdSort === 'desc' || this.createdSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th width="10%">클립 길이</th>
          <th class="canSort" width="10%" @click="sortByViews()">
            <div class="canSort d-inline">
              <span>시청수</span>
              <v-icon v-show="this.viewSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.viewSort === 'desc' || this.viewSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th></th>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="(clip, index) in $store.state.cliplist.find((el) => el.id === currentData.id).pinnedClips" :key="clip.id">
            <v-dialog
            @click:outside="dialogId = null"
            :v-model="clip.id === dialogId"
            width="50%"
            height="50%"
            >
            <template v-slot:activator="{ on, attrs }">
              <td
              class="pa-2"
              v-bind="attrs"
              v-on="on"
              @click="dialogId = clip.id"
              >
                <v-img
                sizes="50"
                height="50"
                width="80"
                lazy-src="@/assets/img/404.jpg"
                :src="clip.thumbnail_url"></v-img>
              </td>
              <td
              @click="dialogId = clip.id"
              v-bind="attrs"
              v-on="on"
              class="twitch--text title-table text-truncate">{{clip.title}}</td>
            </template>
              <iframe
                v-if="clip.id === dialogId"
                :src="`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost&autoplay=true`" parent="localhost"
                preload="auto"
                frameborder="0"
                height="720"
                allowfullscreen="true"></iframe>
            </v-dialog>
            <td>{{clip.broadcaster_name}}</td>
            <td>{{setDate(clip.created_at)}}</td>
            <td>{{Math.floor(clip.duration)}}s</td>
            <td>{{clip.view_count}}</td>
            <td class="pr-2">
              <DeleteDialog :type="{type:'clip', title:clip.title, clipIndex:index, listIndex: $store.state.cliplist.findIndex(el => el.id == currentData.id)}"></DeleteDialog>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <v-progress-circular :width="5" :size="60" color="twitch" indeterminate></v-progress-circular>
        </tbody>
      </table>
    </v-row>
  </v-row>
  </v-expand-transition>
  <v-row class="d-flex pt-10" v-if="$store.state.cliplist.length">
    <v-col class="custom5cols pa-3" v-for="(item, listIndex) in $store.state.cliplist" :key="listIndex">
      <div @click="setData(item)" class="cliplist-canvas" :style="{background: item.color, opacity: currentData.id === item.id ? '1 !important' : ''}">
        <div class="text-h5 pa-5 text-truncate">
        #{{listIndex+1}}  {{item.title}}
        </div>
        <div class="text-caption pa-5">
          {{item.pinnedClips.length}}개의 클립
        </div>
      </div>
    </v-col>
  </v-row>
  <v-row v-else class="d-flex justify-center align-center" style="height:60vh;">
    <h1>😥There is no cliplist</h1>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/AddNewCliplistDialog.vue';
import DeleteDialog from '@/components/DeleteDialog.vue';

export default {
  components: {
    AddNewCliplistDialog,
    DeleteDialog,
  },
  data() {
    return {
      loading: false,
      currentData: {},
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
    };
  },
  methods: {
    sortByViews() {
      if (this.viewSort === 'asc') {
        this.viewSort = 'desc';
        this.currentData.pinnedClips.sort((a, b) => b.view_count - a.view_count);
      } else {
        this.viewSort = 'asc';
        this.currentData.pinnedClips.sort((a, b) => a.view_count - b.view_count);
      }
    },
    sortByCreated() {
      if (this.createdSort === 'asc') {
        this.createdSort = 'desc';
        this.currentData.pinnedClips.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        this.createdSort = 'asc';
        this.currentData.pinnedClips.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
    },
    sortByName() {
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.currentData.pinnedClips.sort((a, b) => a.broadcaster_name.localeCompare(b.broadcaster_name));
      } else {
        this.nameSort = 'asc';
        this.currentData.pinnedClips.sort((a, b) => b.broadcaster_name.localeCompare(a.broadcaster_name));
      }
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    setData(el) {
      if (this.currentData.id === el.id) {
        this.currentData = {};
        this.$store.commit('SET_SnackBar', { type: 'info', text: `Cliplist : ${el.title}를 숨깁니다.`, value: true });
      } else {
        this.currentData = el;
        this.$store.commit('SET_SnackBar', { type: 'info', text: `Cliplist : ${el.title}를 표시합니다.`, value: true });
      }
    },
    resetData(el) {
      this.currentData = {};
      this.$store.commit('SET_SnackBar', { type: 'info', text: `Cliplist : ${el.title}를 숨깁니다.`, value: true });
    },
    initData() {
      this.currentData = {};
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
  },
  created() {
  },
};
</script>
<style lang="scss" scoped>

.cliplist-canvas{
  cursor: pointer;
  border-radius: 5%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  width: 200px;
  height: 200px;
  opacity: 0.5 !important;
}
.cliplist-canvas:hover{
  transform: scale(1.05) !important;
  opacity: 1 !important;
  transition: all 0.1s;
  transition-timing-function: ease;
}
.custom5cols {
  width: 20%;
  max-width: 20%;
  flex-basis: 20%;
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
.title-table{
  cursor: pointer;
}
div[role="progressbar"]{
  position: relative;
  left: 50%;
  top: 10%;
  transform: translateX(-50%);
}
</style>
