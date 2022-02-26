<template>
  <div>
    <v-dialog
    scrollable
    width="400px">
      <template v-slot:activator="{on, attrs}">
        <v-btn
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
          리스트당 최대 30개의 클립을 기록할 수 있습니다.
        </v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text>
          <v-list class="pt-5">
              <AddNewCliplistDialog :type="{type:'pin',data:{text: 'Add New List'}}"></AddNewCliplistDialog>
            <v-list-item :disabled="item.pinnedClips.length >= 30" @click="$store.commit('ADD_pinnedClip',{data: clipData, listIndex:index})" class="pa-1" v-for="(item,index) in $store.state.cliplist" :key="index">
                <div class="cliplist-canvas" :style="{background: item.color}"></div>
                <v-list-item-content>
                  <v-list-item-title class="text-title">{{item.title}}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{item.pinnedClips.length}}개</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

    </v-dialog>
  </div>
</template>
<script>
import AddNewCliplistDialog from '@/components/dialog/AddNewCliplistDialog.vue';

export default {
  props: ['clipData'],
  components: {
    AddNewCliplistDialog,
  },
  data() {
    return {

    };
  },
  methods: {

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
