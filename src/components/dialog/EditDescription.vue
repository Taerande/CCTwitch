<template>
<v-dialog
  no-click-animation
  v-model="dialog"
  max-width="500">
  <template v-slot:activator="{ on, attrs }">
    <v-list-item
    v-bind="attrs"
    v-on="on">
      <v-icon>mdi-note-edit-outline</v-icon>
      <span class="text-caption pl-1">메모</span>
    </v-list-item>
  </template>
  <v-card class="justify-center">
    <v-card-title class="text-h5 info text-uppercase">
      <span>edit {{this.edit.type}}</span>
    </v-card-title>
    <v-card-text class="d-flex align-center justify-center pt-5">
       <v-textarea
          v-model="description"
          filled
          auto-grow
          counter
          maxlength="100"
          :rules="[rules.counter]"
          color="twitch"
          name="input-7-4"
          :placeholder="this.edit.data.description"
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
  props: ['edit'],
  data() {
    return {
      description: '',
      dialog: false,
      btnLoading: false,
      rules: {
        counter: (value) => value.length <= 100 || 'Max 100 characters',
      },
    }
  },
  methods: {
    async updateDescription() {
      await this.$store.commit('UPDATE_clipDescription', { target: this.edit.data, data: this.description });
      this.dialog = false;
    },
  },
  mounted() {
    this.description = this.edit.data.description;
  }
};
</script>
<style lang="scss" scoped>

</style>
