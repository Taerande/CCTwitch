<template>
<v-container fluid>
  <v-row class="pt-5 justify-center align-baseline">
    <div class="py-3">
      <span class="text-h3 font-weight-bold pr-3">My Cliplists</span>
      <span class="text-subtitle-1" :class="$store.state.cliplist.length === 20 ? 'red--text' : ''">{{$store.state.cliplist.length}} / 20</span>
    </div>
    <v-spacer v-if="!$vuetify.breakpoint.smAndDown"></v-spacer>
    <div>
      <ImportNewClipDialog></ImportNewClipDialog>
      <AddNewCliplistDialog :type="{type:'add', data:{
        text: 'Add New Cliplist'
      }}"></AddNewCliplistDialog>
    </div>
  </v-row>
  <v-row class="d-flex pt-10" v-if="$store.state.cliplist.length">
    <v-col
     cols="12" xl="2" lg="3" md="4" sm="6" xs="12"
     class="pa-3" v-for="(item, listIndex) in $store.state.cliplist" :key="listIndex">
      <v-card class="cliplist-canvas" :color="item.color" @click="setData(item)">
        <v-card-title>
        <div class="text-h5 pa-5 text-truncate">
        #{{listIndex+1}}  {{item.title}}
        </div>
        </v-card-title>
        <v-card-text class="text-center text-h4 text-truncate">
          {{item.description}}
        </v-card-text>
        <v-card-text>
         <div class="text-caption pa-5">
            {{item.pinnedClips.length}}개의 클립
          </div>
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else class="d-flex justify-center align-center" style="height:60vh;">
    <h1>😥There is no cliplist</h1>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';
import ImportNewClipDialog from '@/components/dialog/ImportNewClipDialog.vue';

export default {
  components: {
    AddNewCliplistDialog,
    ImportNewClipDialog,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async setData(el) {
      await this.$store.commit('SET_currCliplist', {data:el});
      this.$router.push({ path: `clip/${el.id}`});
      // if (this.$store.state.currentCliplist.id === el.id) {
      //   await this.$store.commit('INIT_currCliplist');
      // } else {
      //   await this.$store.commit('SET_currCliplist', { data: el, type: 'info', text: `Cliplist : ${el.title}를 표시합니다.` });
      // }
    },

  },

  created() {
  },
};
</script>
<style lang="scss" scoped>

.cliplist-canvas{
  cursor: pointer;
  border-radius: 3%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  opacity: 0.5 !important;
  border: 1px ;
}
.cliplist-canvas:hover{
  transform: scale(1.05) !important;
  opacity: 1 !important;
  transition: all 0.1s;
  transition-timing-function: ease;
}
.custom5cols {
  // width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}

//  <v-col
//       cols="12" lg="3" md="4" sm="6" xs="12"
//       v-for="clip in setCurrList($store.state.currentCliplist.pinnedClips)" :key="clip.id">
//         <v-card>
//           <v-card-title class="d-flex justify-space-between">
//             <div>
//               <span class="text-truncate">{{clip.title}}</span>
//               <clipMenuVue :clip="clip"></clipMenuVue>
//             </div>
//           </v-card-title>
//           <v-card-text>
//             <div>
//               <v-img
//               :src="clip.thumbnail_url">
//               </v-img>
//             </div>
//             {{clip.description}}
//           </v-card-text>
//         </v-card>

//       </v-col>

</style>
