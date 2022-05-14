<template>
  <v-dialog
  v-model="dialog"
  scrollable
  width="400px">
    <template v-slot:activator="{on, attrs}">
      <v-list-item
      v-on="on"
      v-bind="attrs"
      v-if="clipType === 'menu'">
        <v-icon>mdi-plus-box-multiple-outline</v-icon>
        <span class="text-caption pl-1">클립 추가</span>
      </v-list-item>
      <v-btn
        v-else
        v-on="on"
        v-bind="attrs"
        icon>
        <v-icon class="pinClip" color="red">mdi-plus-box-multiple</v-icon>
      </v-btn>
    </template>
    <v-card width="400px" height="600px" :loading="loading" :disabled="loading">
      <v-card-title class="d-flex justify-center">
        <span>내 플레이리스트에 추가</span>
      </v-card-title>
      <v-card-subtitle class="d-flex justify-center pt-2 text-caption">
        리스트당 최대 100개의 클립을 기록할 수 있습니다.
      </v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <v-list class="pt-5">
            <AddNewCliplistDialog :type="{type:'pin',data:{text: 'Add New List'}}"></AddNewCliplistDialog>
          <v-list-item :disabled="item.clipCount >= 100 || item.clipIds.some(e => e === clipData.data.id)" @click="addNewClip(item, index)" class="pa-1" v-for="(item,index) in listData" :key="index">
              <div class="cliplist-canvas" :style="{background: item.color}"></div>
              <v-list-item-content>
                <v-list-item-title class="text-title">{{item.title}}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{item.clipCount || 0}}개</v-list-item-subtitle>
              </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="d-flex justify-end pa-3">
        <v-spacer></v-spacer>
        <v-btn text @click="dialog = false">
          <span class="error--text text-break">Close</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';

export default {
  props:['clipData','listData'],
  components: {
    AddNewCliplistDialog,
  },
  data() {
    return {
      cliplist:[],
      dialog: false,
      loading: false
    };
  },
  methods: {
    async addNewClip(el, index){
      this.loading = true
      let batch = await this.$firestore.batch();
      let target = await this.$firestore.collection('cliplist').doc(el.id);
      const inputData = {
        clipId: this.clipData.data.id,
        thumbnail_url: this.clipData.data.thumbnail_url,
        createdAt: parseInt(new Date().getTime())
      }
      //중복체크
      const isIn = this.listData[index].clipIds.some( e => e === this.clipData.data.id);
      const clipCount = this.listData[index].clipCount;
      //batch write

      if(!isIn){
          batch.set(target.collection('clips').doc(this.clipData.data.id),inputData)
          batch.update(target, clipCount === 0 ? {
            thumbnail_url: inputData.thumbnail_url,
            clipCount: this.$firebase.firestore.FieldValue.increment(1),
            clipIds: this.$firebase.firestore.FieldValue.arrayUnion(this.clipData.data.id)
          } : {
            clipCount: this.$firebase.firestore.FieldValue.increment(1),
            clipIds: this.$firebase.firestore.FieldValue.arrayUnion(this.clipData.data.id)
          });
          await batch.commit().then(() => {
            this.$store.commit('SET_SnackBar',{type:'success', text:`${this.clipData.data.title}을 추가했습니다.`, value:true})
          }).catch((err) => {
            this.$store.commit('SET_SnackBar',{type:'error', text:`${err.message}입력 데이터가 잘못 되었습니다.`, value:true})
          });
        } else {
          this.$store.commit('SET_SnackBar',{type:'error', text:`${this.clipData.data.title}은 이미 있습니다.`, value:true})
        }
      this.loading = false;
    },
  },
  async created() {

  },
  computed:{
    clipType(){
      return this.clipData.type;
    }
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
div[role=menuitem]:hover{
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.2) !important;
}
// .pinClip {
//   transform: scale();
//   border-radius: 100%;
//   background: rgb(0, 0, 0, 0.3);
// }
</style>
