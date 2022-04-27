<template>
  <v-dialog
    v-model="dialog"
    max-width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        text
        outlined
        class="text-caption"
        color="success"
        v-on="on"
        v-bind="attrs"
      >
      Add New List
      </v-btn>
    </template>
    <v-card class="justify-center">
      <v-card-title class="text-h5 primary">
      Add New Clip List
      <v-spacer></v-spacer>
      <v-icon color="error" @click="dialog = false">mdi-close</v-icon>
      </v-card-title>
      <v-card-text class="justify-center">
        <div>
          <v-color-picker hide-canvas hide-inputs v-model="form.color"></v-color-picker>
          <v-text-field
            v-model="form.title"
            outlined
            size="50"
            full-width
            class="pt-5"
            counter
            maxlength="20"
            filled
            flat
            color="white"
            multi-line
            placeholder="Title (최대 20자)"
            :rules="[rules.required, rules.counter]"
          ></v-text-field>
        </div>
        <v-textarea
        v-model="form.description"
        filled
        no-resize
        counter
        maxlength="100"
        size="0"
        name="input-7-4"
        :placeholder="form.description"
        label="Write down description."
        :rules="[rules.descCounter]"
      ></v-textarea>
      </v-card-text>
      <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="dialog = false">CLOSE</v-btn>
      <v-btn
        color="green darken-1"
        text
        @click="saveCliplist"
      >
        ADD
      </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>

export default {
  data() {
    return {
      dialog:false,
      form:{
        description: '',
        color: '',
        title: '',
        cliplist:[],
        createdAt:'',
        authorName:'',
        authorId:'',
      },
      rules:{
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 20 || 'Max 20 characters',
        descCounter: (value) => value.length <= 100 || 'Max 100 characters',
      },
    }
  },
  methods: {
    initInput(){
      this.form.description = '';
      this.form.title = '';
      this.form.color = '';
    },
    saveCliplist(){
      this.form.createdAt = this.$moment().toISOString();
      this.form.authorName = this.$store.state.userinfo.userInfo.displayName || '';
      this.form.authorId = this.$store.state.userinfo.userInfo.uid || '';
      this.$firestore.collection('cliplist').add(this.form);
    }
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
div[role=button]:hover{
  cursor: pointer;
  background-color: rgb(0, 0, 0, 0.2) !important;
}
div[disabled=disabled]{
  opacity: 0.4 !important;
}
</style>
