<template>
<v-row justify="center">
  <v-col cols="12" class="py-1" v-for="(clip, index) in $store.state.currentCliplist" :key="clip.id">
    <v-card max-height="100" class="d-flex felx-column rounded-lg" elevation="3">
      <v-card-title class="justify-center ma-0 pa-0 pl-1" style="width:3rem;">
        <v-icon small v-if="index === vidIndex">mdi-drag-horizontal-variant</v-icon>
        <span class="text-caption font-weight-bold" v-else>{{index + 1}}</span>
      </v-card-title>
      <v-card-text class="d-flex align-center ma-0 pa-0">
        <ClipIframeDataTableDialog :clipData="clip.clipData"></ClipIframeDataTableDialog>
      </v-card-text>
      <v-card-actions class="justify-center">
        <clipMenuVue :clip="{clipData:clip.clipData, listData:clipListData}" :listData="AllCliplists"></clipMenuVue>
      </v-card-actions>
    </v-card>
  </v-col>
</v-row>
<!-- <ClipIframeDataTableDialogMobile :clipData="clip"></ClipIframeDataTableDialogMobile> -->
</template>

<script>
import axios from 'axios';
import ClipIframeDataTableDialog from '../dialog/ClipIframeDataTableDialog';
import clipMenuVue from './clipMenu.vue';

export default {
  props:['clipListData'],
  components: {
    clipMenuVue,
    ClipIframeDataTableDialog,
  },
  data() {
    return {
      AllCliplists:[],
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
    resetData() {
      this.$store.commit('SET_currCliplist', { data: '' });
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
  },
  async mounted() {
    if(this.$store.state.userinfo.userInfo){
      this.unsubscribe = await this.$firestore.collection('cliplist').where('authorId','==',this.$store.state.userinfo.userInfo.uid).onSnapshot((sn) => {
        if(sn.empty){
          this.AllCliplists = [];
          // this.$store.commit('SET_Cliplist', this.cliplist);
          return
        }
        this.AllCliplists = sn.docs.map( v => {
          const item = v.data()
          return {
            id: v.id,
            title: item.title,
            description: item.description,
            createdAt: item.createdAt,
            color: item.color,
            clipCount: item.clipCount,
            clipIds: item.clipIds,
          }
        })
        this.$store.commit('SET_Cliplist', this.cliplist);
      });
    }
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
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
