<template>
<v-container fluid>
  <router-view></router-view>
</v-container>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
    };
  },
  methods: {
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
