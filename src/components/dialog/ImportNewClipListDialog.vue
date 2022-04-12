<template>
  <v-dialog
    v-model="dialog"
    no-click-animation
    @keydown:esc="dialog = !dialog"
    max-width="1280">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        outlined
        text
        class="text-caption mr-3"
        color="success"
        v-bind="attrs"
        v-on="on"
      >
      Import Clip Data
      </v-btn>
    </template>
    <v-card height="700" fill-height class="justify-center">
      <v-card-title class="d-flex justify-center text-h5">
        <span class="left-element" style="margin-right:auto, opacity:0">none</span>
        <div>
          <div> Import Clip Data </div>
          <div class="d-flex justify-center align-baseline twitch--text text-body-1"> {{dataType(switch1)}} </div>
        </div>
        <v-switch
        class="right-element"
        style="margin-left:auto"
        v-model="switch1"
        flat
        :label="dataType(switch1)"
      ></v-switch>
      </v-card-title>
      <v-card-text
      class="d-flex justify-center">
        <div v-if="switch1">
          <v-text-field
            v-model="clipData"
            :loading="loading"
            outlined
            width="500"
            @click:append="getClip(clipData)"
            class="pt-5"
            prepend-icon="mdi-link-variant"
            append-icon="mdi-magnify"
            hide-details=""
            placeholder="Input Twitch Clip URL or Id"
          >
          <template v-slot:progress>
            <v-progress-linear
              :indeterminate="false"
              height="10"
              :color="success"
              absolute
            ></v-progress-linear>
          </template>
          </v-text-field>
        </div>
        <div v-else>
        <v-text-field
            v-model="cliplistString"
            :loading="loading"
            outlined
            width="500"
            class="pt-5"
            append-icon="mdi-magnify"
            @click:append="getCliplist(cliplistString)"
            hide-details=""
            placeholder="Cliplist String"
          >
          <template v-slot:prepend-inner>
            <v-icon>mdi-link-variant</v-icon>
          </template>
          <template v-slot:progress>
            <v-progress-linear
              :indeterminate="false"
              height="10"
              :color="success"
              absolute
            ></v-progress-linear>
          </template>
          </v-text-field>
        </div>
        <v-container v-if="switch1" class="d-flex justify-center align-center pt-5">
          <div class="blue--text">{{clipResult}}</div>

          <v-progress-circular v-if="importLoading" indeterminate></v-progress-circular>
        </v-container>
        <v-container fluid fill-height v-else class="d-flex justify-center align-center pt-5">
          <ImportDataExpansion pansion v-if="result.title" :result="result"></ImportDataExpansion>
          <v-progress-circular v-if="importLoading" indeterminate></v-progress-circular>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <pinClip v-if="switch1" @init="initailize" name="importedClipPin" :clipData="result"></pinClip>
        <v-btn
        v-else
        text
        color="success"
        @click="addCliplist"
        :disabled="this.result.title === undefined"
        >
        Add
        </v-btn>
        <v-btn
          color="red darken-1"
          text
          @click="dialog = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import pinClip from '@/components/pinClip.vue';
import ImportDataExpansion from '@/components/ImportDataExpansion.vue';
import axios from 'axios';

export default {
  components: {
    pinClip,
    ImportDataExpansion,
  },
  props: ['type'],
  data() {
    return {
      currentId: '',
      switch1: true,
      dialog: false,
      color: '',
      clipData: '',
      loading: false,
      result:'',
      clipResult:'',
      cliplistString: '',
      pinnedClipslist:[],
      importLoading: false,
    };
  },
  methods: {
    initailize(el){
      if(el === 'success'){
        this.dialog = false;
        this.clipData = '';
      }
    },
    async addCliplist(){
      await this.$store.commit('SET_newCliplist',this.result);
      if(this.$store.state.snackbar.type === 'error'){
        this.dialog = true;
        }else{
        this.dialog = false;
      }
    },
    changeId(el) {
      this.currentId = el;
    },
    async getCliplist(el) {
      this.importLoading = true;
      this.result = '';
      let tempData;
      if(el){
        const fireData = await this.$firestore.collection('cliplist').doc(el).get();
        if(fireData.exists){
          tempData = fireData.data();
          await this.getClip(tempData.pinnedClips);
          this.result = {
            id: tempData.id,
            title: tempData.title,
            color: tempData.color,
            pinnedClips: this.pinnedClipslist
          };
          console.log(this.result);
          this.importLoading = false;
        } else {
          this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : Data가 없습니다.`, value: true });
          this.importLoading = false;
        }
      } else{
        this.importLoading = false;
        this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : Import String이 올바르지 않습니다.`, value: true });
      }
    },

    async getClip(el) {
      await axios.get('https://api.twitch.tv/helix/clips', {
        headers: this.$store.state.headerConfig,
        params: {
          id: el,
        },
      }).then((res) => {
        if(res.data.data.length > 1){
          this.pinnedClipslist = res.data.data;
        } else if(res.data.data.length === 1){
          this.clipResult = res.data.data['0'];
        } else {
           this.$store.commit('SET_SnackBar', { type: 'error', text: `Import : 클립을 가져올 수 없습니다.`, value: true });
        }
        this.loading = false;
      });
    },
     setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
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
.left-element{
    visibility: hidden;
    margin-right: auto;
    width: 200px;
}
.right-element{
  margin-left: auto;
  width: 200px;

}
.v-text-field{
  width: 500px;
}

</style>
