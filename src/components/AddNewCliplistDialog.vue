<template>
<v-dialog
  v-model="dialog"
  max-width="290">
  <template v-slot:activator="{ on, attrs }">
    <v-btn
      class="text-caption"
      color="success"
      v-bind="attrs"
      v-on="on"
    >
    Add New List
    </v-btn>
  </template>
  <v-card class="justify-center">
    <v-card-title class="text-h5">
      Add New Clip List
    </v-card-title>
    <v-card-text class="d-flex justify-center">
      <div>
      <v-color-picker hide-canvas hide-inputs v-model="color"></v-color-picker>
        <v-text-field
          v-model="titleValue"
          outlined
          class="pt-5"
          counter
          maxlength="20"
          filled
          flat
          :rules="[rules.required, rules.counter]"
          color="white"
          multi-line
          placeholder="Title (최대 20자)"
        ></v-text-field>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="green darken-1"
        text
        :disabled="titleValue === ''"
        @click="dialog = false,  $store.commit('SET_newCliplist',{
          title: titleValue,
          color: color
        }), titleValue = ''"
      >
        Add
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
export default {
  data() {
    return {
      dialog: false,
      color: '',
      titleValue: '',
      rules: {
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 20 || 'Max 20 characters',
      },

    };
  },
  methods: {
  },

};
</script>
<style lang="scss" scoped>
</style>
