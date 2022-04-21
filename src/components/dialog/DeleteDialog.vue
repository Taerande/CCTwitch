<template>
<v-dialog
  no-click-animation
  v-model="dialog"
  max-width="500">
  <template v-slot:activator="{ on, attrs }">
    <v-list-item
    v-bind="attrs"
    v-on="on"
    v-if="deleteDefaultData.type === 'clip'">
      <v-icon>mdi-delete-outline</v-icon>
      <span class="text-caption pl-1">클립 삭제</span>
    </v-list-item>
    <v-btn
    v-else
    v-bind="attrs"
    v-on="on"
    icon>
      <v-icon>mdi-delete-outline</v-icon>
    </v-btn>
  </template>
  <v-card class="justify-center">
    <v-card-title class="text-h5 error text-uppercase">
      <span>DELETE {{this.delete.type}}</span>
    </v-card-title>
    <v-card-text class="d-flex align-center justify-center pt-5">
      <span class="twitch--text pl-1 text-title text-truncate">
        {{this.delete.data.target.title.length > 25 ? `${this.delete.data.target.title.substr(0, 24)}...` : this.delete.data.target.title}}</span>
        <span class="red--text" v-if="this.delete.type === 'cliplist'">[{{this.delete.data.target.cliplist.length}}개]</span>
      <div class="pl-1">을 삭제합니다.</div>
      <div>{{this.delete.data.target}}</div>
      <div>{{this.$router.params}}</div>
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
  props: {
    delete: {
      type: Object,
    },
  },
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
        // await this.$firestore.collection('')
        this.$emit('DeleteCliplist');
        // await this.$store.commit('DELETE_cliplist', data);
        this.btnLoading = false;
        this.dialog = false;
        this.$router.push({ path: '/cliplist' });
      } else if (type === 'importedClip') {
        this.$emit('delImportedClip', { index: this.delete.data.index, title: this.delete.data.target.title });
      }
    },
  },
  computed: {
    deleteDefaultData() {
      return this.delete;
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
