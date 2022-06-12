<template>
<v-dialog
  v-model="dialog"
  scrollable
  max-width="800">
  <template v-slot:activator="{ on, attrs }">
    <v-btn
      depressed
      v-if="type.type === 'add'"
      class="text-caption"
      color="twitch"
      v-bind="attrs"
      v-on="on"
    >
    <v-icon size="16" class="pr-1" color="white">mdi-plus</v-icon>
    <span class="white--text">
      리스트 만들기
    </span>
    </v-btn>
    <v-list-item class="align-center pa-1 py-2"
    v-else-if="type.type === 'pin'"
    v-bind="attrs"
    v-on="on"
    >
      <div
      class="twitch cliplist-canvas d-flex justify-center align-center">
        <v-icon color="white" x-large>mdi-plus</v-icon>
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
  <v-card class="justify-center" :disabled="loading">
    <v-card-title class="text-h5" :style="{background:form.color, color: textColor}">
      Cliplist Information
    </v-card-title>
    <div v-if="loading" class="absolute-center">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
    <v-card-text class="justify-center">
      <div class="d-flex justify-center pa-3">
          <v-color-picker
          hide-canvas
          hide-sliders
          hide-inputs
          show-swatches
          width="800"
          :swatches="swatches"
          v-model="form.color"></v-color-picker>
      </div>
      <v-text-field
        clearable
        multi-line
        clear-icon="mdi-close-circle"
        v-model="form.title"
        outlined
        class="pt-5 d-block"
        counter
        maxlength="25"
        flat
        :rules="[titleRules.required, titleRules.counter]"
        color="twitch"
        placeholder="제목은 (최대 25자)까지 입력가능합니다."
        label="Title"
      ></v-text-field>
      <v-textarea
        clearable
        multi-line
        clear-icon="mdi-close-circle"
        class="pt-5"
        v-model="form.description"
        outlined
        no-resize
        counter
        color="twitch"
        maxlength="100"
        :rules="descRules"
        name="input-7-4"
        label="Description."
      ></v-textarea>
      <v-select
        color="twitch"
        outlined
        v-model="form.isPublic"
        :value="form.isPublic ? form.isPublic : 2"
        :items="selectItem"
        label="Public"
      >
        <template v-slot:selection="{item}">
        <div class="pa-2">
          <v-icon class="pr-3" small>{{item.icon}}</v-icon>
          <span class="text-caption">{{item.name}}</span>
        </div>
        </template>
        <template v-slot:item="{item}">
        <div class="pa-2">
          <v-icon class="pr-3" small>{{item.icon}}</v-icon>
          <span class="text-caption">{{item.name}}</span>
        </div>
        </template>
      </v-select>
      <v-combobox
      color="twitch"
      v-model="tags"
      outlined
      multiple
      counter="5"
      deletable-chips
      small-chips
      maxlength="15"
      label="Tags"
      placeholder="Tag는 5개까지, 15글자까지 저장 가능합니다."
      clear-icon="mdi-close-circle"
      clearable>
      </v-combobox>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="setDefaultValue">CLOSE</v-btn>
      <v-btn
      v-if="type.type === 'add' || type.type==='pin'"
        color="green darken-1"
        text
        :disabled="form.title === '' || form.title === null"
        @click="saveCliplist(), dialog = false"
      >
        ADD
      </v-btn>
      <v-btn
      v-if="type.type === 'edit'"
        color="green darken-1"
        text
        :disabled="form.title === '' || form.title === null"
        @click="updateClipListData()"
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
      tags:[],
      comboboxCounterRule:[
        v => v.length < 5 || 'Tag는 최대 5개입니다.',
      ],
      selectItem:[
        {name: '공개', icon:'mdi-earth', value: 2},
        {name: '일부공개', icon:'mdi-eye', value: 1},
        {name: '비공개', icon:'mdi-eye-off', value: 0},
      ],
      loading:false,
      dialog:false,
      form:{
        isPublic:2,
        description: '',
        color: '#00897BFF',
        title: '',
        createdAt:'',
        authorName:'',
        authorId:'',
        tags:[],
      },
      titleRules:{
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 25 || 'Max 25 characters',
      },
      descRules:[(value) => value.length <= 100 || 'Max 100 characters'],
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
  watch: {
    tags (val) {
      if (val.length > 5) {
        this.$nextTick(() => this.tags.pop())
    }
    },
  },
  methods: {
    initInput(){
      this.form.description = '';
      this.form.title = '';
      this.form.color = '';
      this.form.isPublic = 2;
      this.tags = [];
    },
    async saveCliplist(){
      this.loading = true;
      this.form.likeCount = 0;
      this.form.viewCount = 0;
      this.form.clipCount = 0;
      this.form.thumbnail_url = null;
      this.form.clipIds = [];
      this.form.tags = this.tags;
      this.form.createdAt = new Date();
      this.form.authorName = this.$store.state.userinfo.userInfo.displayName || '';
      this.form.authorId = this.$store.state.userinfo.userInfo.uid || '';
      await this.$firestore.collection('cliplist').add(this.form).then( async () => {
        await this.$store.commit('SET_SnackBar',{type:'info', text:`${this.form.title}이 생성 되었습니다.`, value:true});
        this.loading = false;
        this.initInput();
      });
    },
    async updateClipListData(){
      this.loading = true;
      let target = this.$firestore.collection('cliplist').doc(this.type.data.id);
      target.update({
        updatedAt : new Date(),
        title : this.form.title,
        color : this.form.color,
        description : this.form.description,
        isPublic : this.form.isPublic,
        tags : this.tags,
      }).then(() => {
        this.loading = false;
        this.dialog = false;
        this.$store.commit('SET_SnackBar',{type:'info', text:`${this.type.data.title}을 수정했습니다.`, value:true});
      })


    },
    setDefaultValue(){
      if (this.type.type === 'edit') {
        this.form.isPublic = this.type.data.isPublic;
        this.form.description = this.type.data.description;
        this.form.color = this.type.data.color;
        this.form.title = this.type.data.title;
        this.tags = this.type.data.tags;
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
