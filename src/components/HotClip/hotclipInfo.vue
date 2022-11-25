<template>
<v-container fluid>
  <v-row class="d-block">
    <div v-if="!editToggle">
      <div class="d-flex align-center py-3 pt-10">
        <v-icon class="pr-2">mdi-label-multiple-outline</v-icon>
        <v-chip class="d-flex align-center text-caption chipPill mx-1" v-for="(tag, index) in hotClipData.tags" :key="index">
          {{tag}}
        </v-chip>
      </div>
      <div class="px-1 text-h6 font-weight-black">
        {{hotClipData.title}}
      </div>
    </div>
    <div v-else>
      <div class="align-center py-3 pt-10">
         <v-combobox
          color="twitch"
          v-model="tags"
          outlined
          multiple
          prepend-inner-icon="mdi-label-multiple-outline"
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
        <v-text-field
          v-model="title"
          clear-icon="mdi-close-circle"
          clearable
          counter="30"
          color="twitch"
          class="px-2 py-0"
          type="text"
          name="name"
          maxlength="30"
          placeholder="Title은 30까지 저장 가능합니다."
          label="Title"
          :rules="[titleRules.required, titleRules.counter]"
        ></v-text-field>
      </div>
      <div class="d-flex justify-end">
        <v-btn text color="error" class="text-caption pa-0" @click="editToggle = false">취소</v-btn>
        <v-btn :disabled="title === ''" text color="success" :loading="editLoading" class="text-caption pa-0" @click="editHotClip()">저장</v-btn>
      </div>
    </div>
    <div class="d-flex text-caption align-center">
      <div class="align-baseline">
        <div class=" text-caption px-1">
          게시자 : {{hotClipData.author.display_name}} ({{hotClipData.author.login}}) <v-icon v-if="hotClipData.author.broadcaster_type === 'partner'" color="twitch" small>mdi-check-circle</v-icon>
        </div>
      </div>
    </div>
    <div class="px-1 d-flex align-baseline">
      <span class="pr-2 text-body-2 font-weight-bold">조회수:{{hotClipData.viewCount}}회</span>
      <span class="blue-grey--text text-subtitle-2">
        {{formatDateWithFromNow(hotClipData.createdAt)}}
      </span>
      {{hotClipData.created_at}}
      <v-spacer></v-spacer>
      <span class="d-flex align-center px-1">
        <v-btn small icon @click="likeHotClip()" :disabled="likeLoading">
          <v-icon :color="liked ? 'twitch' : ''" class="pb-1">{{liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'}}</v-icon>
        </v-btn>
        <span class="px-1">
          {{hotClipData.likeCount}}
        </span>
      </span>
      <span class="d-flex align-center px-1"> <v-icon class="px-1">mdi-comment-text-multiple-outline</v-icon> {{hotClipData.commentCount}} </span>
      <span>
        <v-menu
        v-if="$store.state.userinfo.userInfo && hotClipData.authorId === $store.state.userinfo.userInfo.uid"
        transition="slide-x-transition"
        left
        nudge-left="5"
        offset-x>
        <template v-slot:activator="{on}">
          <div class="pt-2 d-flex" v-if="$store.state.userinfo.userInfo.uid === hotClipData.authorId">
            <v-btn small v-on="on" slot="activator" icon><v-icon>mdi-dots-vertical</v-icon></v-btn>
          </div>
        </template>
        <v-list>
          <v-list-item @click="openEdit()">
            <v-icon>mdi-pencil</v-icon>
            <span class="text-caption pl-1">수정</span>
          </v-list-item>
          <v-list-item @click="deleteHotClip()">
            <v-icon>mdi-trash-can</v-icon>
            <span class="text-caption pl-1">삭제</span>
          </v-list-item>
        </v-list>
        </v-menu>
      </span>
    </div>
    <v-divider class="my-2"></v-divider>
  </v-row>
  <v-row>
    <router-link :to="`/channel?q=${hotClipData.broadcaster.login}`">
      <div class="d-flex align-center">
        <v-avatar
          size="48"
        >
        <v-img
        :src="hotClipData.broadcaster.profile_image_url"
        >
        </v-img>
        </v-avatar>
        <div class="align-baseline">
            <div class="text-h6 font-weight-black px-1 twitch--text hoverCursor">
              {{hotClipData.broadcaster.display_name}} ({{hotClipData.broadcaster.login}})
            </div>
        </div>
      </div>
    </router-link>
  </v-row>
  <v-divider class="my-2"></v-divider>
</v-container>
</template>
<script>
export default {
  props:['hotClipData'],
  data() {
    return {
      likeLoading:false,
      title:'',
      tags:[],
      editLoading:false,
      editToggle: false,
      titleRules:{
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 31 || 'Max 30 characters',
      },

    }
  },
  computed: {
    liked(){
      if(!this.$store.state.userinfo.userInfo) return false;
      if(this.hotClipData.likeUids === undefined) return false;
      return this.hotClipData.likeUids.includes(this.$store.state.userinfo.userInfo.uid);
    },
  },
  methods: {
    openEdit(){
      this.editToggle = true;
      this.title = this.hotClipData.title;
      this.tags = this.hotClipData.tags;
    },
    async editHotClip(){
      if(this.$store.state.userinfo.userInfo.uid === this.hotClipData.authorId){
      this.editLoading = true;
      let batch = this.$firestore.batch();
      let docRef = await this.$firestore.collection('hotclip').doc(this.$route.params.id);

      batch.update(docRef, {
        updatedAt: new Date(),
        title: this.title,
        tags: this.tags,
      })
      await batch.commit().then(() => {
        this.editLoading = false;
        this.$emit('changeInfo',{
          title: this.title,
          tags: this.tags,
        });
        this.editToggle = false;
        this.$store.commit('SET_SnackBar',{type:'success', text:'Updated successfully!',value:true});
      })
      } else {
        this.$store.commit('SET_SnackBar',{type:'error', text:'Not signed in.',value:true});
        this.$store.commit('SET_SignInDialog',true);
      }
    },
    async deleteHotClip(){
      if(this.$store.state.userinfo.userInfo.uid === this.hotClipData.authorId){
        this.deleteLoading = true;
        let batch = this.$firestore.batch();

        let YY = this.hotClipData.dateLabel.split('-')[0];
        let MM = this.hotClipData.dateLabel.split('-')[1];
        let DD = this.hotClipData.dateLabel.split('-')[2];

        let metadata = this.$firestore.collection('metadata').doc(`hotclip-${YY}-${MM}`);
        let docRef = await this.$firestore.collection('hotclip').doc(this.$route.params.id);

        batch.update(metadata,{
          [`${DD}-clipCount`] : this.$firebase.firestore.FieldValue.increment(-1),
        });
        batch.delete(docRef);

        await batch.commit().then(() => {
          this.deleteLoading = false;
          this.$router.push({path:'/trending'}).catch(()=>{});
          this.$store.commit('SET_SnackBar',{type:'error', text:'Hot Clip Deleted successfully!',value:true});
        });
      } else {
        this.$store.commit('SET_SnackBar',{type:'error', text:'Not signed in.',value:true});
        this.$store.commit('SET_SignInDialog',true);
      }
    },
    async likeHotClip(){
      if(this.$store.state.userinfo.userInfo){
        this.likeLoading = true;
        let docRef = await this.$firestore.collection('hotclip').doc(this.$route.params.id);
        if(this.liked){
          docRef.update({
            likeCount: this.$firebase.firestore.FieldValue.increment(-1),
            likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.$store.state.userinfo.userInfo.uid)
          })
          .then(() => {
            const index = this.hotClipData.likeUids.findIndex(x => x === this.$store.state.userinfo.userInfo.uid);
            this.hotClipData.likeUids.splice(index, 1);
            this.hotClipData.likeCount -= 1;
            this.likeLoading = false;
          })
        } else {
          docRef.update({
            likeCount: this.$firebase.firestore.FieldValue.increment(1),
            likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.$store.state.userinfo.userInfo.uid)
          })
          .then(() => {
            this.hotClipData.likeUids.push(this.$store.state.userinfo.userInfo.uid);
            this.hotClipData.likeCount += 1;
            this.likeLoading = false;
          })
        }
      } else {
        this.$store.commit('SET_SignInDialog', true);
      }

    },
    formatDateWithFromNow(el){
      const timeDiff = this.$moment().diff(el);
      return timeDiff > 86400000 ? this.$moment(el).format('l') :this.$moment(el).fromNow();
    }
  },

}
</script>
<style>

</style>
