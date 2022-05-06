<template>
<v-container fluid>
  <v-row class="d-block">
    <div class="d-flex pt-10 align-baseline">
      <span class="text-h3 font-weight-bold pr-3">{{cliplist.title}}</span>
      <span class="text-subtitle-1">
        <v-icon>mdi-</v-icon>
        (총 {{ cliplist.cliplist.length }} / 100 개)</span>
    </div>
    <div class="d-flex align-baseline pb-1">
      <span></span>
      <span class="text-body-2 grey--text pr-3">조회수 {{cliplist.viewCount}}</span>
      <span class="text-body-2 grey--text pr-3">
        <v-icon small>mdi-thumb-up-outline</v-icon>
        <span class="text-body-2 grey--text pr-3">{{cliplist.likeCount}}</span>
      </span>
      <span class="text-caption">{{setDate(cliplist.createdAt.toString())}}</span>
      <v-spacer></v-spacer>
      <ImportNewClipDialogVue :parent="cliplist"></ImportNewClipDialogVue>
      <DeleteDialog
      @DeleteCliplist="deleteCliplist"
      :delete="{
        type:'cliplist',
        data:{
          target: cliplist,
          }
        }">
      </DeleteDialog>
      <v-btn @click="copyCliplist(cliplist)" icon>
        <v-icon>mdi-share-variant-outline</v-icon>
      </v-btn>
      <AddNewCliplistDialog
      v-if="$store.state.currentListData"
      :type="{
        type:'edit',
        data: cliplist,
        }">
      </AddNewCliplistDialog>
    </div>
    <v-divider></v-divider>
  </v-row>
  <v-row class="d-block">
    <div class="d-flex align-center pt-3">
      <v-avatar
        size="36">
        <img :src="userInfo.profile_image_url" alt="alt">
      </v-avatar>
      <div class="pl-1">
        <div>{{userInfo.display_name}}</div>
      </div>
    </div>
    <v-spacer></v-spacer>
    <div class="pt-3">
      {{cliplist.description}}
    </div>
  </v-row>
  <expandTableVue
    v-if="cliplist.cliplist.length > 0"
    :clipListData="cliplist.cliplist">
  </expandTableVue>
  <v-row v-else style="height:60vh;" class="d-flex justify-center align-center">
    <v-alert rounded="pill" class="d-inline-block" type="error">🤐 저장 혹은 공유된 클립 모음이 없습니다.</v-alert>
  </v-row>
  <v-row class="pb-16 pt-5">
    <v-btn block color="success">More</v-btn>
  </v-row>
</v-container>
</template>

<script>

import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';
import DeleteDialog from '@/components/dialog/DeleteDialog.vue';
import axios from 'axios';
import expandTableVue from './expandTable';
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
      cliplist: {
        id:'',
        title:'',
        description:'',
        color:'',
        createdAt:'',
        authorId:'',
        authorName:'',
        cliplist:[],
      },
      userInfo:'',
      unsubscribe: null,
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
    async getUserInfo(item){
      await axios.get('https://api.twitch.tv/helix/users',{
          headers: this.$store.state.headerConfig,
          params:{
            id: item.split('twitch:')[1],
          }
        }).then( res => {
          this.userInfo = res.data.data[0];
        });
    },
    async deleteCliplist(){
      await this.$firestore.collection('cliplist').doc(this.$route.params.id).delete();
      this.$router.push({path:'/cliplist'});
      this.$store.commit('SET_SnackBar',{type:'error', text:`${this.cliplist.title}클립 모음집이 삭제되었습니다.`, value:true});
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
    compareArray(a, b) {
      const result = a.length === b.length && a.every((value) => b.includes(value));
      return result;
    },
    copyCliplist(element) {
      if (element.cliplist.length > 0) {
        const tempArea = document.createElement('textarea');
        document.body.appendChild(tempArea);
        tempArea.value = window.location;
        tempArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempArea);
        this.$store.commit('SET_SnackBar', { type: 'success', text: `Cliplist : ${element.title} 가 복사되었습니다.`, value: true });
      } else {
        this.$store.commit('SET_SnackBar', { type: 'error', text: 'Cliplist : 리스트에 클립이 없습니다.', value: true });
      }
    },
    setDate(el) {
      return this.$moment(el).format('ll');
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
    let tempArr = [];
    this.unsubscribe = await this.$firestore.collection('cliplist').doc(this.$route.params.id).onSnapshot((sn) => {
      const item = sn.data();
      this.getUserInfo(item.authorId);
      if(sn.empty){
        this.cliplist = []
        return
      }
      this.$store.commit('SET_CurrentListData', {
        id: sn.id,
        title: item.title,
        viewCount: item.viewCount,
        createdAt: item.createdAt.toDate(),
        description: item.description,
        color: item.color,
        isPublic: item.isPublic,
        authorId: item.authorId,
        authorName: item.authorName,
        likeCount: item.likeCount,
      });
      item.cliplist.map(async (el) => {
        const result = await axios.get('https://api.twitch.tv/helix/clips', {
          headers: this.$store.state.headerConfig,
          params:{ id: el}
        });
        tempArr.push(result.data.data[0]);
      });
      this.cliplist = {
        id: sn.id,
        title: item.title,
        description: item.description,
        color: item.color,
        viewCount: item.viewCount,
        likeCount: item.likeCount,
        createdAt: item.createdAt.toDate(),
        authorId: item.authorId,
        authorName: item.authorName,
        cliplist: tempArr,
      }
    })
    this.loading = true;

  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe();
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
