<template>
<v-container fluid v-if="loading && cliplist.id !== ''">
  <v-row class="d-block">
    <div class="d-flex pt-10 align-baseline" >
      <span class="text-h4 font-weight-bold pr-3">{{cliplist.title}}</span>
    </div>
    <div class="d-flex align-center py-1">
        <span class="text-title-1 pr-3">
        <v-icon >mdi-playlist-play</v-icon>{{ cliplist.clipCount }}({{100 - cliplist.clipCount}})</span>
        <span class="text-title-1">
          <v-btn small icon @click="likeCliplist()" :disabled="likeLoading">
            <v-icon :color="liked ? 'twitch' : ''" class="pb-1">{{liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'}}</v-icon>
          </v-btn>
        <span class="pl-1">{{cliplist.likeCount}}</span></span>
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
    <div class="d-flex align-center pb-2" v-if="cliplist.tags.length > 0">
      <v-icon class="pr-2">mdi-label-multiple-outline</v-icon>
      <v-chip class="d-flex align-center text-caption chipPill mx-1" v-for="(tag, index) in cliplist.tags" :key="index" :to="'/tag/'+tag">
         {{tag}}
      </v-chip>
    </div>
    <div class="d-flex align-center">
      <router-link :to="`/user/${userInfo.id}`">
        <v-avatar
          size="36">
          <img :src="userInfo.profile_image_url" alt="alt">
        </v-avatar>
      </router-link>
      <div class="pl-1">
        <div>{{userInfo.display_name}}</div>
      </div>
      <span class="px-2">{{$moment(cliplist.createdAt).format('l')}}</span>
      <v-icon>{{likeIcon(cliplist.isPublic)}}</v-icon>
    </div>
    <v-spacer></v-spacer>
    <div class="text-body-1 pl-10">
      {{cliplist.description}}
    </div>
  </v-row>
  <v-row class="justify-center" v-if="cliplist.dataSet.length > 0">
     <Bar
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :height="$vuetify.breakpoint.smAndDown ? 150 : 300"
    :width="$vuetify.breakpoint.smAndDown ? 300 : 600"
    />
  </v-row>
  <div class="d-flex justify-center">
    <DisplyaAdContainerVue></DisplyaAdContainerVue>
  </div>
  <v-divider class="my-2"></v-divider>
  <expandTableVue
    v-if="($store.state.currentCliplist.length > 0 || tempArr.length > 0 )&& clipDataLoading"
    :clipListData="cliplist" :tempArr="tempArr">
  </expandTableVue>
  <v-row v-else-if="$store.state.currentCliplist.length === 0 && clipDataLoading" class="d-flex absolute-center justify-center align-center">
    <v-alert class="d-inline-block" type="error">🤐 저장된 클립이 없습니다.</v-alert>
  </v-row>
  <v-row v-else class="d-block">
    <div class="d-flex justify-center">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
    <div class="d-flex justify-center ">Loading Data</div>
  </v-row>
</v-container>
<v-container v-else-if="!loading && cliplist.id === ''" fluid>
  <v-row class="d-flex absolute-center justify-center align-center">
    <v-alert class="d-inline-block" type="error">🤐 더 이상 사용할 수 없는 클립모음 입니다.</v-alert>
  </v-row>
</v-container>
<v-container v-else fluid>
  <div class="d-flex justify-center absolute-center">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';
import DeleteDialog from '@/components/dialog/DeleteDialog.vue';
import axios from 'axios';
import expandTableVue from '@/components/cliplist/expandTable';
import ImportNewClipDialogVue from '@/components/dialog/ImportNewClipDialog.vue';
import DisplyaAdContainerVue from '@/components/DisplyaAdContainer.vue';

import { Bar } from 'vue-chartjs/legacy'
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Tooltip, BarElement, CategoryScale, LinearScale)



export default {
  components: {
    DeleteDialog,
    AddNewCliplistDialog,
    expandTableVue,
    ImportNewClipDialogVue,
    DisplyaAdContainerVue,
    Bar,
  },
  props: {
    chartId: {
      type: String,
      default: 'bar-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    barThickness:{
      type:Number,
      default: 1,
    },
    plugins: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      chartData:{},
      chartOptions: {
        indexAxis: 'y',
        responsive: true,
      },
      lastVisible: null,
      cliplist: {
        id:'',
        title:'',
        description:'',
        color:'',
        createdAt:'',
        authorId:'',
        authorName:'',
        tags:[],
      },
      tempArr:[],
      userInfo:'',
      loading: false,
      clipDataLoading: false,
      likeLoading: false,
      colorSet:[
        { display_name: '아이네_', color:'#8a2be2' },
        { display_name: '징버거', color:'#f0a957' },
        { display_name: '릴파_', color:'#000080' },
        { display_name: '주르르', color:'#800080' },
        { display_name: '고세구___', color:'#467ec6' },
        { display_name: '비챤_', color:'#85ac20' },
      ]
    };
  },
  methods: {
    likeIcon(el){
      if(el === 0){
        return 'mdi-eye-off'
      }else if(el === 1){
        return 'mdi-eye'
      }else{
        return 'mdi-earth'
      }
    },
    async likeCliplist(){
      if(this.$store.state.userinfo.userInfo){
        this.likeLoading = true
        let docRef = await this.$firestore.collection('cliplist').doc(this.$route.params.id);
        let userDocs = await this.$firebase.database().ref().child('/users/' +this.$store.state.userinfo.userInfo.uid);
        let updates = {};
        if(this.liked){
          updates['/likelist/'+this.$route.params.id] = null;
          userDocs.update(updates);
          docRef.update({
            likeCount: this.$firebase.firestore.FieldValue.increment(-1),
            likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.$store.state.userinfo.userInfo.uid)
          })
          .then(() => {
            this.likeLoading = false
            this.$store.commit('SET_SnackBar',{type:'error', text:`Cliplist : "${this.cliplist.title}"을 좋아요 목록에서 제거합니다.`, value:true})
          })
        } else {
          updates['/likelist/'+this.$route.params.id] = parseInt(new Date().getTime()) ;
          userDocs.update(updates);
          docRef.update({
            likeCount: this.$firebase.firestore.FieldValue.increment(1),
            likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.$store.state.userinfo.userInfo.uid)
          })
          .then(() => {
            this.likeLoading = false
            this.$store.commit('SET_SnackBar',{type:'success', text:`Cliplist : "${this.cliplist.title}"을 좋아요 목록에 추가합니다.`, value:true})
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
        }).catch( async (e) => {
          if(e.response.status === 401){
            await this.$store.dispatch('setNewTwitchAppToken');
            await this.getUserInfo(userId);
          }
        });
    },
    async deleteCliplist(){
      await this.$firestore.collection('cliplist').doc(this.$route.params.id).delete();
      this.$router.push({path:'/mycliplist'}).catch(()=>{});
      this.$store.commit('SET_SnackBar',{type:'error', text:`Cliplist : ${this.cliplist.title}클립 모음집이 삭제되었습니다.`, value:true});
    },
    async getTwitchClipData(el){
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: { id: el }
      }).then((res) => {
        this.tempArr = res.data.data.sort((a,b) => b.view_count - a.view_count);
        this.clipDataLoading = true;
      }).catch( async (e) => {
          if(e.response.status === 401){
            await this.$store.dispatch('setNewTwitchAppToken');
            await this.getTwitchClipData(el);
          }
        });
    },
  },
  computed: {
    liked(){
      if(!this.$store.state.userinfo.userInfo) return false;
      if(this.cliplist.likeUids === undefined) return false;
      return this.cliplist.likeUids.includes(this.$store.state.userinfo.userInfo.uid);
    },
  },
  async created() {
    let docRef = await this.$firestore.collection('cliplist').doc(this.$route.params.id);

    this.unsubscribe = await docRef.onSnapshot(async (doc) => {
      const item = doc.data();
      document.title = `${item.title ? item.title : ''} | Special - CCTWITCH`;
      if(!this.userInfo){
        this.getUserInfo(item.authorId)
      }
      if(doc.exists){
        this.cliplist = {
          id: docRef.id,
          title: item.title,
          description: item.description,
          color: item.color,
          clipCount: item.clipCount,
          isPublic: item.isPublic,
          dataSet: item.dataSet,
          clipIds : item.clipIds,
          likeCount : item.likeCount,
          likeUids : item.likeUids,
          tags : item.tags,
          createdAt: item.createdAt.toDate(),
          authorId: item.authorId,
          authorName: item.authorName,
          thumbnail_url: item.thumbnail_url,
        }
        if(item.dataSet[0] !== undefined){
          this.chartData = {
            labels: [
              this.cliplist.dataSet[0].userData.display_name,
              this.cliplist.dataSet[1].userData.display_name,
              this.cliplist.dataSet[2].userData.display_name,
              this.cliplist.dataSet[3].userData.display_name,
              this.cliplist.dataSet[4].userData.display_name,
              this.cliplist.dataSet[5].userData.display_name,
              ],
            datasets: [
              {
                label: 'Clips',
                data: [
                  this.cliplist.dataSet[0].count,
                  this.cliplist.dataSet[1].count,
                  this.cliplist.dataSet[2].count,
                  this.cliplist.dataSet[3].count,
                  this.cliplist.dataSet[4].count,
                  this.cliplist.dataSet[5].count,
                ],
                backgroundColor: [
                  this.colorSet.find(x => x.display_name === this.cliplist.dataSet[0].userData.display_name).color,
                  this.colorSet.find(x => x.display_name === this.cliplist.dataSet[1].userData.display_name).color,
                  this.colorSet.find(x => x.display_name === this.cliplist.dataSet[2].userData.display_name).color,
                  this.colorSet.find(x => x.display_name === this.cliplist.dataSet[3].userData.display_name).color,
                  this.colorSet.find(x => x.display_name === this.cliplist.dataSet[4].userData.display_name).color,
                  this.colorSet.find(x => x.display_name === this.cliplist.dataSet[5].userData.display_name).color,
                ],
              }
            ]
          }
        }
        await this.getTwitchClipData(item.clipIds);
        if(item.thumbnail_url !== this.tempArr[0].thumbnail_url || this.tempArr.length !== item.clipCount){
          docRef.update({
            clipCount: this.tempArr.length,
            thumbnail_url: this.tempArr[0].thumbnail_url
          });
        }
      }
    })
    this.loading = true;
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe();
    this.$store.commit('SET_CurrentClipList',[]);
  },

};
</script>
<style lang="scss" scoped>
</style>
