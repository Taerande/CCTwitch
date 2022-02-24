<template>
<v-dialog
  no-click-animation
  v-model="dialog"
  max-width="500">
  <template v-slot:activator="{ on, attrs }">
    <div
    v-bind="attrs"
    v-on="on">
      <v-btn
      icon>
      <v-icon>mdi-trash-can</v-icon>
      </v-btn>
    </div>
  </template>
  <v-card class="justify-center">
    <v-card-title class="text-h5 error text-uppercase">
      <span>DELETE {{this.delete.type}}</span>
    </v-card-title>
    <v-card-text class="d-flex align-center justify-center pt-5">
      <span class="text-uppercase">{{this.delete.type}} : </span>
      <span class="twitch--text pl-1 text-title">
        {{this.delete.data.target.title.length > 25 ? `${this.delete.data.target.title.substr(0, 24)}...` : this.delete.data.target.title}}</span>
        <span class="red--text" v-if="this.delete.type === 'cliplist'">[{{this.delete.data.target.pinnedClips.length}}개]</span>
      <span>을 삭제하시겠습니까?</span>
    </v-card-text>
    <v-card-actions class="pb-3 pt-0">
      <v-spacer></v-spacer>
      <v-btn text class="error" @click="dialog = !dialog">Cancel</v-btn>
      <v-btn :loading="false" text class="success" @click="btnLoading = true, DeleteData(curType, curData)">OK</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
export default {
  props: ['delete'],
  data() {
    return {
      dialog: false,
      btnLoading: false,
      curData: this.delete.data,
      curType: this.delete.type,
    };
  },
  methods: {
    async DeleteData(type, data) {
      if (type === 'clip') {
        await this.$store.commit('DELETE_clip', data);
        this.btnLoading = false;
        this.dialog = false;
      } else if (type === 'cliplist') {
        await this.$store.commit('DELETE_cliplist', data);
        this.btnLoading = false;
        this.dialog = false;
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
  cursor: pointer;
  background-color: rgb(0, 0, 0, 0.2) !important;
}
</style>
