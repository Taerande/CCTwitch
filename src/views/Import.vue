<template>
  <v-container fill-height class="align-start">
    <v-progress-circular class="ma-auto" v-if="importLoading" size="100" width="8" color="twitch" indeterminate></v-progress-circular>
    <ImportExpandTable :result="result" v-else></ImportExpandTable>
  </v-container>
</template>
<script>
import axios from 'axios';
import ImportExpandTable from '@/components/cliplist/ImportExpandTable.vue';

export default {
  components:{
    ImportExpandTable
  },
  data() {
    return {
      importLoading: true,
      pinnedClipslist:'',
      result:'',
    }
  },
  methods:{
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
          this.importLoading = false;
        }
      });
    },
    async postProcess(){
      await this.getCliplist(this.$route.params.id);

    }
  },
  created(){
    this.postProcess();
  }

};
</script>

<style lang="">

</style>
