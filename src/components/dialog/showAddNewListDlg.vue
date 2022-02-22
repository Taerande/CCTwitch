<template>
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
      <div>
        {{$store.state.likedStreamer}}
      </div>
      <div>
        {{color}} // {{titleValue}}
      </div>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions>
      <v-btn
        color="green darken-1"
        text
        :disabled="titleValue === ''"
      >
        Add
      </v-btn>
    </v-card-actions>
  </v-card>
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
  created() {
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
