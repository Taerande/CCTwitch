<template>
<v-dialog
  no-click-animation
  v-model="dialog"
  max-width="500">
  <template v-slot:activator="{ on, attrs }">
    <v-btn icon
    v-bind="attrs"
    v-on="on">
      <v-icon>mdi-note-plus-outline</v-icon>
    </v-btn>
  </template>
  <v-card class="justify-center">
    <v-card-title class="text-h5 info text-uppercase">
      <span>Add New Description</span>
    </v-card-title>
    <v-card-text class="d-flex align-center justify-center pt-5">
       <v-textarea
          v-model="description"
          filled
          auto-grow
          color="twitch"
          name="input-7-4"
          label="Write down description."
        ></v-textarea>
    </v-card-text>
    <v-card-actions class="pb-3 pt-0">
      <v-spacer></v-spacer>
      <v-btn class="error" text @click="dialog = !dialog">Cancel</v-btn>
      <v-btn class="success" text @click="updateDescription">OK</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
export default {
  props:['targetIndex'],
  data() {
    return {
      description: '',
      dialog: false,
    };
  },
  methods: {
   async updateDescription() {
      await this.$store.commit('UPDATE_importClip',{
        index: this.targetIndex,
        description: this.description,
        });
      this.dialog = false;
    },
  },
  mounted() {
  },

};
</script>
<style lang="scss" scoped>

</style>
