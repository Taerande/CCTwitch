<template>
<v-container fluid>
  <v-row class="d-flex align-center pt-5">
     <v-col>
      <h1>My Cliplists</h1>
    </v-col>
    <v-col class="d-flex justify-end align-center">
      <ImportNewClipDialog></ImportNewClipDialog>
      <AddNewCliplistDialog :type="{type:'add', data:{
        text: 'Add New Cliplist'
      }}"></AddNewCliplistDialog>
    </v-col>
  </v-row>
  <expandTable></expandTable>
  <v-row class="d-flex pt-10" v-if="$store.state.cliplist.length">
    <v-col class="custom5cols pa-3" v-for="(item, listIndex) in $store.state.cliplist" :key="listIndex">
      <div @click="setData(item)" class="cliplist-canvas" :style="{background: item.color, opacity: $store.state.currentCliplist.id === item.id ? '1 !important' : ''}">
        <div class="text-h5 pa-5 text-truncate">
        #{{listIndex+1}}  {{item.title}}
        </div>
        <div class="text-caption pa-5">
          {{item.pinnedClips.length}}개의 클립
        </div>
      </div>
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
import expandTable from '@/components/cliplist/expandTable.vue';

export default {
  components: {
    expandTable,
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
      if (this.$store.state.currentCliplist.id === undefined) {
        await this.$store.commit('INIT_currCliplist');
        this.$store.commit('SET_currCliplist', { data: el, type: 'info', text: `Cliplist : ${el.title}를 표시합니다.` });
      } else {
        await this.$store.commit('INIT_currCliplist');
        this.$store.commit('SET_currCliplist', { data: '', type: 'info', text: `Cliplist : ${el.title}를 숨깁니다.` });
      }
    },

  },

  created() {
  },
};
</script>
<style lang="scss" scoped>

.cliplist-canvas{
  cursor: pointer;
  border-radius: 5%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  width: 200px;
  height: 200px;
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
  width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}

div[role="progressbar"]{
  position: relative;
  left: 50%;
  top: 10%;
  transform: translateX(-50%);
}
</style>
