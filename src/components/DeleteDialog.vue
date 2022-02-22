<template>
<v-dialog
  persistent
  no-click-animation
  v-model="dialog"
  max-width="500">
  <template v-slot:activator="{ on, attrs }">
    <div
    v-if="type.type === 'clip' || type.type === 'cliplist'"
    v-bind="attrs"
    v-on="on">
      <v-btn
      icon>
      <v-icon>mdi-trash-can</v-icon>
      </v-btn>
    </div>
  </template>
  <v-card v-if="type.type === 'clip'" class="justify-center">
    <v-card-title class="text-h5 error">
      DELETE Clip
    </v-card-title>
    <v-card-text class="d-flex align-center justify-center pt-5">
      <span>Clip : </span>
      <span class="twitch--text px-1">{{type.title}}</span>
      <span>을 삭제하시겠습니까?</span>
    </v-card-text>
    <v-card-actions class="pb-3 pt-0">
      <v-spacer></v-spacer>
      <v-btn text class="error" @click="dialog = !dialog">Cancel</v-btn>
      <v-btn text class="success" @click="deleteClip({title:type.title, clipIndex:type.clipIndex, listIndex: type.listIndex})">OK</v-btn>
    </v-card-actions>
  </v-card>
  <v-card v-if="type.type === 'cliplist'">
    <v-card-title class="text-h5 error">
      DELETE Cliplist
    </v-card-title>
    <v-card-text class="pt-5">
      <div class="d-flex justify-center align-center text-weight-bold" v-if="$store.state.cliplist[type.index].pinnedClips.length">
        <span class="red--text text-h6 px-1">{{$store.state.cliplist[type.index].pinnedClips.length}}</span>
        <span>개의 클립이 있습니다.</span>
      </div>
      <div class="d-flex justify-center align-center">
        <span>Cliplist :</span>
        <span class="text-h6 px-1" :style="{color: type.color}">{{type.title}}</span>
        <span>을 삭제하시겠습니까?</span>
      </div>
    </v-card-text>
    <v-card-actions class="pb-3 pt-0">
      <v-spacer></v-spacer>
      <v-btn text class="error" @click="dialog = !dialog">Cancel</v-btn>
      <v-btn text class="success" @click="deleteClipList({title:type.title, index:type.index})">OK</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
export default {
  props: ['type'],
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    async deleteClip(el) {
      await this.$store.commit('DELETE_Clip', el);
      this.dialog = !this.dialog;
    },
    async deleteClipList(el) {
      await this.$store.commit('DELETE_newCliplist', el);
      this.dialog = !this.dialog;
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
</style>
