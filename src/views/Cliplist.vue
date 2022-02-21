<template>
<v-container fluid>
  <v-row class="d-flex align-center pt-5">
     <v-col>
      <h1>My Cliplists</h1>
    </v-col>
    <v-col class="d-flex justify-end align-center">
      <AddNewCliplistDialog :type="{data:'button'}"></AddNewCliplistDialog>
    </v-col>
  </v-row>
  <v-row v-if="currentData.id !== undefined" class="d-flex justify-space-between align-baseline">
    <div class="pt-10 pb-3">
      <span class="text-h3">{{currentData.title}}</span>
      <span class="text-subtitle-1">(총 {{currentData.pinnedClips.length}}개)</span>
    </div>
    <v-icon @click="resetData()">mdi-close</v-icon>
  </v-row>
  <v-row>
    <table border="0" cellspacing="0" cellpadding="0">
      <thead :style="{background:currentData.color}">
        <th width="10%">이미지</th>
        <th width="40%">제목</th>
        <th width="15%" @click="sortByName()">채널</th>
        <th width="15%" @click="sortByCreated()">날짜</th>
        <th width="10%">클립 길이</th>
        <th width="10%" @click="sortByViews()">시청수</th>
      </thead>
      <tbody>
        <tr v-for="clip in currentData.pinnedClips" :key="clip.id">
          <td>
            <v-img
            sizes="60"
            height="60"
            width="96"
            lazy-src="@/assets/img/404.jpg"
            :src="clip.thumbnail_url"></v-img>
          </td>
          <td>{{clip.title.length > 30 ? `${clip.title.substr(0,30)}...` : clip.title}}</td>
          <td>{{clip.broadcaster_name}}</td>
          <td>{{setDate(clip.created_at)}}</td>
          <td>{{clip.duration}}</td>
          <td>{{clip.view_count}}</td>
        </tr>
      </tbody>
    </table>
  </v-row>
  <v-row class="d-flex">
    <v-col class="custom5cols pa-3" v-for="(item, index) in $store.state.cliplist" :key="index">
      <div @click="setData(item)" class="cliplist-canvas" :style="{background: item.color}">
        <div class="text-h5 pa-5 overflow-x-hidden">
        #{{index+1}}  {{item.title}}
        </div>
        <div class="text-caption pa-5">
          {{item.pinnedClips.length}}개의 클립
        </div>
        <div>
          <v-icon @click="$store.commit('DELETE_newCliplist',{index: index, title:item.title})">mdi-trash-can</v-icon>
          <v-icon>mdi-clipboard-multiple-outline</v-icon>
        </div>
      </div>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/AddNewCliplistDialog.vue';

export default {
  components: {
    AddNewCliplistDialog,
  },
  data() {
    return {
      currentData: {},
      dialog: false,
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
      } else {
        this.currentData = el;
      }
    },
    resetData() {
      this.currentData = [];
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
  opacity: 0.7 !important;
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
tbody tr:hover{
  cursor: pointer;
  background-color: rgb(0,0,0,0.4)
}
</style>
<style scoped>
</style>
