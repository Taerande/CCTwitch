<template>
<v-expand-transition name="expand">
  <v-row class="d-block" v-if="Object.keys($store.state.currentCliplist).length > 0 && $store.state.currentCliplist !== undefined">
    <v-row class="d-flex justify-space-between align-baseline">
      <div class="pt-10 pb-3">
        <span class="text-h3 font-weight-bold">{{$store.state.currentCliplist.title}}</span>
        <span class="text-subtitle-1">(총 {{$store.state.currentCliplist.pinnedClips.length}} / 100 개)</span>
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
          <v-btn icon @click="resetData()">
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
       </v-btn-toggle>
        </div>
    </v-row>
    <v-row>
      <table border="0" cellspacing="0" cellpadding="0" :class="theme">
        <thead :style="{background:$store.state.currentCliplist.color}">
          <th>썸네일</th>
          <th>제목</th>
          <th>
            <div class="canSort d-inline" @click="sortByName()">
              <span>채널</span>
              <v-icon v-show="this.nameSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.nameSort === 'desc' || this.nameSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th>
            <div class="canSort d-inline" @click="sortByCreated()">
              <span>날짜</span>
              <v-icon v-show="this.createdSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.createdSort === 'desc' || this.createdSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th>길이</th>
          <th>
            <div class="canSort d-inline" @click="sortByViews()">
              <span>시청수</span>
              <v-icon v-show="this.viewSort === 'asc'">mdi-sort-ascending</v-icon>
              <v-icon v-show="this.viewSort === 'desc' || this.viewSort === '' ">mdi-sort-descending</v-icon>
            </div>
          </th>
          <th>메모</th>
          <th><span></span></th>
        </thead>
        <tbody>
            <tr v-for="clip in setCurrList($store.state.currentCliplist.pinnedClips)" :key="clip.id">
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
                style="text-align:start;"
                @click="dialogId = clip.id"
                v-on="on"
                >
                <div style="width: 40rem; margin-right:auto;" class="canSort twitch--text title-table text-truncate">
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
              <td>
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
              </td>
              <td class="d-flex align-center pr-3" style="height:inherit">
               <clipMenuVue :clip="clip"></clipMenuVue>
              </td>
            </tr>
        </tbody>

      </table>
      <v-dialog no-click-animation persistent width="500px" v-model="tableloading">
        <v-progress-linear color="primary" height="35" indeterminate>
          <span class="white--text">Import String 생성중</span>
          </v-progress-linear>

      </v-dialog>
      <v-container fluid>
        <v-row v-if="$store.state.currentCliplist.pinnedClips.length === 0" class="d-flex justify-center align-center pt-10">
            <span class="text-h4">🤐There is no Clip</span>
          </v-row>
        <v-row class="d-flex justify-center pt-5">
          <v-pagination
          color="twitch"
          v-model="page"
          :total-visible="7"
          :length="Math.ceil($store.state.currentCliplist.pinnedClips.length / 12)">
          </v-pagination>
        </v-row>
      </v-container>
    </v-row>

  </v-row>
  </v-expand-transition>
</template>

<script>

import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';
import DeleteDialog from '@/components/dialog/DeleteDialog.vue';
import axios from 'axios';
import clipMenuVue from './clipMenu.vue';

export default {
  components: {
    DeleteDialog,
    AddNewCliplistDialog,
    clipMenuVue,
  },
  data() {
    return {
      currentTooltipId:'',
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
    setCurrList(el){
      return el.slice((this.page-1)*12, this.page*12);
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
    updateData(el) {
      const idList = [];
      el.pinnedClips.forEach((element) => {
        idList.push(element.id);
      });
      axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          id: idList,
          first: 100,
        },
      }).then((res) => {
        this.$store.commit('UPDATE_pinndedClip', res.data.data);
      });
    },
    compareArray(a, b) {
      const result = a.length === b.length && a.every((value) => b.includes(value));
      return result;
    },
    async copyCliplist(element) {
      let clipString = '';
      this.tableloading = true;
      setTimeout(async () => {
        if(element.pinnedClips.length > 0) {
          await this.$firestore.collection('cliplist').where('id', '==', element.id)
            .get()
            .then(async (res) => {
              const templist = [];
              element.pinnedClips.forEach((el) => templist.push(el.id));
              if (res.empty) {
                await this.$firestore.collection('cliplist').add({
                  id: element.id,
                  title: element.title,
                  color: element.color,
                  pinnedClips: templist,
                }).then((resp) => {
                  clipString = resp.id;
                });
              } else if (this.compareArray(res.docs[0].data().pinnedClips, templist)) {
                clipString = res.docs[0].id;
              } else {
                const uid = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
                 + Math.random().toString(16).slice(2)
                 + Date.now().toString(16).slice(4);
                await this.$firestore.collection('cliplist').add({
                  id: uid,
                  title: element.title,
                  color: element.color,
                  pinnedClips: templist,
                }).then(async (resp) => {
                  await this.$store.commit('INIT_currCliplist');
                  await this.$store.commit('UPDATE_clipList', { id: element.id, updateId: uid });
                  clipString = resp.id;
                });
              }
            });
          const tempArea = document.createElement('textarea');
          document.body.appendChild(tempArea);
          tempArea.value = clipString;
          tempArea.select();
          document.execCommand('copy');
          document.body.removeChild(tempArea);
          this.tableloading = false;
          this.$store.commit('SET_SnackBar', { type: 'success', text: `Cliplist : ${clipString} 가 복사되었습니다.`, value: true });
        }
        else {
          this.tableloading = false;
          this.$store.commit('SET_SnackBar', { type: 'error', text: `Cliplist : 리스트에 클립이 없습니다.`, value: true });
        }
      }, 1000);
    },

    sortByViews() {
      this.page = 1;
      if (this.viewSort === 'asc') {
        this.viewSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'views', order: 'desc' });
      } else {
        this.viewSort = 'asc';
        this.$store.commit('SORT_cliplist', { data:this.$store.state.currentCliplist.pinnedClips, type: 'views', order: 'asc' });
      }
    },
    sortByCreated() {
      this.page = 1;
      if (this.createdSort === 'asc') {
        this.createdSort = 'desc';
        this.$store.commit('SORT_cliplist', { data:this.$store.state.currentCliplist.pinnedClips, type: 'created', order: 'desc' });
      } else {
        this.createdSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips ,type: 'created', order: 'asc' });
      }
    },
    sortByName() {
      this.page = 1;
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.$store.commit('SORT_cliplist', { data:this.$store.state.currentCliplist.pinnedClips, type: 'name', order: 'desc' });
      } else {
        this.nameSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'name', order: 'asc' });
      }
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    resetData() {
      this.$store.commit('SET_currCliplist', {data: ''});
      this.page = 1;
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
