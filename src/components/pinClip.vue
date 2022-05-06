<template>
  <v-dialog
  v-if="$store.state.userinfo.userInfo"
  v-model="dialog"
  scrollable
  width="400px">
    <template v-slot:activator="{on, attrs}">
      <v-list-item
      v-on="on"
      v-bind="attrs"
      v-if="clipType === 'menu'">
        <v-icon>mdi-pin-outline</v-icon>
        <span class="text-caption pl-1">클립 추가</span>
      </v-list-item>
      <v-btn
        v-else
        v-on="on"
        v-bind="attrs"
        icon>
        <v-icon size="20" color="red">mdi-pin</v-icon>
      </v-btn>
    </template>
    <v-card width="400px" height="600px">
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
          <v-list-item :disabled="item.cliplist.length >= 100" @click="addNewClip(item, index)" class="pa-1" v-for="(item,index) in cliplist" :key="index">
              <div class="cliplist-canvas" :style="{background: item.color}"></div>
              <v-list-item-content>
                <v-list-item-title class="text-title">{{item.title}}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{item.cliplist.length}}개</v-list-item-subtitle>
              </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="d-flex justify-end pa-3">
        <v-spacer></v-spacer>
        <v-btn depressed @click="dialog = false">
          <span class="error--text text-break">Close</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <SignInDialogVue v-else :type="{parent:'pinclip'}"></SignInDialogVue>
</template>
<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';
import SignInDialogVue from './dialog/SignInDialog.vue';

export default {
  props:['clipData'],
  components: {
    AddNewCliplistDialog,
    SignInDialogVue,
  },
  data() {
    return {
      cliplist:[],
      unsubscribe: null,
      dialog: false,
    };
  },
  methods: {
    async addNewClip(el, index){
      //중복체크
      const isInvolved =  this.cliplist[index].cliplist.find((element) => this.clipData.data.id === element);
      if(isInvolved){
         this.$store.commit('SET_SnackBar',{type:'error', text:`${this.clipData.data.title}은 이미 있습니다.`, value:true})
      } else {
        let target = this.$firestore.collection('cliplist').doc(el.id);
        target.update({
          cliplist: this.$firebase.firestore.FieldValue.arrayUnion(this.clipData.data.id)
        }).then(() => {
          this.$store.commit('SET_SnackBar',{type:'success', text:`${this.clipData.data.title}을 추가했습니다.`, value:true})
        })
      }
    }

  },
  async created() {
    if(this.$store.state.userinfo.userInfo){
      this.unsubscribe = await this.$firestore.collection('cliplist').where('authorId','==',this.$store.state.userinfo.userInfo.uid).onSnapshot((sn) => {
        if(sn.empty){
          this.cliplist = []
          return
        }
        this.cliplist = sn.docs.map( v => {
          const item = v.data()
          return {
            id: v.id,
            title: item.title,
            description: item.description,
            createdAt: item.createdAt,
            color: item.color,
            cliplist: item.cliplist,
          }
        })
      });
    }
  },
  computed:{
    clipType(){
      return this.clipData.type;
    }
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
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
i.v-icon.v-icon {
  border-radius: 100%;
  background: rgb(0, 0, 0, 0.3);
}
</style>
