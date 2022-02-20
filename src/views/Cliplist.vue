<template>
<v-container fluid>
  <v-row class="d-flex align-center pt-5">
     <v-col>
      <h1>My Cliplists</h1>
    </v-col>
    <v-col class="d-flex justify-end align-center">
      <AddNewCliplistDialog></AddNewCliplistDialog>
    </v-col>
  </v-row>
  <v-row class="d-flex">
    <v-col class="custom5cols pa-3" v-for="(item, index) in $store.state.cliplist" :key="index">
      <div class="cliplist-canvas" :style="{background: item.color}">
        <div class="text-h5 pa-5 overflow-x-hidden">
        #{{index+1}}  {{item.title}}
        </div>
        <div class="text-caption pa-5">
          {{item.pinnedClips.length}}개의 클립
        </div>
        <div>
          <v-icon @click="$store.commit('DELETE_newCliplist',{index: index, title:item.title})">mdi-trash-can</v-icon>
          <v-icon>mdi-clipboard-multiple-outline</v-icon>
        </div>
      </div>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/AddNewCliplistDialog.vue';

export default {
  components: {
    AddNewCliplistDialog,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
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
  opacity: 0.7 !important;
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
</style>
