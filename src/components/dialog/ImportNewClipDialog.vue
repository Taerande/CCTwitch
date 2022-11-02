<template>
  <v-dialog
    v-model="dialog"
    no-click-animation
    scrollable
    @keydown:esc="dialog = !dialog"
    max-width="1080">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        v-bind="attrs"
        v-on="on"
      >
      <v-icon>mdi-clipboard-plus-outline</v-icon>
      </v-btn>
    </template>
    <v-card flat :disabled="loading" class="justify-center overflow-auto">
      <v-card-title class="twitch text-h5 font-weight-bold">
        <div class="white--text">Twitch 클립 가져오기</div>
      </v-card-title>
      <v-card-text class="d-block justify-center pa-0">
        <v-form
         class="px-5"
        style="width:inherit"
        @submit.prevent="getClip(clipUrl)"
        >
          <v-text-field
            v-model="clipUrl"
            :loading="importLoading"
            outlined
            color="twitch"
            width="100%"
            @click:append="getClip(clipUrl)"
            class="pt-5"
            prepend-icon="mdi-link-variant"
            append-icon="mdi-magnify"
            hide-details
            placeholder="Input Twitch Clip URL or Id"
          >

          <template v-slot:progress>
            <v-progress-linear
              v-if="importLoading"
              color="success"
              indeterminate
              height="6"
              absolute
            ></v-progress-linear>
          </template>
          </v-text-field>
      </v-form>
      <v-card v-if="clipResult.id" class="pa-3 ma-0">
        <v-card-title class="pa-0 py-2">
          <div>{{$moment(clipResult.created_at).format('ll')}}</div>
          <v-spacer></v-spacer>
          <v-btn color="erorr" icon @click="clipResult.id = ''"><v-icon color="error">mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-0 ma-0">
          <v-responsive :aspect-ratio="$vuetify.breakpoint.smAndDown ? 1/1 : 16/9">
            <iframe class="black" :src="`${clipResult.embed_url}&parent=${$store.state.embedUrl}&autoplay=false&muted=false&preload=auto`" width="100%" height="100%" allowfullscreen frameborder="0"></iframe>
          </v-responsive>
        </v-card-text>
      </v-card>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="red darken-1"
          class="text-caption"
          text
          @click=" clipResult = { id: '' }, dialog = false"
        >
          Close
        </v-btn>
        <v-btn
        text
        :loading="loading"
        color="success"
        class="text-caption"
        @click="addToFireStoreCliplist()"
        :disabled="clipResult.id === '' || isIn"
        >
        Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import axios from 'axios';
export default {
  components: {
  },
  props: ['type','parent'],
  data() {
    return {
      dialog: false,
      loading:false,
      clipUrl: '',
      clipResult:{
        id: '',
      },
      importLoading: false,
      resultId:'',
    };
  },
  methods: {
    async addToFireStoreCliplist(){
      this.loading = true;
      if(this.parent.clipCount > 99) return
      if(this.isIn){
         this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 이미 추가된 클립입니다.`, value: true });
      } else {
        let batch = this.$firestore.batch();
        let target = this.$firestore.collection('cliplist').doc(this.parent.id);
        let stateData = {
          fireData:{
            clipId: this.clipResult.id,
            createdAt: parseInt(new Date().getTime()),
            thumbnail_url: this.clipResult.thumbnail_url,
          },
            clipData: this.clipResult,
          }
          batch.update(target,
          this.parent.clipCount === 0
          ?
          {
            clipIds: this.$firebase.firestore.FieldValue.arrayUnion(this.clipResult.id),
            clipCount:  this.$firebase.firestore.FieldValue.increment(1),
            thumbnail_url: this.clipResult.thumbnail_url,
          }
          :
          {
            clipIds: this.$firebase.firestore.FieldValue.arrayUnion(this.clipResult.id),
            clipCount:  this.$firebase.firestore.FieldValue.increment(1),
          }
          )
          batch.set(target.collection('clips').doc(stateData.fireData.clipId),stateData.fireData);
          await batch.commit().then(() => {
            // if(this.parent.clipCount - 1 === this.$store.state.currentCliplist.length && this.$store.state.currentCliplist.length < 100){
            //   this.$store.commit('ADD_CurrentCliplist', [stateData])
            this.$store.commit('SET_SnackBar',{type:'success', text:`Clip: ${this.clipResult.title}을 저장했습니다.`});
            this.loading = false;
            this.clipUrl = null;
            this.dialog = false;
            this.clipResult.id = '';
          })
          .catch( () => {
            this.$store.commit('SET_SnackBar',{type:'error', text:`Something wrong`, value:true})
          })
      }
      this.resultId = '';
      },
    async getClip(el) {
      this.clipResult = [];
      this.importLoading = true;
      let preClipId = el.trim();
      if(preClipId.match('twitch.tv/')){
        this.resultId = preClipId.split('.tv/')[1].split('?')[0];
      }else{
        this.resultId = preClipId.split('?')[0];
      }
      if(this.isIn){
        this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 이미 추가된 클립입니다.`, value: true });
        this.importLoading = false;
      } else {
        await axios.get('https://api.twitch.tv/helix/clips', {
          headers: this.$store.state.headerConfig,
          params: {
            id: this.resultId,
          },
        }).then((res) => {
          if(res.data.data.length > 0){
            this.clipResult = res.data.data[0];
          } else {
             this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 클립을 가져올 수 없습니다.`, value: true });
          }
          this.importLoading = false;
        }).then(() => {
          if(this.isIn){
              this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 이미 추가된 클립입니다.`, value: true });
            }
        }).catch(async (error) => {
          //비정상, 앱엑세스 토큰 재발급 Backend 처리
          await axios.get(this.$store.state.appTokenURL).then((res) => {
            localStorage.setItem('twitchAppAccessToken', JSON.stringify(res.data.access_token));
            this.$store.commit('SET_TwitchAppAccessToken', res.data.access_token);
          }).then(() => {
            this.getClip(el);
          })
        });
      }

    },
  },
  computed:{
    isIn(){
      return this.parent.clipIds.find(element => element === this.clipResult.id) !== undefined;
    }
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
.v-list-item{
  padding-bottom: 3px;
  border-bottom: 1px solid var(--twitch-color);
}
</style>
