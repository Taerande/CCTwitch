<template>
<v-container fluid>
  <v-row class="pt-5 justify-center align-baseline">
    <div class="py-3">
      <span class="text-h3 font-weight-bold pr-3">My Cliplists</span>
    </div>
    <v-spacer></v-spacer>
    <div>
      <AddNewCliplistDialog :type="{type:'add'}"></AddNewCliplistDialog>
    </div>
  </v-row>
  <v-row class="d-flex pt-10" v-if="cliplist.length > 0">
    <v-col
     cols="12" xl="2" lg="3" md="4" sm="6" xs="12"
     class="pa-3" v-for="(item, listIndex) in cliplist" :key="listIndex">
      <v-card class="cliplist-canvas" outlined :color="item.color" @click="setData(item)">
        <v-card-title class="justify-center">
          <span class="text-h6 pa-5 text-truncate">
            {{item.title}}
          </span>
          <v-spacer></v-spacer>
          <v-icon :color="item.isPublic ? 'info' : 'red'">{{item.isPublic ? 'mdi-earth' : 'mdi-lock'}}</v-icon>
        </v-card-title>
        <v-card-text class="text-center text-h4 text-truncate">
          <v-row class="text-caption">
            {{item.cliplist.length}}개의 클립
          </v-row>
          <div>
            {{item.description}}
          </div>
        </v-card-text>
        <v-card-text>
         <div class="text-caption pa-5">
          </div>
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else class="d-flex justify-center align-center" style="height:60vh;">
    <h1>😥There is no cliplist</h1>
  </v-row>
  <v-row><v-btn color="success" @click="sorting">sort</v-btn></v-row>
</v-container>
</template>

<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog';

export default {
  components: {
    AddNewCliplistDialog,
  },
  data() {
    return {
      cliplist: [],
      loading: false,
      unsubscribe: null,
    };
  },
  methods: {
    sorting(){
       this.cliplist.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    setData(el) {
      // await this.$store.commit('SET_currCliplist', {data:el});
      this.$router.push({ path: `clip/${el.id}`});
      // if (this.$store.state.currentCliplist.id === el.id) {
      //   await this.$store.commit('INIT_currCliplist');
      // } else {
      //   await this.$store.commit('SET_currCliplist', { data: el, type: 'info', text: `Cliplist : ${el.title}를 표시합니다.` });
      // }
    },

  },
  async created() {
    console.log(this.$store.state.userInfo);
    this.unsubscribe = await this.$firestore.collection('cliplist').where('authorId','==',this.$store.state.userInfo.uid).onSnapshot((sn) => {
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
          isPublic: item.isPublic,
          color: item.color,
          cliplist: item.cliplist,
        }
      })
    });
  },
  mounted() {
  },
  destroyed() {
    if(this.unsubscribe) this.unsubscribe()
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
