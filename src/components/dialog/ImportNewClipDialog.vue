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
              height="4"
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
            <v-list-item-content>
              <v-dialog
              :v-model="item.id === currentId"
              @click:outside="currentId = null"
              max-width="1280"
              max-height="720"
              >
              <template v-slot:activator="{on, attrs}">
                <v-list-item-title
                v-on="on"
                @click="currentId = null, currentId = item.id"
                v-bind="attrs"
                class="d-flex align-center">
                <div class="d-flex align-center">
                  <v-img
                  max-width="70"
                  :src="item.thumbnail_url"></v-img>
                  <span class="pl-3 text-truncate text-caption font-weight-black twitch--text">{{item.title}}</span>
                </div>
                </v-list-item-title>
              </template>
              <div class="black d-flex justify-end">
                <v-btn color="error" icon @click="currentId = null"><v-icon>mdi-close</v-icon></v-btn>
              </div>
              <iframe
                class="black d-flex align-center mx-auto"
                v-if="item.id === currentId"
                :src="`https://clips.twitch.tv/embed?clip=${currentId}&parent=localhost&autoplay=true&muted=false&preload=auto`"
                preload="auto"
                frameborder="0"
                width="1280"
                height="720"
                allowfullscreen="true"></iframe>
            </v-dialog>
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
        @click="addCliplist()"
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
export default {
  components: {
  },
  props: ['type'],
  data() {
    return {
      clipdb: clipdb,
      clipDialog: false,
      currentId: '',
      dialog: false,
      color: '',
      clipUrl: '',
      result:'',
      clipResult:'',
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
    async addToCliplist(el){
      await this.pinnedClipslist.push(el);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Import : ${el.title}을 추가합니다.`, value: true });
      this.clipDialog = false;
      this.clipUrl = '';
    },
    async addCliplist(){
      let listIndex = this.$store.state.cliplist.findIndex(element => this.$store.state.currentCliplist.id === element.id);
      await this.pinnedClipslist.forEach( async element => {
        await this.$store.commit('ADD_pinnedClip', {data: element, listIndex:listIndex})});
      this.initailize();
      },
    async getClip(el) {
      this.inQue = false;
      this.importLoading = true;
      let clipId = el.trim();
      let isInvolved = this.pinnedClipslist.find(element => element.id === clipId);
      let isIn = this.$store.state.currentCliplist.pinnedClips.find(element => element.id === clipId);
      console.log(isInvolved, 'isInvolved');
      console.log(isIn,'isIn');
      if(isInvolved || isIn){
        this.inQue = true;
        this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 이미 추가된 클립입니다.`, value: true });
        this.importLoading = false;
      } else {
        await axios.get('https://api.twitch.tv/helix/clips', {
          headers: this.$store.state.headerConfig,
          params: {
            id: clipId,
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
  cursor: pointer;
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
