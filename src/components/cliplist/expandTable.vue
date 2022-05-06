<template>
<v-row justify="center">
  <v-col cols="12" class="py-1" v-for="(clip, index) in clipListData" :key="clip.id">
    <v-card class="d-flex felx-column rounded-lg tile">
      <v-card-title class="justify-center" style="width:5%;">
        <v-icon v-if="index === vidIndex">mdi-drag-horizontal-variant</v-icon>
        <span v-else>{{index}}</span>
      </v-card-title>
      <v-card-text class="d-flex align-center ma-0 py-3">
        <ClipIframeDataTableDialog :clipData="clip"></ClipIframeDataTableDialog>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-card-actions>
        <!-- <clipMenuVue :clip="clip"></clipMenuVue> -->
          <!-- <ClipIframeDataTableDialogMobile :clipData="clip"></ClipIframeDataTableDialogMobile> -->
    </v-card>
  </v-col>
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
    // clipMenuVue,
    ClipIframeDataTableDialog,
    // ClipIframeDataTableDialogMobile,
  },
  data() {
    return {
      vidIndex: 0,
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
      return this.$moment(el).format('l');
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
