<template>
 <v-dialog
  max-width="300"
  v-model="dialog">
    <template  v-slot:activator="{ on, attrs }">
      <v-btn icon v-on="on" v-bind="attrs">
        <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="error">Delete Liked</v-card-title>
      <v-card-text class="d-flex align-center justify-center pt-5">
        <span class="text-h6 font-weight-black twitch--text">{{liked.data.display_name}}</span>
        <span class="">을 liked에서 지웁니다.</span>
        </v-card-text>
      <v-card-actions class="ma-0 pa-3">
        <v-spacer></v-spacer>
        <v-btn color="error" @click="dialog = false">close</v-btn>
        <v-btn color="success" @click="deleteFav({index:liked.index, display_name: liked.data.display_name})">ok</v-btn>
      </v-card-actions>
    </v-card>
</v-dialog>
</template>
<script>
export default {
  props: ['liked'],
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    async deleteFav(el) {
      await this.$store.commit('DELETE_LikedStreamer', el);
      this.dialog = false;
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
