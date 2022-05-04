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
    >
    새 플레이 리스트 만들기
    </v-btn>
    <v-list-item class="align-center pa-1 py-2"
    v-else-if="type.type === 'pin'"
    v-bind="attrs"
    v-on="on"
    >
      <div
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
    <v-icon>mdi-pencil-outline</v-icon>
    </v-btn>
  </template>
  <v-card class="justify-center">
    <v-card-title class="text-h5" :style="{background:form.color, color: textColor}">
      Cliplist Information
    </v-card-title>
    <v-card-text class="justify-center">
      <div class="pa-5">
        <div class="d-flex justify-center pa-3">
          <v-color-picker
          hide-canvas
          hide-sliders
          hide-inputs
          show-swatches
          :swatches="swatches"
          v-model="form.color"></v-color-picker>
          <v-spacer></v-spacer>
          <div class="d-flex align-center">
            <v-switch
            v-model="form.isPublic">
            <template v-slot:label>
              <div class="pa-3">
                <v-icon :color="form.isPublic ? 'info' : 'error'">{{form.isPublic ? 'mdi-earth' : 'mdi-lock'}}</v-icon>
                <span :class="form.isPublic ? 'info--text' : 'error--text'">{{form.isPublic ? '공개' : '비공개'}}</span>
              </div>
            </template>
            </v-switch>
          </div>
        </div>
          <v-text-field
            v-model="form.title"
            outlined
            size="50"
            full-width
            class="pt-5"
            counter
            maxlength="150"
            filled
            flat
            :rules="[rules.required, rules.counter]"
            color="white"
            multi-line
            placeholder="Title (최대 20자)"
          ></v-text-field>
      </div>
        <v-textarea
        v-model="form.description"
        filled
        no-resize
        counter
        maxlength="500"
        :rules="[rules.descCounter]"
        size="0"
        name="input-7-4"
        :placeholder="form.description"
        label="Write down description."
      ></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="setDefaultValue">CLOSE</v-btn>
      <v-btn
      v-if="type.type === 'add' || type.type==='pin'"
        color="green darken-1"
        text
        :disabled="form.title === ''"
        @click="saveCliplist(), dialog = false"
      >
        ADD
      </v-btn>
      <v-btn
      v-if="type.type === 'edit'"
        color="green darken-1"
        text
        :disabled="form.title === ''"
        @click="updateClipListData(), dialog = false"
      >
      Edit
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
      dialog:false,
      form:{
        cliplist:[],
        isPublic:false,
        description: '',
        color: '',
        title: '',
        createdAt:'',
        authorName:'',
        authorId:'',
      },
      rules: {
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 150 || 'Max 150 characters',
        descCounter: (value) => value.length <= 500 || 'Max 500 characters',
      },
      swatches:[
         ['#FFCDD2','#E57373','#E53935','#C62828'],
         ['#F8BBD0','#F06292','#D81B60','#AD1457'],
         ['#E1BEE7','#BA68C8','#8E24AA','#6A1B9A'],
         ['#D1C4E9','#9575CD','#5E35B1','#4527A0'],
         ['#C5CAE9','#7986CB','#3949AB','#283593'],
         ['#BBDEFB','#64B5F6','#1E88E5','#1565C0'],
         ['#B3E5FC','#4FC3F7','#039BE5','#0277BD'],
         ['#B2EBF2','#4DD0E1','#00ACC1','#00838F'],
         ['#B2DFDB','#4DB6AC','#00897B','#00695C'],
         ['#C8E6C9','#81C784','#43A047','#2E7D32'],
         ['#DCEDC8','#AED581','#7CB342','#558B2F'],
         ['#F0F4C3','#DCE775','#C0CA33','#9E9D24'],
         ['#FFF9C4','#FFF176','#FDD835','#F9A825'],
         ['#FFECB3','#FFD54F','#FFB300','#FF8F00'],
         ['#FFE0B2','#FFB74D','#FB8C00','#EF6C00'],
         ['#FFCCBC','#FF8A65','#F4511E','#D84315'],
         ['#D7CCC8','#A1887F','#6D4C41','#4E342E'],
         ['#CFD8DC','#90A4AE','#546E7A','#37474F'],
         ['#F5F5F5','#E0E0E0','#757575','#424242'],
       ],
    };
  },
  methods: {
    initInput(){
      this.form.description = '';
      this.form.title = '';
      this.form.color = '';
      this.form.isPublic = false;
    },
    async saveCliplist(){
      this.form.cliplist = [];
      this.form.createdAt = new Date();
      this.form.authorName = this.$store.state.userinfo.userInfo.displayName || '';
      this.form.authorId = this.$store.state.userinfo.userInfo.uid || '';
      await this.$firestore.collection('cliplist').add(this.form);
      await this.$store.commit('SET_SnackBar',{type:'info', text:`${this.form.title}이 생성 되었습니다.`, value:true});
      this.initInput();
    },
    async updateClipListData(){
      let target = this.$firestore.collection('cliplist').doc(this.$store.state.currentListData.id);
      target.update({
        updatedAt : new Date(),
        title : this.form.title,
        color : this.form.color,
        description : this.form.description,
        isPublic : this.form.isPublic,
      }).then(() => {
        this.$store.commit('SET_SnackBar',{type:'info', text:`${this.$store.state.currentListData.title}을 수정했습니다.`, value:true});
        this.dialog = false;
      })


    },
    setDefaultValue(){
      if (this.type.type === 'edit') {
        this.form.isPublic = this.$store.state.currentListData.isPublic;
        this.form.description = this.$store.state.currentListData.description;
        this.form.color = this.$store.state.currentListData.color;
        this.form.title = this.$store.state.currentListData.title;
      }
      this.dialog = false;
    }
  },
  computed:{
    textColor(){
      return this.$store.state.darkColorSet.includes(this.form.color.substr(0,7)) ? 'white' : 'black';
    }
  },
  mounted() {
    this.setDefaultValue();
    document.addEventListener("keydown", (e) => {
        if (e.key === 'Escape') {
            this.$emit('close');
            this.setDefaultValue();
        }
    })
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
