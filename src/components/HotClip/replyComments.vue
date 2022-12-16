<template>
  <v-container fluid class="align-center ml-6 replyContainer">
    <v-row class="col-12" v-if="replyId === hotclipComment.id">
      <v-col class="d-flex align-center">
        <v-avatar
          size="24">
          <v-img
          :src="$store.state.userinfo.userInfo.photoURL"></v-img>
        </v-avatar>
        <v-text-field
          color="twitch"
          class="pl-3 ma-0 text-body-2"
          full-width
          dense
          autofocus
          name="reply"
          :loading="dbloading"
          type="text"
          hide-details="auto"
          v-model="replyContent"
          >
            <template v-slot:append>
              <div class="d-flex">
                <v-btn text color="error" small @click="closeReply()" class="text-caption" >close</v-btn>
                <v-btn :loading="dbloading" :disabled="replyContent.length === 0" color="twitch" text class="text-caption white--text" small @click="addReplies()">Add</v-btn>
              </div>
            </template>
        </v-text-field>
      </v-col>
    </v-row>
   <v-btn v-if="hotclipComment.replyCount > 0" @click="loadReplies(hotclipComment), toggleReplySection()" text :loading="replyLoading" class="px-0">
      <div class="text-caption info--text">{{ replySection ? `총 ${hotclipComment.replyCount}개 답글 숨기기` : `총 ${hotclipComment.replyCount}개 답글 보기`}}</div>
    </v-btn>
    <v-row class="col-12" v-show="replySection">
      <v-divider class="my-5" v-if="myReply.id !== undefined"></v-divider>
      <v-col v-for="(item, index) in replies" :key="item.id+index" class="d-flex py-2" cols="12">
        <div class="px-1 d-flex">
          <v-avatar
            size="24">
          <v-img
          :src="item.profile_image_url"></v-img>
          </v-avatar>
        </div>
        <div style="width:90%;" v-if="item.id !== editId"  :class="item.id === 'newlyAddedReply' ? 'error' : ''">
          <div>
            <span class="text-subtitle-2 font-weight-bold">
              {{item.display_name}}
            </span>
            <span class="blue-grey--text text-caption">
              {{formatDateWithFromNow(item.createdAt)}}
            </span>
          </div>
          <div class="px-2 text-body-2 pt-1">
            {{item.reply}}
          </div>
          <div class="d-flex align-center py-1 px-2">
            <v-btn :disabled="likeIdx === index" x-small icon @click="isLiked(item) ? removeLikeReply(item, index) : likeReply(item, index)" :color="isLiked(item) ? 'twitch' : ''"><v-icon small>{{isLiked(item) ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'}}</v-icon></v-btn>
            <span class="text-caption">
              {{item.likeCount}}
            </span>
          </div>
        </div>
        <v-text-field
          v-else
          class="pb-3 pl-3 ma-0 text-body-2"
          color="twitch"
          full-width
          width="80%"
          dense
          name="comments"
          :loading="dbloading"
          type="text"
          v-model="editReply"
          hide-details
          :placeholder="item.reply"
        >
          <template v-slot:append>
            <v-btn text color="error" small @click="closeEdit()" class="text-caption" >close</v-btn>
            <v-btn :loading="dbloading" :disabled="editReply.length === 0 || item.reply === editReply" color="twitch" text class="text-caption" small @click="editReplies(item)">Edit</v-btn>
          </template>
        </v-text-field>
        <v-spacer v-if="item.id !== editId"></v-spacer>
        <v-menu
        v-if="$store.state.userinfo.userInfo && item.authorId === $store.state.userinfo.userInfo.uid"
        transition="slide-x-transition"
        left
        nudge-left="5"
        offset-x>
          <template v-slot:activator="{on}">
            <div class="pt-2 d-flex justify-end">
              <v-btn @click="dialogId = item.id" small v-on="on" slot="activator" icon><v-icon>mdi-dots-vertical</v-icon></v-btn>
            </div>
          </template>
          <v-list class="text-caption pa-0">
            <v-list-item class="pa-0 ma-0">
              <v-btn block text @click="openEdit(item)" class="text-caption">
                <v-icon small class="px-1">mdi-pencil</v-icon> 수정
              </v-btn>
            </v-list-item>
            <v-list-item class="pa-0 ma-0">
              <v-btn :loading="deleteLoading" block text @click="deleteReplies(item,index)" class="text-caption">
                <v-icon small class="px-1">mdi-trash-can</v-icon> 삭제
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
      <v-col cols="12" v-if="replies.length < hotclipComment.replyCount">
        <v-btn :loading="moreReplyLoading" class="ml-3 pa-0" @click="loadMoreReplies(hotclipComment)" text>
          <div class="text-caption info--text">더 보기</div>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import last from 'lodash/last'

export default {
  props:['hotclipComment','replyId'],
  data() {
    return {
      myReply:{},
      replyContent:'',
      replies:[],
      replySection:false,
      likeIdx: -1,
      dbloading:false,
      lastReply: null,
      editReply:'',
      editId: '',
      deleteLoading: false,
      replyLoading: false,
      moreReplyLoading:false,
    }
  },
  methods: {
    toggleReplySection(){
      this.replySection = !this.replySection;
    },
    async deleteReplies(item,idx){
      this.deleteLoading = true;
      let hotclipComment = this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(this.hotclipComment.id);
      let hotclip = this.$firestore.collection('hotclip').doc(this.$route.params.id);
      let reply = this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(this.hotclipComment.id).collection('replies').doc(item.id);
      let batch = this.$firestore.batch();

      batch.delete(reply)
      batch.update(hotclip, {
        commentCount: this.$firebase.firestore.FieldValue.increment(-1),
      })
      batch.update(hotclipComment, {
        replyCount: this.$firebase.firestore.FieldValue.increment(-1),
      })
      await batch.commit().then(() => {
        this.hotclipComment.replyCount -= 1;
        this.$emit('closeReply',-1);
        if(idx === 'index') {
          this.myReply = {};
          const index = this.replies.findIndex(x => x.id === item.id);
          if(index >= 0){
            this.replies.splice(index,1);
          }
        } else {
        this.replies.splice(idx,1);
        }
        this.deleteLoading = false;
        this.$store.commit('SET_SnackBar',{type:'success', text:'Comment has been deleted!', value:true});
      })
    },

    async editReplies(item){
      this.dbloading = true;
      let reply = this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(this.hotclipComment.id).collection('replies').doc(item.id);

      let batch = this.$firestore.batch();
      batch.update(reply,{
        updatedAt: new Date(),
        reply: this.editReply,
      })
      await batch.commit().then(() => {
        item.reply = this.editReply;
        const index = this.replies.findIndex(x => x.id === item.id);
        if(index >= 0){
          this.replies[index].reply = this.editReply;
        }
      })
      this.closeEdit();
      this.dbloading = false;
    },
    openEdit(el){
      this.editId = el.id
      this.editReply = el.reply;
    },
    closeEdit(){
      this.editReply = '';
      this.editId = '';
    },
    async likeReply(item,idx){
      if(!this.$store.state.userinfo.userInfo){
        this.$store.commit('SET_SignInDialog',true);
        return
      }
      this.likeIdx = idx;
      let reply = this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(this.hotclipComment.id).collection('replies').doc(item.id);
      let batch = this.$firestore.batch();

      batch.update(reply,{
        likeCount: this.$firebase.firestore.FieldValue.increment(1),
        likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.$store.state.userinfo.userInfo.uid),
      });
      await batch.commit().then(() => {
        item.likeUids.push(this.$store.state.userinfo.userInfo.uid);
        item.likeCount += 1;
        this.likeIdx = -1;
      })
    },
    async removeLikeReply(item, idx){
      if(!this.$store.state.userinfo.userInfo){
        this.$store.commit('SET_SignInDialog',true);
        return
      }
      this.likeIdx = idx;
      let reply = this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(this.hotclipComment.id).collection('replies').doc(item.id);
      let batch = this.$firestore.batch();

      batch.update(reply,{
        likeCount: this.$firebase.firestore.FieldValue.increment(-1),
        likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.$store.state.userinfo.userInfo.uid),
      });
      await batch.commit().then(() => {
        const index = item.likeUids.findIndex(x => x === this.$store.state.userinfo.userInfo.uid);
        item.likeUids.splice(index,1);
        item.likeCount -= 1;
        this.likeIdx = -1;
      })
    },
    isLiked(item){
      return this.$store.state.userinfo.userInfo ? item.likeUids.includes(this.$store.state.userinfo.userInfo.uid) : false;
    },
    async loadMoreReplies(el){
      if(this.replies.length === 0){
        this.loadReplies(this.hotclipComment);
        return
      } else if(this.lastReply === null){
        return
      }
      this.moreReplyLoading = true;
      let target = await this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(el.id)

      target.collection('replies').orderBy('likeCount','desc').orderBy('createdAt','asc').startAfter(this.lastReply).limit(10).get().then( async (sn) => {
        this.lastReply = last(sn.docs);
        if(sn.empty){
          this.moreReplyLoading = false;
          return
        }
        sn.docs.forEach((doc) => {
          const item = doc.data();
          this.replies.push({
            id: doc.id,
            authorId: item.authorId,
            profile_image_url: item.profile_image_url,
            display_name: item.display_name,
            reply: item.reply,
            replyCount:item.replyCount,
            likeCount: item.likeCount,
            likeUids: item.likeUids,
            createdAt: item.createdAt.toDate(),
          })
        });
        this.moreReplyLoading = false;
      });

    },
    async loadReplies(el){
      if(this.replies.length > 0 ) { return }
      this.replyLoading = true;
      const snap = await this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(el.id).collection('replies').orderBy('likeCount','desc').orderBy('createdAt','asc').limit(10);

      snap.get().then( async (sn) => {
        this.lastReply = last(sn.docs);
        if(sn.empty){
          this.replyLoading = false;
          return
        }
        sn.docs.forEach((doc) => {
          const item = doc.data();
          this.replies.push({
            id: doc.id,
            authorId: item.authorId,
            profile_image_url: item.profile_image_url,
            display_name: item.display_name,
            reply: item.reply,
            replyCount:item.replyCount,
            likeCount: item.likeCount,
            likeUids: item.likeUids,
            createdAt: item.createdAt.toDate(),
          })
        });
      this.replyLoading = false;
      });
    },
    formatDateWithFromNow(el){
      const timeDiff = this.$moment().diff(el);
      return timeDiff > 86400000 ? this.$moment(el).format('l') :this.$moment(el).fromNow();
    },
    closeReply(){
      this.$emit('closeReply');
    },
    async addReplies(){
      this.dbloading = true;
      let comment = this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').doc(`${this.hotclipComment.id}`);
      let hotclip = this.$firestore.collection('hotclip').doc(this.$route.params.id);
      let batch = this.$firestore.batch();
      const tempId = `${this.$store.state.userinfo.userInfo.uid}-${new Date().getTime()}`;
      let form = {
        authorId: this.$store.state.userinfo.userInfo.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        reply: this.replyContent,
        profile_image_url: this.$store.state.userinfo.userInfo.photoURL,
        likeCount: 0,
        likeUids:[],
        display_name: this.$store.state.userinfo.userInfo.displayName,
      };

      batch.set(comment.collection('replies').doc(tempId),form);
      batch.update(hotclip, {
        commentCount: this.$firebase.firestore.FieldValue.increment(1),
      })
      batch.update(comment,{
        replyCount: this.$firebase.firestore.FieldValue.increment(1),
      })

      await batch.commit().then(()=>{
        this.replySection = true;
        form.id = tempId;
        // this.replies.push(form);
        this.hotclipComment.replyCount += 1;
        this.dbloading = false;
        this.replyContent = '';
        this.$emit('closeReply',1);
        this.myReply = form;
        this.$store.commit('SET_SnackBar',{type:'success', text:'Write comment successfully!'})
      })
      await this.loadMoreReplies(this.hotclipComment);

    },
  },

}
</script>
<style>
.replyContainer{
  width: initial !important;
}

</style>
