<template>
<v-menu offset-x>
  <template v-slot:activator="{on, attrs}">
    <v-btn v-bind="attrs" v-on="on" icon>
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
  </template>
  <v-list>
    <EditDescriptionVue :edit="{type:'clip', data:clip}"></EditDescriptionVue>
    <v-list-item @click="copyClip(clip)">
      <v-icon>mdi-clipboard-multiple-outline</v-icon>
      <span class="text-caption pl-1">URL 복사</span>
    </v-list-item>
    <pinClipVue :clipData="{data:clip, type:'menu'}"></pinClipVue>
    <DeleteDialog
      :delete="{type:'clip', data:{target: clip, belongsTo: $store.state.currentCliplist,}}">
    </DeleteDialog>
  </v-list>
</v-menu>
</template>
<script>
import DeleteDialog from '@/components/dialog/DeleteDialog.vue';
import pinClipVue from '../pinClip.vue';
import EditDescriptionVue from '../dialog/EditDescription.vue';

export default {
  props:['clip'],
  components:{
    DeleteDialog,
    pinClipVue,
    EditDescriptionVue
  },
  methods: {
    copyClip(el) {
      const tempArea = document.createElement('textarea');
      document.body.appendChild(tempArea);
      tempArea.value = el.url;
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
      this.$store.commit('SET_SnackBar', { type: 'success', text: `Clip URL : ${el.title} 가 복사되었습니다.`, value: true });
    },
  },

}
</script>
<style lang="scss" scoped>

</style>
