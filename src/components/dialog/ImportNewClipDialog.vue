<template>
  <v-dialog
    v-model="dialog"
    no-click-animation
    @keydown:esc="dialog = !dialog"
    max-width="1280">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        v-bind="attrs"
        v-on="on"
      >
      <v-icon>mdi-clipboard-plus-outline</v-icon>
      </v-btn>
    </template>
    <v-card :disabled="loading" class="justify-center overflow-auto">
      <v-card-title class="twitch text-h5 font-weight-bold">
        <div class="white--text">Twitch 클립 가져오기</div>
      </v-card-title>
      <v-card-text class="d-flex justify-center">
          <v-text-field
            v-model="clipUrl"
            :loading="importLoading"
            outlined
            color="twitch"
            width="500"
            @click:append="getClip(clipUrl)"
            class="pt-5"
            prepend-icon="mdi-link-variant"
            append-icon="mdi-magnify"
            hide-details=""
            placeholder="Input Twitch Clip URL or Id"
          >
          <template v-slot:progress>
            <v-progress-linear
              v-if="importLoading"
              color="twitch"
              indeterminate
              height="6"
              absolute
            ></v-progress-linear>
          </template>
          </v-text-field>
      </v-card-text>
      <v-dialog
        v-model="clipDialog"
        max-width="960px"
        transition="dialog-transition"
      >
        <v-card>
          <v-card-title primary-title>
            <div>{{$moment(clipResult.created_at).format('ll')}}</div>
          </v-card-title>
          <v-card-text class="d-flex justify-center align-center">
            <iframe v-if="clipDialog" class="black" :src="`${clipResult.embed_url}&parent=localhost&autoplay=false&muted=false&preload=auto`" width="200%"
            height="400" frameborder="0"></iframe>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn text color="error" @click="clipDialog = false">Close</v-btn>
            <v-btn text color="success" :disabled="inQue" @click="addToCliplist(clipResult)">Add</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-card-text>
        <v-list>
          <v-list-item class="px-2 py-1" v-for="(item,index) in pinnedClipslist" :key="index">
            <v-list-item-content class="pa-0 ma-0">
              <ImportedClipIframeDialog :clipData="item" @deleteClip="deleteClip(item,index)"></ImportedClipIframeDialog>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="red darken-1"
          text
          @click="dialog = false"
        >
          Close
        </v-btn>
        <v-btn
        text
        :loading="loading"
        color="success"
        @click="addToFireStoreCliplist()"
        :disabled="this.pinnedClipslist.length === 0"
        >
        Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import axios from 'axios';
import ImportedClipIframeDialog from '@/components/dialog/importedClipIframeDialog';
export default {
  components: {
    ImportedClipIframeDialog,
  },
  props: ['type','parent'],
  data() {
    return {
      clipDialog: false,
      dialog: false,
      loading:false,
      clipUrl: '',
      clipResult:[],
      pinnedClipslist:[],
      importLoading: false,
      inQue:false,
    };
  },
  methods: {
    deleteClip(item, index){
      this.pinnedClipslist.splice(index, 1);
      this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : ${item.title}을 목록에서 삭제합니다.`, value: true });
    },
    addToCliplist(el){
      if(this.pinnedClipslist.length + this.parent.clipCount > 100){
        this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 클립은 최대 100까지 저장 가능합니다.`, value: true });
        this.clipDialog = false;
        this.clipUrl = '';
      } else {
        this.pinnedClipslist.push(el);
        this.$store.commit('SET_SnackBar', { type: 'success', text: `Import : ${el.title}을 추가합니다.`, value: true });
        this.clipDialog = false;
        this.clipUrl = '';
      }
    },
    async addToFireStoreCliplist(){
      this.loading = true;
      if(this.pinnedClipslist.length + this.parent.clipCount > 100) return
      let batch = this.$firestore.batch();
      let objectData = this.pinnedClipslist.map( (v) => {
        return v.id;
      })
      let target = this.$firestore.collection('cliplist').doc(this.parent.id);
      let intersection = this.pinnedClipslist.filter( x => this.parent.clipIds.includes(x.id));
      let stateData = [];

      if(intersection.length === 0){
        this.pinnedClipslist.forEach((el) => {
          batch.set(target.collection('clips').doc(el.id),{
            clipId: el.id,
            createdAt: parseInt(new Date().getTime()),
            thumbnail_url: el.thumbnail_url,
          });
          stateData.push({
            fireData:{
              clipId: el.id,
              createdAt: parseInt(new Date().getTime()),
              thumbnail_url: el.thumbnail_url,
            },
            clipData: el,
          })
        })
        batch.update(target,{
          clipIds: this.$firebase.firestore.FieldValue.arrayUnion(...objectData),
          clipCount:  this.$firebase.firestore.FieldValue.increment(this.pinnedClipslist.length),
        })

        await batch.commit().then( () => {
          this.$store.commit('ADD_CurrentCliplist', stateData)
          this.$store.commit('SET_SnackBar',{type:'success', text: this.pinnedClipslist.length > 1 ? `${this.pinnedClipslist[0].title}외 ${this.pinnedClipslist.length - 1}개의 클립을 추가했습니다.` : `${this.pinnedClipslist[0].title}을 추가했습니다.`, value:true})
          this.pinnedClipslist = [];
          this.loading = false;
          this.dialog = false;
        })
        .catch( () => {
          this.$store.commit('SET_SnackBar',{type:'error', text:`Something wrong`, value:true})
        })
      }else {
        this.loading = false;
        this.$store.commit('SET_SnackBar',{type:'error', text:`중복된 클립이 존재합니다.`, value:true})
      }
      },
    async getClip(el) {
      this.inQue = false;
      this.importLoading = true;
      let preClipId = el.trim();
      let resultId = null;
      if(preClipId.match('twitch.tv/')){
        resultId = preClipId.split('.tv/')[1].split('?')[0];
      }else{
        resultId = preClipId.split('?')[0];
      }
      let isInvolved = this.pinnedClipslist.find(element => element.id === resultId);
      let isIn = this.parent.clipIds.find(element => element === resultId);
      if(isInvolved || isIn){
        this.inQue = true;
        this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 이미 추가된 클립입니다.`, value: true });
        this.importLoading = false;
      } else {
        await axios.get('https://api.twitch.tv/helix/clips', {
          headers: this.$store.state.headerConfig,
          params: {
            id: resultId,
          },
        }).then((res) => {
          if(res.data.data.length > 0){
            this.clipResult = res.data.data[0];
            this.clipDialog = true;
          } else {
             this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 클립을 가져올 수 없습니다.`, value: true });
          }
            this.importLoading = false;
        });
      }

    },
  },
  created() {
  },

};
</script>
<style lang="scss" scoped>
.cliplist-canvas{
  border-radius: 5%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  width: 50px;
  height: 50px;
}
.v-list-item__content{
  padding-left: 10px !important;
}
div[role=listitem]:hover{
  cursor: pointersection;
  background-color: rgb(0, 0, 0, 0.2) !important;
}
.v-text-field{
  width: 200px;
}
.v-list-item{
  padding-bottom: 3px;
  border-bottom: 1px solid var(--twitch-color);
}
</style>
