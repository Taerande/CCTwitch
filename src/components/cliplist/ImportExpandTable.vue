<template>
  <v-row class="d-block" v-if="Object.keys(result).length > 0 && result !== undefined">
    <v-row class="d-flex justify-space-between align-baseline">
      <div class="pt-10 pb-3">
        <span class="text-h3 font-weight-bold">{{result.title}}</span>
        <span class="text-subtitle-1">(총 {{result.pinnedClips.length}} / 100 개)</span>
      </div>
      <div>
        <v-btn color="success" text @click="addNewCliplist">Save</v-btn>
      </div>
    </v-row>
    <v-row>
      <table border="0" cellspacing="0" cellpadding="0" :class="theme">
        <thead :style="{background:result.color}">
          <th style="width: 10%;">썸네일</th>
          <th style="width: 30%;">제목</th>
          <th style="width: 15%;">
            <div class="canSort d-inline" @click="sortByName()">
              <span>채널</span>
              <v-icon v-show="this.nameSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.nameSort === 'desc' || this.nameSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th style="width: 20%;">
            <div class="canSort d-inline" @click="sortByCreated()">
              <span>날짜</span>
              <v-icon v-show="this.createdSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.createdSort === 'desc' || this.createdSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th style="width: 15%;">길이</th>
          <th style="width: 10%;">
            <div class="canSort d-inline" @click="sortByViews()">
              <span>시청수</span>
              <v-icon v-show="this.viewSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.viewSort === 'desc' || this.viewSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th style="width: 5%;"><span></span></th>
        </thead>
        <tbody>
            <tr v-for="(clip,index) in setCurrList(result.pinnedClips)" :key="clip.id">
              <v-dialog
              :v-model="dialogId === clip.id"
              @click:outside="dialogId = ''"
              @keydown:esc="dialogId = ''"
              width="50%"
              height="50%"
              >
              <template v-slot:activator="{ on }">
                <td
                class="pa-2 canSort"
                v-on="on"
                @click="dialogId = clip.id"
                >
                  <v-img
                  class="mx-auto"
                  max-width="70"
                  lazy-src="@/assets/img/404.jpg"
                  :src="clip.thumbnail_url"></v-img>
                </td>
                <td
                class="canSort"
                style="text-align:start;"
                @click="dialogId = clip.id"
                v-on="on"
                >
                <div style="width: 40rem; margin-right:auto;" class="twitch--text title-table text-truncate">
                  {{clip.title}}
                </div>

                </td>
              </template>
                <iframe
                  class="black d-flex align-center"
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
              <td>{{viewerkFormatter(clip.view_count)}}</td>
              <td class="d-flex align-center" style="height:inherit">
                <v-btn icon @click="copyClip(clip)">
                  <v-icon >mdi-clipboard-multiple-outline</v-icon>
                </v-btn>
                <DeleteDialog @delImportedClip="delImportedClip" :delete="{type:'importedClip', data:{
                  target: clip,
                  belongsTo: result,
                  index: index + (page - 1 ) * 10 ,
                }}"></DeleteDialog>
              </td>
            </tr>
        </tbody>
        <v-dialog no-click-animation persistent width="500px" v-model="tableloading">
          <v-progress-linear color="primary" height="35" indeterminate>
            <span class="white--text">Import String 생성중</span>
            </v-progress-linear>

        </v-dialog>
      </table>
      <v-row class="d-flex justify-center pt-5">
        <v-pagination
        color="twitch"
        v-model="page"
        :total-visible="7"
        :length="Math.ceil(result.pinnedClips.length / 10)">
        </v-pagination>
      </v-row>
    </v-row>
  </v-row>
</template>

<script>

import DeleteDialog from '@/components/dialog/DeleteDialog.vue';

export default {
  props:['result'],
  components: {
    DeleteDialog,
  },
  data() {
    return {
      tableloading: false,
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
      currList: [],
      page:1,
    };
  },
  methods: {
    async addNewCliplist(){
      await this.$store.commit('SET_newCliplist',this.result);
      this.$router.push({path: '/cliplist'})
    },
    delImportedClip(el){
      this.result.pinnedClips.splice(el.index, 1);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Clip : ${el.title} 가 삭제되었습니다.`, value: true });
    },
    setCurrList(el){
      return el.slice((this.page-1)*10, this.page*10);
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
    copyClip(el) {
      const tempArea = document.createElement('textarea');
      document.body.appendChild(tempArea);
      tempArea.value = el.url;
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Clip URL : ${el.title} 가 복사되었습니다.`, value: true });
    },
    sortByViews() {
      this.page = 1;
      if (this.viewSort === 'asc') {
        this.viewSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.result.pinnedClips, type: 'views', order: 'desc' });
      } else {
        this.viewSort = 'asc';
        this.$store.commit('SORT_cliplist', { data:this.result.pinnedClips, type: 'views', order: 'asc' });
      }
    },
    sortByCreated() {
      this.page = 1;
      if (this.createdSort === 'asc') {
        this.createdSort = 'desc';
        this.$store.commit('SORT_cliplist', { data:this.result.pinnedClips, type: 'created', order: 'desc' });
      } else {
        this.createdSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.result.pinnedClips ,type: 'created', order: 'asc' });
      }
    },
    sortByName() {
      this.page = 1;
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.$store.commit('SORT_cliplist', { data:this.result.pinnedClips, type: 'name', order: 'desc' });
      } else {
        this.nameSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.result.pinnedClips, type: 'name', order: 'asc' });
      }
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
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
</style>
