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
    <v-card class="justify-center overflow-auto">
      <v-card-title class="twitch text-h5 font-weight-bold">
        <div>Twitch 클립 가져오기</div>
      </v-card-title>
      <v-card-text class="d-flex justify-center">
          <v-text-field
            v-model="clipUrl"
            :loading="importLoading"
            outlined
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
            <div>
              {{clipResult.title}}
            </div>
            <v-spacer></v-spacer>
            <div>{{setDate(clipResult.created_at)}}</div>
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
          <v-list-item class="mx-3 py-1" v-for="(item,index) in pinnedClipslist" :key="index">
            <v-list-item-content class="pa-0 ma-0">
              <ImportedClipIframeDialog :clipData="item"></ImportedClipIframeDialog>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon>
                <v-icon color="error" @click="deleteClip(item, index)">mdi-close</v-icon>
              </v-btn>
            </v-list-item-action>
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
import clipdb from '@/assets/clipdata.json'
import ImportedClipIframeDialog from '@/components/dialog/importedClipIframeDialog';
export default {
  components: {
    ImportedClipIframeDialog,
  },
  props: ['type','parent'],
  data() {
    return {
      clipdb: clipdb,
      clipDialog: false,
      currentId: '',
      dialog: false,
      color: '',
      clipUrl: '',
      result:'',
      clipResult:[],
      pinnedClipslist:[],
      importLoading: false,
      inQue:false,
    };
  },
  methods: {
     viewerkFormatter(el) {
      const num = el.toString()
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(
          num.length - 9,
          -6,
        )},${num.slice(num.length - 6, -3)},${num.slice(-3)}`
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(
          num.length - 6,
          -3,
        )},${num.slice(-3)}`
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`
      }
      return Math.abs(num)
    },
    initailize(){
      this.dialog = false;
      this.pinnedClipslist = [];
    },
    deleteClip(item, index){
      this.pinnedClipslist.splice(index, 1);
       this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : ${item.title}을 목록에서 삭제합니다.`, value: true });
    },
    addToCliplist(el){
      this.pinnedClipslist.push(el);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Import : ${el.title}을 추가합니다.`, value: true });
      this.clipDialog = false;
      this.clipUrl = '';
    },
    async addToFireStoreCliplist(){
      let objectData = this.pinnedClipslist.map( (v) => {
        return v.id;
      })
      let intersection = this.pinnedClipslist.filter( x => this.$store.state.currentCliplist.includes(x));

      if(intersection.length === 0){
        let target = this.$firestore.collection('cliplist').doc(this.parent.id);
        target.update({
          cliplist: this.$firebase.firestore.FieldValue.arrayUnion(...objectData)
        }).then( () => {
          this.$store.commit('ADD_CurrentCliplist', this.pinnedClipslist)
          this.$store.commit('SET_SnackBar',{type:'success', text: this.pinnedClipslist.length > 1 ? `${this.pinnedClipslist[0].title}외 ${this.pinnedClipslist.length - 1}개의 클립을 추가했습니다.` : `${this.pinnedClipslist[0].title}을 추가했습니다.`, value:true})
          this.pinnedClipslist = [];
          this.dialog = false;
        })
        .catch( () => {
          this.$store.commit('SET_SnackBar',{type:'error', text:`Something wrong`, value:true})
        })
      }else {
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
      let isIn = this.parent.cliplist.find(element => element === resultId);
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
    setDate(el) {
      return this.$moment(el).format('ll');
    },
    dataType(el) {
      if (el) {
        return 'URL & String';
      }
      return 'Data File';
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
