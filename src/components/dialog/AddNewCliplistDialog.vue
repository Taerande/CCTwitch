<template>
<v-dialog
  v-model="dialog"
  max-width="800">
  <template v-slot:activator="{ on, attrs }">
    <v-btn
      text
      outlined
      v-if="type.type === 'add'"
      class="text-caption"
      color="success"
      v-bind="attrs"
      v-on="on"
      :disabled="$store.state.cliplist.length >= 20"
    >
    Add New List
    </v-btn>
    <v-list-item class="align-center pa-1 py-2"
    v-else-if="type.type === 'pin'"
    v-bind="attrs"
    v-on="on"
    :disabled="$store.state.cliplist.length >= 20"
    >
      <div
      :disabled="$store.state.cliplist.length >= 20"
      class="twitch cliplist-canvas d-flex justify-center align-center">
        <v-icon large>mdi-plus</v-icon>
      </div>
      <span class="pl-3">
        새 플레이 리스트 추가
      </span>
    </v-list-item>
    <v-btn
    v-else-if="type.type === 'edit'"
    v-bind="attrs"
    v-on="on"
    icon>
    <v-icon>mdi-note-edit-outline</v-icon>
    </v-btn>
  </template>
  <v-card class="justify-center">
    <v-card-title class="text-h5 primary">
      {{type.data.text}}
    </v-card-title>
    <v-card-text class="justify-center">
      <div>
        <v-color-picker hide-canvas hide-inputs v-model="color"></v-color-picker>
          <v-text-field
            v-model="title"
            outlined
            size="50"
            full-width
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
        <v-textarea
        v-model="description"
        filled
        no-resize
        counter
        maxlength="100"
        :rules="[rules.descCounter]"
        size="0"
        name="input-7-4"
        :placeholder="description"
        label="Write down description."
      ></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="dialog =false">CLOSE</v-btn>
      <v-btn
      v-if="type.type === 'add' || type.type==='pin'"
        color="green darken-1"
        text
        :disabled="title === ''"
        @click="dialog = false, $store.commit('SET_newCliplist',{
          title: title,
          color: color,
          description: description
        }), initInput()"
      >
        ADD
      </v-btn>
      <v-btn
      v-if="type.type === 'edit'"
        color="green darken-1"
        text
        :disabled="title === ''"
        @click="dialog = false, $store.commit('UPDATE_clipList',{
          id: id,
          title: title,
          color: color,
          description: description
        })"
      >
        {{type.type}}
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
      description: '',
      id: '',
      dialog: false,
      color: '',
      title: '',
      rules: {
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 20 || 'Max 20 characters',
        descCounter: (value) => value.length <= 100 || 'Max 100 characters',
      },

    };
  },
  methods: {
    initInput(){
      this.description = '';
      this.title = '';
    }
  },
  created() {
    if (this.type.type === 'edit') {
      this.id = this.type.data.id;
      this.color = this.type.data.color;
      this.title = this.type.data.title;
      this.description = this.type.data.description;
    }
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
div[role=button]:hover{
  cursor: pointer;
  background-color: rgb(0, 0, 0, 0.2) !important;
}
div[disabled=disabled]{
  opacity: 0.4 !important;
}
</style>
