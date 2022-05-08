<template>
<v-container fluid>
  <v-row class="d-block">
    <div class="d-flex pt-10 align-baseline">
      <span class="text-h3 font-weight-bold pr-3">{{cliplist.title}}</span>
      <span class="text-subtitle-1">
        <v-icon>mdi-</v-icon>
        (총 {{ cliplist.clipCount }} / 100 개)</span>
    </div>
    <div class="d-flex align-baseline pb-1">
      <span></span>
      <span class="text-body-2 grey--text pr-3">조회수 {{cliplist.viewCount}}</span>
      <span class="text-body-2 grey--text pr-3">
        <v-icon small>mdi-thumb-up-outline</v-icon>
        <span class="text-body-2 grey--text pr-3">{{cliplist.likeCount}}</span>
      </span>
      <span class="text-caption">{{$moment(cliplist.createdAt).format('ll')}}</span>
      <v-spacer></v-spacer>
      <div class="d-flex" v-if="$store.state.userinfo.userInfo && $store.state.userinfo.userInfo.uid === cliplist.authorId">
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
        <AddNewCliplistDialog
        :type="{
          type:'edit',
          data: cliplist,
          }">
        </AddNewCliplistDialog>
      </div>
    </div>
    <v-divider></v-divider>
  </v-row>
  <v-row class="d-block py-3">
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
    <div class="py-3 text-body-1 pl-10">
      {{cliplist.description}}
    </div>
  </v-row>
  <expandTableVue
    class="pb-10"
    v-if="$store.state.currentCliplist.length > 0"
    :clipListData="cliplist">
  </expandTableVue>
  <v-row v-else style="height:60vh;" class="d-flex justify-center align-center">
    <v-alert rounded="pill" class="d-inline-block" type="error">🤐 저장 혹은 공유된 클립 모음이 없습니다.</v-alert>
  </v-row>
  <v-row v-if="cliplist.clipCount > $store.state.currentCliplist.length" class="d-block pb-16" v-intersect="onIntersect">
    <div class="d-flex justify-center">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div class="d-flex justify-center ">데이터 불러오는 중...</div>
  </v-row>
</v-container>
</template>

<script>
import { last } from 'lodash';
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
      lastVisible: null,
      cliplist: {
        id:'',
        title:'',
        description:'',
        color:'',
        createdAt:'',
        authorId:'',
        authorName:'',
      },
      userInfo:'',
      currentTooltipId: '',
      loading: false,
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
    onIntersect(entries , observer, isIntersecting)
    {
      setTimeout(() => {
        if(isIntersecting){
          this.getMoreClips()
        }
      }, 3000);
    },
    async getUserInfo(userId){
      await axios.get('https://api.twitch.tv/helix/users',{
          headers: this.$store.state.headerConfig,
          params:{
            id: userId.split('twitch:')[1],
          }
        }).then( res => {
          this.userInfo = res.data.data[0];
        });
    },
    async deleteCliplist(){
      await this.$firestore.collection('cliplist').doc(this.$route.params.id).delete();
      this.$router.push({path:'/mycliplist'});
      this.$store.commit('SET_SnackBar',{type:'error', text:`${this.cliplist.title}클립 모음집이 삭제되었습니다.`, value:true});
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
    async getTwitchClipData(el){
      return await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: { id: el }
      })
    },
    async getMoreClips(){
      let docRef = await this.$firestore.collection('cliplist').doc(this.$route.params.id);
      docRef.collection('clips').orderBy('createdAt','asc').startAfter(this.lastVisible).limit(10).get().then((collection) =>{
        this.lastVisible = last(collection.docs);
        if(collection.docs.length > 0){
          collection.docs.forEach(async (el) => {
            let fireClip = await el.data();
            let twitchClip = await this.getTwitchClipData(fireClip.clipId);
            this.$store.commit('ADD_ClipInCurrentCliplist',{
              clipData: twitchClip.data.data[0],
              fireData: fireClip,
            })
        })
        }
      })
    }
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
  },
  async created(){
    this.$store.commit('SET_CurrentClipList',[]);
    await this.$firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.commit('SET_UserInfo',user);
      }
    })
  },
  async mounted() {
    let docRef = await this.$firestore.collection('cliplist').doc(this.$route.params.id);
    this.unsubscribe = docRef.onSnapshot((doc) => {
      const item = doc.data();
      this.getUserInfo(item.authorId)
        if(doc.exists){
          this.cliplist = {
            id: docRef.id,
            title: item.title,
            description: item.description,
            color: item.color,
            viewCount: item.viewCount,
            clipCount: item.clipCount,
            likeCount: item.likeCount,
            createdAt: item.createdAt.toDate(),
            authorId: item.authorId,
            authorName: item.authorName,
          }
        }
    });

    docRef.collection('clips').orderBy('createdAt','asc').limit(10).get().then(async (collection) =>{
      console.log(collection.docs);
      this.lastVisible = await last(collection.docs);
      if(collection.docs.length > 0){
        await collection.forEach( async (el) => {
          let fireClip = await el.data();
          let twitchClip = await this.getTwitchClipData(fireClip.clipId);
          this.$store.commit('ADD_ClipInCurrentCliplist',{
              clipData: twitchClip.data.data[0],
              fireData: fireClip,
            })
        });
    }})
    this.loading = true;
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe();
    this.$store.commit('SET_CurrentClipList',[]);
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
