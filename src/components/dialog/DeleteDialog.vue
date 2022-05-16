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
        <span class="text-uppercase" style="width:25rem;">
          {{this.delete.type}}
        </span>: {{this.delete.data.target.title}}</span>
        <span v-if="this.delete.type === 'cliplist'">[<span class="red--text">{{this.delete.data.target.clipCount}}</span>]개 을 삭제합니다.</span>
      <!-- <div>{{this.delete.data.target}}</div>
      <div>{{this.$router.params}}</div> -->
    </v-card-text>
    <v-card-actions class="pb-3 pt-0">
      <v-spacer></v-spacer>
      <v-btn text class="error" @click="dialog = !dialog">Cancel</v-btn>
      <v-btn :loading="btnLoading" text class="success" @click="btnLoading = true, DeleteData(curType, curData)">OK</v-btn>
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
        const index = this.$store.state.currentCliplist.findIndex( (element) => element.clipData.id === data.target.id);
        let batch = this.$firestore.batch();
        let target = this.$firestore.collection('cliplist').doc(data.belongsTo);
        batch.delete(target.collection('clips').doc(data.target.id))
        batch.update(target, index === 0 ?
          {
            clipIds: this.$firebase.firestore.FieldValue.arrayRemove(data.target.id),
            clipCount: this.$firebase.firestore.FieldValue.increment(-1),
            thumbnail_url: this.$store.state.currentCliplist[1].fireData.thumbnail_url} :
          {
            clipIds: this.$firebase.firestore.FieldValue.arrayRemove(data.target.id),
            clipCount: this.$firebase.firestore.FieldValue.increment(-1)
          })
        await batch.commit().then( () => {
          this.$store.commit('DELETE_Clip',data.target.id);
          this.btnLoading = false;
          this.dialog = false;
          this.$emit('closeMenu');
          this.$store.commit('SET_SnackBar', {type:'error', text:`Clip : ${data.target.title}을 삭제하였습니다.`, value:true});
        }).catch((e) => console.error(e.message));

      } else if (type === 'cliplist') {
        // await this.$firestore.collection('')
        this.$emit('DeleteCliplist');
        // await this.$store.commit('DELETE_cliplist', data);
        this.btnLoading = false;
        this.dialog = false;
        this.$router.push({ path: '/mycliplist' });
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
