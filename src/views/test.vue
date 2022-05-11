<template>
<v-container fluid fill-height>
  <v-row>
    <liked></liked>
  </v-row>
  <v-row class="d-block">
    <draggable
    v-model="items" handle=".handle" ghost-class="ghost" chosen-class="chosen" drag-class="drag">
      <transition-group>
      <v-col cols="12" class="pa-5" v-for=" (i) in items" :key="i">
      <v-card>
        <v-card-title class="info">
          <div>
            <v-icon large class="handle">mdi-drag-horizontal-variant</v-icon>
          </div>
          {{i}}
        </v-card-title>
        <v-card-text>
          <div>
            This is For text {{i}}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="success">ok</v-btn>
          <v-btn color="error">close</v-btn>
        </v-card-actions>
      </v-card>
      </v-col>
      </transition-group>
    </draggable>
  </v-row>

</v-container>
</template>
<script>
import draggable from 'vuedraggable'
import Liked from '../components/Streamer/Liked.vue';
export default {
  components:{
    draggable,
    Liked
},
  data(){
    return{
      items : [1,2,3]
    }
  },
  methods:{
    getDrag(){
      return document.getElementsByClassName('chosen')[0];
    }
  },

}
</script>
<style lang="scss" scoped>
.handle{
  cursor: grab;
}
.ghost {
  opacity: 0 !important;
  background: green;
}
.chosen {
  opacity: 0 !important;
  background: blue;
}
.drag {
  opacity: 0 !important;
  background: red;
}

</style>
