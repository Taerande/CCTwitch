<template>
  <v-container fluid fill-height>
    <v-container v-if="$store.state.currentCliplist">
      <v-row class="d-flex justify-space-between align-baseline">
        <div class="pt-10 pb-3">
          <span class="text-h3 font-weight-bold pr-3">{{$store.state.currentCliplist.title}}</span>
          <span class="text-subtitle-1">(총 {{$store.state.currentCliplist.cliplist.length}} / 100 개)</span>
        </div>
    </v-row>
    <v-row class="d-block">
      <div class="pl-1">
       : {{$store.state.currentCliplist.description}}
      </div>
      <div class="d-flex justify-end">
            <ImportNewClipDialogVue></ImportNewClipDialogVue>
            <DeleteDialog
            :delete="{type:'cliplist', data:{
                target: $store.state.currentCliplist,
                belongsTo: $store.state.cliplist,
                }}"></DeleteDialog>
            <v-btn @click="copyCliplist($store.state.currentCliplist)" icon>
              <v-icon>mdi-share-variant-outline</v-icon>
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
              description: $store.state.currentCliplist.description,
            }}"></AddNewCliplistDialog>
            <v-btn icon @click="resetData(), $router.push({path: '/cliplist'})">
              <v-icon>mdi-undo-variant</v-icon>
            </v-btn>
        </div>
      <v-dialog no-click-animation persistent width="300px" v-model="tableloading">
        <v-progress-linear color="primary" height="35" indeterminate>
          <span class="white--text">Import String 생성중</span>
        </v-progress-linear>
      </v-dialog>
    </v-row>
    <expandTableVue></expandTableVue>
    </v-container>
    <v-container v-else style="height:60vh;" class="d-flex justify-center align-center">
      <v-alert rounded="pill" class="d-inline-block" type="error">🤐 저장 혹은 공유된 클립 모음이 없습니다.</v-alert>
    </v-container>
  </v-container>
</template>

<script>

import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';
import DeleteDialog from '@/components/dialog/DeleteDialog.vue';
import axios from 'axios';
import expandTableVue from './expandTable.vue';
import ImportNewClipDialogVue from '../dialog/ImportNewClipDialog.vue';
export default {
  components: {
    DeleteDialog,
    AddNewCliplistDialog,
    expandTableVue,
    ImportNewClipDialogVue,
  },
  data() {
    return {
      currentTooltipId: '',
      tableloading: false,
      dialogId: '',
      nameSort: '',
      viewSort: '',
      createdSort: '',
      currList: {
        id: '',
        title: '',
        description: '',
        color: '',
        pinnedClips: [],
      },
      pinnedClipslist:[],
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
    async copyCliplist(element) {
      let clipString = '';
      this.tableloading = true;
      setTimeout(async () => {
        if (element.pinnedClips.length > 0) {
          await this.$firestore.collection('cliplist').where('id', '==', element.id)
            .get()
            .then(async (res) => {
              const templist = [];
              element.pinnedClips.forEach((el) => templist.push({ id: el.id, description: el.description || '' }));
              if (res.empty) {
                await this.$firestore.collection('cliplist').add({
                  id: element.id,
                  description: element.description || '',
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
                  description: element.description || '',
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
        } else {
          this.tableloading = false;
          this.$store.commit('SET_SnackBar', { type: 'error', text: 'Cliplist : 리스트에 클립이 없습니다.', value: true });
        }
      }, 1000);
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    resetData() {
      this.$store.commit('INIT_currCliplist');
    },
    async getClip(id, description) {
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          id: id,
        },
      }).then((res) => {
        if (res.data.data.length > 1) {
          this.pinnedClipslist = res.data.data;
          for(let j=0; j < description.length; j++){
            this.pinnedClipslist[j].description = description[j];
          }
        } else {
          this.$store.commit('SET_SnackBar', { type: 'error', text: 'Import : 클립을 가져올 수 없습니다.', value: true });
          this.importLoading = false;
        }
      });
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
  },
  async mounted() {
    const fireData = await this.$firestore.collection('cliplist').doc(this.$route.params.id).get();
    this.$store.commit('SET_currCliplist', {data:fireData.data()});
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
