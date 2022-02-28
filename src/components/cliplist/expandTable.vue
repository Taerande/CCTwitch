<template>
<v-expand-transition>
  <v-row class="d-block" v-if="Object.keys($store.state.currentCliplist).length > 0 && $store.state.currentCliplist !== undefined">
    <v-row class="d-flex justify-space-between align-baseline">
      <div class="pt-10 pb-3">
        <span class="text-h3 font-weight-bold">{{$store.state.currentCliplist.title}}</span>
        <span class="text-subtitle-1">(총 {{$store.state.currentCliplist.pinnedClips.length}} / 30 개)</span>
      </div>
      <div>
        <v-btn-toggle borderless>
          <DeleteDialog
          :delete="{type:'cliplist', data:{
              target: $store.state.currentCliplist,
              belongsTo: $store.state.cliplist,
              }}"></DeleteDialog>
          <v-btn @click="copyCliplist($store.state.currentCliplist)" icon>
            <v-icon>mdi-clipboard-multiple-outline</v-icon>
          </v-btn>
          <v-btn
          @click="updateData($store.state.currentCliplist)"
          icon>
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <AddNewCliplistDialog :type="{type:'edit', data:{
            text: 'Edit Cliplist',
            id: $store.state.currentCliplist.id,
            color: $store.state.currentCliplist.color,
            title: $store.state.currentCliplist.title,
          }}"></AddNewCliplistDialog>
          <v-btn icon @click="resetData($store.state.currentCliplist)">
            <v-icon>mdi-close-thick</v-icon>
          </v-btn>
       </v-btn-toggle>
        </div>
    </v-row>
    <v-row>
      <table border="0" cellspacing="0" cellpadding="0" :class="theme">
        <thead :style="{background:$store.state.currentCliplist.color}">
          <th style="width: 10%;">썸네일</th>
          <th style="width: 30%;">제목</th>
          <th style="width: 15%;"  @click="sortByName()">
            <div class="canSort d-inline">
              <span>채널</span>
              <v-icon v-show="this.nameSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.nameSort === 'desc' || this.nameSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th style="width: 20%;" class="canSort" @click="sortByCreated()">
            <div class="canSort d-inine">
              <span>날짜</span>
              <v-icon v-show="this.createdSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.createdSort === 'desc' || this.createdSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th style="width: 15%;">길이</th>
          <th style="width: 10%;" class="canSort" @click="sortByViews()">
            <div class="canSort d-inline">
              <span>시청수</span>
              <v-icon v-show="this.viewSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.viewSort === 'desc' || this.viewSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th style="width: 5%;"><span></span></th>
        </thead>
        <tbody v-show="tableloading">
          <tr v-for="clip in $store.state.currentCliplist.pinnedClips" :key="clip.id">
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
                sizes="50"
                height="50"
                width="80"
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
            <td>{{clip.view_count}}</td>
            <td class="pr-2 pt-2 d-flex align-center" style="height:inherit">
              <v-btn icon @click="copyClip(clip)">
                <v-icon >mdi-clipboard-multiple-outline</v-icon>
              </v-btn>
              <DeleteDialog :delete="{type:'clip', data:{
                target: clip,
                belongsTo: $store.state.currentCliplist,
              }}"></DeleteDialog>
            </td>
          </tr>
        </tbody>
        <tbody v-show="!tableloading">
          <v-progress-circular indeterminate></v-progress-circular>
        </tbody>
      </table>
    </v-row>
  </v-row>
  </v-expand-transition>
</template>

<script>

import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';
import DeleteDialog from '@/components/dialog/DeleteDialog.vue';
import axios from 'axios';

export default {
  components: {
    DeleteDialog,
    AddNewCliplistDialog,
  },
  data() {
    return {
      tableloading: true,
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
    };
  },
  methods: {
    updateData(el) {
      const idList = [];
      el.pinnedClips.forEach((element) => {
        idList.push(element.id);
      });
      axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          id: idList,
          first: 30,
        },
      }).then((res) => {
        this.$store.commit('UPDATE_pinndedClip', res.data.data);
      });
    },
    compareArray(a, b) {
      return a.length === b.length && a.every((value, index) => value === b[index].id);
    },
    async copyCliplist(element) {
      this.tableloading = false;
      let clipString = '';
      await this.$firestore.collection('cliplist').where('id', '==', element.id)
        .get()
        .then(async (res) => {
          if (res.empty) {
            const templist = [];
            element.pinnedClips.forEach((el) => templist.push(el.id));
            await this.$firestore.collection('cliplist').add({
              id: element.id,
              title: element.title,
              color: element.color,
              pinnedClips: templist,
            }).then((resp) => {
              clipString = resp.id;
            });
          } else if (this.compareArray(res.docs[0].data().pinnedClips, element.pinnedClips)) {
            clipString = res.docs[0].id;
          } else {
            const templist = [];
            const uid = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
             + Math.random().toString(16).slice(2)
             + Date.now().toString(16).slice(4);
            element.pinnedClips.forEach((el) => templist.push(el.id));
            await this.$firestore.collection('cliplist').add({
              id: uid,
              title: element.title,
              color: element.color,
              pinnedClips: templist,
            }).then(async (resp) => {
              await this.$store.commit('INIT_currCliplist');
              this.$store.commit('UPDATE_clipList', { id: element.id, updateId: uid });
              clipString = resp.id;
            });
          }
        });
      this.tableloading = true;
      const tempArea = document.createElement('textarea');
      document.body.appendChild(tempArea);
      tempArea.value = clipString;
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Cliplist String : ${clipString} 가 복사되었습니다.`, value: true });
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
      if (this.viewSort === 'asc') {
        this.viewSort = 'desc';
        this.$store.commit('SORT_cliplist', { type: 'views', order: 'desc' });
      } else {
        this.viewSort = 'asc';
        this.$store.commit('SORT_cliplist', { type: 'views', order: 'asc' });
      }
    },
    sortByCreated() {
      if (this.createdSort === 'asc') {
        this.createdSort = 'desc';
        this.$store.commit('SORT_cliplist', { type: 'created', order: 'desc' });
      } else {
        this.createdSort = 'asc';
        this.$store.commit('SORT_cliplist', { type: 'created', order: 'asc' });
      }
    },
    sortByName() {
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.$store.commit('SORT_cliplist', { type: 'name', order: 'desc' });
      } else {
        this.nameSort = 'asc';
        this.$store.commit('SORT_cliplist', { type: 'name', order: 'asc' });
      }
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    resetData(el) {
      this.$store.commit('SET_currCliplist', { data: '', type: 'info', text: `Cliplist : ${el.title}를 숨깁니다.` });
      this.currentData = {};
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
</style>
