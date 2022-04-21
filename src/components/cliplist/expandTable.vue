<template>
  <v-row class="pb-5">
    <div>
      {{this.clipListData}}
    </div>
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
        <th class="table-duration">길이</th>
        <th class="table-views">
          <div class="canSort d-inline" @click="sortByViews()">
            <span>시청수</span>
            <v-icon v-show="this.viewSort === 'asc'">mdi-sort-ascending</v-icon>
            <v-icon v-show="this.viewSort === 'desc' || this.viewSort === '' ">mdi-sort-descending</v-icon>
          </div>
        </th>
        <th class="table-description pr-3">메모</th>
        <th class="d-flex align-center justify-end pr-3 table-menu" v-if="$store.state.isSaved">
        </th>
      </thead>
      <tbody>
          <tr v-for="clip in setCurrList(currList)" :key="clip.id">
            <!-- <v-dialog
            hide-overlay
            content-class="clipIframe"
            max-width="1280"
            :v-model="dialogId === clip.id"
            @click:outside="dialogId = ''"
            @keydown:esc="dialogId = ''"
            >
            <template v-slot:activator="{ on }">
              <td
              class="pa-2 canSort table-thumbnail"
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
              class="table-title"
              style="text-align:start;"
              @click="dialogId = clip.id"
              v-on="on"
              >
                <span style="width: 5rem;" class="canSort twitch--text title-table text-truncate">
                  {{clip.title}}
                </span>
              </td>
            </template>
              <div class="black d-flex justify-end">
                <v-btn color="error" icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
              </div>
              <iframe
                class="black d-flex align-center"
                v-if="clip.id === dialogId"
                :src="`https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost&autoplay=false`" parent="localhost"
                preload="auto"
                frameborder="0"
                height="720"
                width="1280"
                allowfullscreen="true"></iframe>
            </v-dialog> -->
            <ClipIframeDataTableDialog :clipData="clip"></ClipIframeDataTableDialog>
            <td class="table-channel">{{clip.broadcaster_name}}</td>
            <td class="table-date">{{setDate(clip.created_at)}}</td>
            <td class="table-duration">{{Math.floor(clip.duration)}}s</td>
            <td class="table-views">{{viewerkFormatter(clip.view_count)}}</td>
            <td class="table-description pr-3">
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
            <td class="d-flex align-center justify-end pr-3 table-menu" style="height:inherit" v-if="$store.state.isSaved">
              <clipMenuVue :clip="clip"></clipMenuVue>
            </td>
          </tr>
        </tbody>
    </table>
    <v-container v-else v-for="clip in setCurrList(this.clipListData.cliplist)" :key="clip.id">
        <v-container class="d-flex justify-space-between py-3">
          <ClipIframeDataTableDialogMobile :clipData="clip"></ClipIframeDataTableDialogMobile>
          <div class="d-flex align-center">
            <clipMenuVue :clip="clip"></clipMenuVue>
          </div>
        </v-container>
        <v-divider></v-divider>
    </v-container>
    <v-row class="d-flex justify-center pt-10">
      <!-- <v-pagination
      color="twitch"
      v-model="page"
      :total-visible="7"
      :length="Math.ceil((this.clipListData.cliplist.length || 0) / 10)">
      </v-pagination> -->
    </v-row>
    <v-dialog no-click-animation persistent v-model="tableloading">
      <v-progress-linear color="primary" height="35" indeterminate>
        <span class="white--text">Import String 생성중</span>
      </v-progress-linear>
    </v-dialog>
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
      currentTooltipId: '',
      tableloading: false,
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
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
    // async copyCliplist(element) {
    //   let clipString = '';
    //   this.tableloading = true;
    //   setTimeout(async () => {
    //     if (element.pinnedClips.length > 0) {
    //       await this.$firestore.collection('cliplist').where('id', '==', element.id)
    //         .get()
    //         .then(async (res) => {
    //           const templist = [];
    //           element.pinnedClips.forEach((el) => templist.push(el.id));
    //           if (res.empty) {
    //             await this.$firestore.collection('cliplist').add({
    //               id: element.id,
    //               title: element.title,
    //               color: element.color,
    //               pinnedClips: templist,
    //             }).then((resp) => {
    //               clipString = resp.id;
    //             });
    //           } else if (this.compareArray(res.docs[0].data().pinnedClips, templist)) {
    //             clipString = res.docs[0].id;
    //           } else {
    //             const uid = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    //              + Math.random().toString(16).slice(2)
    //              + Date.now().toString(16).slice(4);
    //             await this.$firestore.collection('cliplist').add({
    //               id: uid,
    //               title: element.title,
    //               color: element.color,
    //               pinnedClips: templist,
    //             }).then(async (resp) => {
    //               await this.$store.commit('INIT_currCliplist');
    //               await this.$store.commit('UPDATE_clipList', { id: element.id, updateId: uid });
    //               clipString = resp.id;
    //             });
    //           }
    //         });
    //       const tempArea = document.createElement('textarea');
    //       document.body.appendChild(tempArea);
    //       tempArea.value = clipString;
    //       tempArea.select();
    //       document.execCommand('copy');
    //       document.body.removeChild(tempArea);
    //       this.tableloading = false;
    //       this.$store.commit('SET_SnackBar', { type: 'success', text: `Cliplist : ${clipString} 가 복사되었습니다.`, value: true });
    //     } else {
    //       this.tableloading = false;
    //       this.$store.commit('SET_SnackBar', { type: 'error', text: 'Cliplist : 리스트에 클립이 없습니다.', value: true });
    //     }
    //   }, 1000);
    // },

    sortByViews() {
      this.page = 1;
      if (this.viewSort === 'asc') {
        this.viewSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'views', order: 'desc' });
      } else {
        this.viewSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'views', order: 'asc' });
      }
    },
    sortByCreated() {
      this.page = 1;
      if (this.createdSort === 'asc') {
        this.createdSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'created', order: 'desc' });
      } else {
        this.createdSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'created', order: 'asc' });
      }
    },
    sortByName() {
      this.page = 1;
      if (this.nameSort === 'asc') {
        this.nameSort = 'desc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'name', order: 'desc' });
      } else {
        this.nameSort = 'asc';
        this.$store.commit('SORT_cliplist', { data: this.$store.state.currentCliplist.pinnedClips, type: 'name', order: 'asc' });
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
