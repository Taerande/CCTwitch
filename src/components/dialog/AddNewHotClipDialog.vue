<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    transition="dialog-transition"
  >
  <template v-slot:activator="{on}">
    <div v-if="$store.state.userinfo.userInfo" class="px-1 mx-1">
      <v-btn class="d-flex mx-auto" color="error" icon v-on="on"><v-icon>mdi-fire</v-icon></v-btn>
      <div class="text-caption">
        핫클립
      </div>
    </div>
    <div v-else class="px-1 mx-1">
      <v-btn class="d-flex mx-auto" color="error" icon @click="$store.commit('SET_SignInDialog',true)"><v-icon>mdi-fire</v-icon></v-btn>
      <div class="text-caption">
        핫클립
      </div>
    </div>
  </template>
  <v-card>
    <v-card-title class="twitch white--text">
      Hot Clip 등록
    </v-card-title>
    <v-card-text class="pa-3">
      <v-text-field
        outlined
        v-model="title"
        clear-icon="mdi-close-circle"
        clearable
        counter="30"
        color="twitch"
        type="text"
        name="name"
        maxlength="30"
        label="title"
        :rules="[titleRules.required, titleRules.counter]"
        id="id"
      ></v-text-field>
      <v-combobox
      color="twitch"
      v-model="tags"
      outlined
      multiple
      counter="5"
      deletable-chips
      type="text"
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
      <v-btn color="error" @click="dialog=false" text>close</v-btn>
      <v-btn :loading="dbloading" :disabled="title === ''" color="success" @click="createHotClip()" text>Add</v-btn>
    </v-card-actions>

  </v-card>

  </v-dialog>
</template>
<script>
export default {
  props:['clipData'],
  data() {
    return {
      title:'',
      dialog:false,
      dbloading: false,
      tags:[],
      titleRules:{
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 31 || 'Max 30 characters',
      },
    }
  },
  watch: {
    tags (val) {
      if (val.length > 5) {
        this.$nextTick(() => this.tags.pop())
    }
    },
    dialog (val){
      if(val === false){
        this.dbloading = false
      }
    }
  },
  methods: {
    async createHotClip(){
      // 당일 오전 7시 기준으로 정렬한다.
      // isBefore ? 'add(-1,day)' : ''
      let isBefore = this.$moment().isBefore(this.$moment('7','hour'));
      let today = isBefore ? this.$moment().add(-1,'day') : this.$moment();
      this.dbloading = true;
      let target = this.$firestore.collection('hotclip').doc(this.clipData.id);
      let metaData = this.$firestore.collection('metadata').doc(`hotclip-${today.format('YYYY')}-${today.format('MM')}`);
      await metaData.get().then((doc) => {
        if(!doc.exists){
          this.$firestore.collection('metadata').doc(`hotclip-${today.format('YYYY')}-${today.format('MM')}`).set({});
        }
      })
      await target.get().then(async (doc) => {
        if(doc.exists){
          this.dbloading = false;
          this.dialog = false;
          this.$store.commit('SET_SnackBar',{type:'error', text:'This clip has already been added to Hot Clip.',value:true})
          return

        } else {
          let batch = this.$firestore.batch();
          batch.set(target, {
            authorId: this.$store.state.userinfo.userInfo.uid,
            authorName: this.$store.state.userinfo.userInfo.displayName,
            createdAt: new Date(),
            tags: this.tags,
            title: this.title,
            viewCount: 0,
            likeUids:[],
            thumbnail_url:this.clipData.thumbnail_url,
            likeCount: 0,
            dateLabel: today.format('YYYY-MM-DD'),
            broadcaster_id: this.clipData.broadcaster_id,
            commentCount: 0,
          });

          batch.update(metaData, {
              [`${today.format('DD')}-clipCount`] : this.$firebase.firestore.FieldValue.increment(1),
            })
          await batch.commit().then(()=>{
            this.dbloading = false;
            this.dialog = false;
            this.$store.commit('SET_SnackBar',{type:'success', text:'Upload success!', value:true});
          });
        }
      })
    },
  },
}
</script>
<style>

</style>
