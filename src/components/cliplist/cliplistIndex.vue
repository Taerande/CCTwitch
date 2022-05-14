<template>
<v-container fluid>
  <v-row class="d-block">
    <div class="d-flex pt-10 align-baseline">
      <span class="text-h4 font-weight-bold pr-3">{{cliplist.title}}</span>
    </div>
    <SignInDialog v-if="SignInDialog"></SignInDialog>
    <div class="d-flex align-center pb-1">
        <span class="text-title-1 pr-3">
        <v-icon >mdi-playlist-play</v-icon>CLIPS: {{ cliplist.clipCount }}</span>
        <span class="text-title-1">
        <v-icon class="pb-1" @click="likeCliplist()">{{liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'}}</v-icon><span class="pl-3">LIKE :{{cliplist.likeCount}}</span></span>
      <span class="text-caption px-2">{{$moment(cliplist.createdAt).format('l')}}</span>
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
    <v-progress-linear value="100"  class="pb-3" :color="cliplist.color"></v-progress-linear>
  </v-row>
  <v-row class="d-block py-2">
    <div class="d-flex align-center">
      <v-avatar
        size="36">
        <img :src="userInfo.profile_image_url" alt="alt">
      </v-avatar>
      <div class="pl-1">
        <div>{{userInfo.display_name}}</div>
      </div>
    </div>
    <v-spacer></v-spacer>
    <div class="text-body-1 pl-10">
      {{cliplist.description}}
    </div>
  </v-row>
  <expandTableVue
    v-if="$store.state.currentCliplist.length > 0"
    :clipListData="cliplist">
  </expandTableVue>
  <v-row v-else style="height:60vh;" class="d-flex justify-center align-center">
    <v-alert rounded="pill" class="d-inline-block" type="error">🤐 저장 혹은 공유된 클립 모음이 없습니다.</v-alert>
  </v-row>
  <v-row class="d-flex justify-center" v-if="cliplist.clipCount > $store.state.currentCliplist.length && loading">
    <v-icon large>mdi-dots-horizontal</v-icon>
  </v-row>
  <v-row v-if="cliplist.clipCount > $store.state.currentCliplist.length" class="d-block pb-16 pt-10" v-intersect="onIntersect">
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
import SignInDialog from '../dialog/SignInDialog.vue';


export default {
  components: {
    DeleteDialog,
    AddNewCliplistDialog,
    expandTableVue,
    ImportNewClipDialogVue,
    SignInDialog
},
  data() {
    return {
      SignInDialog: false,
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
      gotDataStatus:false,
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
        if(isIntersecting && this.gotDataStatus && this.lastVisible){
          this.getMoreClips()
        }
      }, 500);
    },
    async likeCliplist(){
      if(this.$store.state.userinfo.userInfo){
        let docRef = await this.$firestore.collection('cliplist').doc(this.$route.params.id);
        let userDocs = await this.$firebase.database().ref().child('/users/' +this.$store.state.userinfo.userInfo.uid);
        let updates = {};
        if(this.liked){
          updates['/likelist/'+this.$route.params.id] = null;
          userDocs.update(updates);
          docRef.update({
            likeCount: this.$firebase.firestore.FieldValue.increment(-1),
            likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.$store.state.userinfo.userInfo.uid)
          }).then(() => {
            this.$store.commit('SET_SnackBar',{type:'error', text:`"${this.cliplist.title}"을 좋아요 목록에서 제거합니다.`, value:true})
          })
        } else {
          updates['/likelist/'+this.$route.params.id] = parseInt(new Date().getTime()) ;
          userDocs.update(updates);
          docRef.update({
            likeCount: this.$firebase.firestore.FieldValue.increment(1),
            likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.$store.state.userinfo.userInfo.uid)
          }).then(() => {
            this.$store.commit('SET_SnackBar',{type:'info', text:`"${this.cliplist.title}"을 좋아요 목록에 추가합니다.`, value:true})
          })
        }
      } else {
        this.$store.commit('SET_SignInDialog', true);
      }

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
      this.gotDataStatus = false;
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
      }).then(() => {
        this.gotDataStatus = true
      })
    }
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? 'dark-table' : 'light-table';
    },
    liked(){
      if(!this.$store.state.userinfo.userInfo) return false;
      if(this.cliplist.likeUids === undefined) return false;
      return this.cliplist.likeUids.includes(this.$store.state.userinfo.userInfo.uid);
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
    this.unsubscribe = await docRef.onSnapshot((doc) => {
      const item = doc.data();
      this.getUserInfo(item.authorId)
        if(doc.exists){
          this.cliplist = {
            id: docRef.id,
            title: item.title,
            description: item.description,
            color: item.color,
            clipCount: item.clipCount,
            likeCount: item.likeCount,
            likeUids : item.likeUids,
            isPublic: item.isPublic,
            clipIds : item.clipIds,
            createdAt: item.createdAt.toDate(),
            authorId: item.authorId,
            authorName: item.authorName,
          }
        }
    });

    await docRef.collection('clips').orderBy('createdAt','asc').limit(10).get().then(async (collection) =>{
      this.lastVisible = await last(collection.docs);
      if(collection.docs.length > 0){
        await collection.docs.forEach( async (el, index) => {
          let fireClip = await el.data();
          let twitchClip = await this.getTwitchClipData(fireClip.clipId);
          this.$store.commit('ADD_ClipInCurrentCliplist',{
              clipData: twitchClip.data.data[0],
              fireData: fireClip,
            });
            if(index + 1 === collection.docs.length){
              this.gotDataStatus = true;
            }
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
