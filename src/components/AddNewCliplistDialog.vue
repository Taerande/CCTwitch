<template>
<v-dialog
  v-model="dialog"
  max-height="600"
  max-width="290">
  <template v-slot:activator="{ on, attrs }">
    <v-btn
      v-if="type.data === 'button'"
      class="text-caption"
      color="success"
      v-bind="attrs"
      v-on="on"
    >
    Add New List
    </v-btn>
    <div class="d-flex align-center py-2"
    v-else-if="type.data === 'pin'"
    v-bind="attrs"
    v-on="on"
      >
      <div
      class="twitch cliplist-canvas d-flex justify-center align-center">
        <v-icon large>mdi-plus</v-icon>
      </div>
      <span class="pl-2">
        새 플레이 리스트 추가
      </span>
    </div>
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
  props: ['type'],
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
