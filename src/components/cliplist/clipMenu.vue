<template>
<v-menu
v-if="$store.state.userinfo.userInfo"
:nudge-left="this.$vuetify.breakpoint.xs ? '140' : '0'"
offset-x>
  <template v-slot:activator="{on, attrs}">
    <v-btn v-bind="attrs" v-on="on" icon>
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
  </template>
  <v-list>
    <v-list-item @click="copyClip(clip.clipData)">
      <v-icon>mdi-clipboard-multiple-outline</v-icon>
      <span class="text-caption pl-1">URL 복사</span>
    </v-list-item>
    <pinClipVue
      v-if="$store.state.userinfo.userInfo"
      :clipData="{data:clip.clipData, type:'menu'}"></pinClipVue>
    <DeleteDialog
      v-if="clip.listData.authorId === $store.state.userinfo.userInfo.uid"
      :delete="{type:'clip', data:{target: clip.clipData, belongsTo: clip.listData.id}}">
    </DeleteDialog>
    <v-list-item @click="downloadClip(clip.clipData)">
      <v-icon>mdi-download</v-icon>
      <span class="text-caption pl-1">클립 저장</span>
    </v-list-item>
  </v-list>
</v-menu>
<v-icon v-else>mdi-lock</v-icon>
</template>
<script>
import DeleteDialog from '@/components/dialog/DeleteDialog.vue';
import pinClipVue from '../pinClip.vue';

export default {
  props: ['clip'],
  components: {
    DeleteDialog,
    pinClipVue,
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
    downloadClip(el) {
      let target = `${el.thumbnail_url.split('-preview')[0]}.mp4`;
      let a = document.createElement('A');
      a.href = target;
      a.download = target.substr(target.lastIndexOf('/') + 1);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  },
  created() {
  },

};
</script>
<style lang="scss" scoped>

</style>
