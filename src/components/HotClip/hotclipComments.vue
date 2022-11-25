<template>
<v-container fluid>
  <v-row>
    <span>
      Comments : {{hotClipData.commentCount}}
    </span>
  </v-row>
  <v-row class="d-flex align-center px-1 pt-7" v-if="$store.state.userinfo.userInfo">
    <v-avatar
      size="36"
    >
      <v-img
      :src="$store.state.userinfo.userInfo.photoURL"
      ></v-img>
    </v-avatar>
    <v-text-field
    class="pa-0 pl-3"
    color="twitch"
    full-width
    dense
    name="comments"
    :loading="dbloading"
    type="text"
    hide-details="auto"
    v-model="comment"
    >
      <template v-slot:append>
        <v-btn :loading="dbloading" :disabled="comment.length === 0" color="twitch" text class="text-caption white--text" small @click="addComments()">Add</v-btn>
      </template>
    </v-text-field>
  </v-row>
  <v-row v-else>
    <div class="mx-auto">
      로그인이 필요한 서비스입니다.
    </div>
    <v-btn color="twitch" class="white--text" @click="$store.commit('SET_SignInDialog', true)" block><v-icon color="white">mdi-twitch</v-icon>Log In</v-btn>
  </v-row>
  <v-row v-if="comments.length > 0 && loading" class="py-7">
    <v-col cols="12" v-if="commentLoading" class="d-flex justify-center">
      <v-progress-circular color="twitch" width="3" indeterminate></v-progress-circular>
    </v-col>
    <v-col cols="12" v-for="(item, idx) in comments" :key="item.id">
      <div class="d-flex pt-3">
        <div class="px-1">
          <v-avatar
            size="36"
          >
          <v-img
          :src="item.profile_image_url"></v-img>
          </v-avatar>
        </div>
        <div v-if="item.id !== editId"  style="width:90%;">
          <div>
            <span>
              {{item.display_name}}
            </span>
            <span class="blue-grey--text text-subtitle-2">
              {{formatDateWithFromNow(item.createdAt)}}
            </span>
          </div>
          <div class="px-2 text-body-2 pt-1">
            {{item.comment}}
          </div>
          <div class="d-flex align-center py-1 px-2">
            <v-btn :disabled="likeIdx === idx" x-small icon @click="isLiked(item) ? removeLikeComment(item, idx) : likeComment(item, idx)" :color="isLiked(item) ? 'twitch' : ''"><v-icon>{{isLiked(item) ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'}}</v-icon></v-btn>
            <span class="pl-1 text-caption">
              {{item.likeCount}}
            </span>
            <v-btn v-if="$store.state.userinfo.userInfo" @click="replyId = item.id" color="twitch" class="pa-0 ma-0" small text>답글</v-btn>
          </div>
        </div>
        <v-text-field
          v-else
          class="pb-3 pl-3 ma-0"
          color="twitch"
          full-width
          width="80%"
          dense
          name="comments"
          :loading="dbloading"
          type="text"
          v-model="editComment"
          hide-details="auto"
          :placeholder="item.comment"
        >
        <template v-slot:append>
          <v-btn text color="error" small @click="closeEdit()" class="text-caption" >close</v-btn>
          <v-btn :loading="dbloading" :disabled="editComment.length === 0" color="twitch" text class="text-caption" small @click="editComments(item)">Edit</v-btn>
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
              <v-btn :loading="deleteLoading" block text @click="deleteComments(item,idx)" class="text-caption">
                <v-icon small class="px-1">mdi-trash-can</v-icon> 삭제
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    <replyCommentsVue :hotclipComment="item" :replyId="replyId" @closeReply="closeReply"></replyCommentsVue>
    </v-col>
  </v-row>
  <v-row v-else-if="hotClipData.commentCount > comments.length" class="d-block pb-16 pt-10" v-intersect="onIntersect">
    <div class="d-flex justify-center">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
    <div class="d-flex justify-center ">데이터 불러오는 중</div>
  </v-row>
  <v-row v-else-if="comments.length === 0 && loading" class="d-flex justify-center">
    <div class="d-flex justify-center">
      No Comments
    </div>
  </v-row>
  <v-row v-else-if="!loading"  class="d-flex justify-center">
    <div class="d-flex justify-center">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  </v-row>
</v-container>
</template>
<script>
import { last } from 'lodash'
import replyCommentsVue from './replyComments.vue'
export default {
  props:['hotClipData'],
  components:{
    replyCommentsVue,
  },
  data() {
    return {
      comment:'',
      editId:'',
      replyId: '',
      loading: false,
      comments:[],
      editComment:'',
      dbloading:false,
      commentLoading:false,
      likeIdx: -1,
      lastVisible: null,
      deleteLoading: false,
    }
  },
  methods:{
    updateNewReply(el){
      console.log(el);
    },
    closeReply(el){
      this.replyId = '';
      this.$emit('updateCommentCount',el);
    },
    onIntersect(entries , observer, isIntersecting){
      setTimeout(() => {
        if(isIntersecting && this.loading && this.lastVisible){
          this.getMoreComments('likeCount')
        }
      }, 500);
    },
    openEdit(el){
      this.editId = el.id
      this.editComment = el.comment;
    },
    closeEdit(){
      this.editComment = '';
      this.editId = '';
    },
    isLiked(item){
      return this.$store.state.userinfo.userInfo ? item.likeUids.includes(this.$store.state.userinfo.userInfo.uid) : false;
    },
    formatDateWithFromNow(el){
      const timeDiff = this.$moment().diff(el);
      return timeDiff > 86400000 ? this.$moment(el).format('l') :this.$moment(el).fromNow();
    },
    async likeComment(item,idx){
      if(!this.$store.state.userinfo.userInfo){
        this.$store.commit('SET_SignInDialog',true);
        return
      }
      this.likeIdx = idx;
      let hotclipComment = this.$firestore.collection('hotclip').doc(this.hotClipData.id).collection('comments').doc(item.id);
      let batch = this.$firestore.batch();

      batch.update(hotclipComment,{
        likeCount: this.$firebase.firestore.FieldValue.increment(1),
        likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.$store.state.userinfo.userInfo.uid),
      });
      await batch.commit().then(() => {
        item.likeUids.push(this.$store.state.userinfo.userInfo.uid);
        item.likeCount += 1;
        this.likeIdx = -1;
      })
    },
    async removeLikeComment(item, idx){
      if(!this.$store.state.userinfo.userInfo){
        this.$store.commit('SET_SignInDialog',true);
        return
      }
      this.likeIdx = idx;
      let hotclipComment = this.$firestore.collection('hotclip').doc(this.hotClipData.id).collection('comments').doc(item.id);
      let batch = this.$firestore.batch();

      batch.update(hotclipComment,{
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
    async deleteComments(item,idx){
      this.deleteLoading = true;
      let hotclip = this.$firestore.collection('hotclip').doc(this.hotClipData.id);
      let hotclipComment = this.$firestore.collection('hotclip').doc(this.hotClipData.id).collection('comments').doc(item.id);
      let batch = this.$firestore.batch();
      batch.delete(hotclipComment)
      batch.update(hotclip, {
        commentCount: this.$firebase.firestore.FieldValue.increment((item.replyCount + 1) * (-1)),
      })
      await batch.commit().then(() => {
        this.comments.splice(idx,1);
        this.deleteLoading = false;
        this.$store.commit('SET_SnackBar',{type:'success', text:'Comment has been deleted!', value:true});
      })
      this.$emit('updateCommentCount',(item.replyCount + 1) * (-1));
    },
    async editComments(item){
      this.dbloading = true;
      let hotclipComment = this.$firestore.collection('hotclip').doc(this.hotClipData.id).collection('comments').doc(item.id);

      let batch = this.$firestore.batch();
      batch.update(hotclipComment,{
        updatedAt: new Date(),
        comment: this.editComment,
      })
      await batch.commit().then(() => {
        item.comment = this.editComment;
      })
      this.closeEdit();
      this.dbloading = false;
    },
    async addComments(){
      this.dbloading = true;
      this.commentLoading = true;
      let hotclip = this.$firestore.collection('hotclip').doc(this.hotClipData.id);
      let batch = this.$firestore.batch();

      batch.set(hotclip.collection('comments').doc(),{
        authorId: this.$store.state.userinfo.userInfo.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        comment: this.comment,
        profile_image_url: this.$store.state.userinfo.userInfo.photoURL,
        likeCount: 0,
        likeUids:[],
        display_name: this.$store.state.userinfo.userInfo.displayName,
        replyCount:0,
      });
      batch.update(hotclip,{
        commentCount: this.$firebase.firestore.FieldValue.increment(1),
      })

      await batch.commit().then(async ()=>{
        await hotclip.collection('comments').orderBy('createdAt','desc').where('authorId','==',this.$store.state.userinfo.userInfo.uid).limit(1).get().then((sn) =>{
          const item = sn.docs[0].data();
          this.comments.unshift({
            id: sn.docs[0].id,
            authorId: item.authorId,
            createdAt: item.createdAt.toDate(),
            comment: item.comment,
            likeCount: item.likeCount,
            likeUids:item.likeUids,
            replyCount:item.replyCount,
            display_name: item.display_name,
            profile_image_url: item.profile_image_url,
          })
          this.commentLoading = false;
        })
        this.hotClipData.commentCount += 1;
        this.dbloading = false;
        this.comment = '';
      })
      this.$store.commit('SET_SnackBar',{type:'success', text:'Write comment successfully!'})
    },
    async getMoreComments(order){
      await this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').orderBy(order,'desc').orderBy('createdAt','desc').startAfter(this.lastVisible).limit(10).get().then( async (sn) => {
        this.lastVisible = last(sn.docs);
        if(sn.empty){
          return
        }
        sn.docs.forEach((doc) => {
          const item = doc.data();
          this.comments.push({
            id: doc.id,
            authorId: item.authorId,
            profile_image_url: item.profile_image_url,
            display_name: item.display_name,
            comment: item.comment,
            replyCount:item.replyCount,
            replies: [],
            likeCount: item.likeCount,
            likeUids: item.likeUids,
            createdAt: item.createdAt.toDate(),
          })
        });
      })
    },
    async loadComments(order){
      await this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').orderBy(order,'desc').orderBy('createdAt','desc').limit(10).get().then( async (sn) => {
      this.lastVisible = last(sn.docs);
      if(sn.empty){
        this.comments = [];
      }
      sn.docs.forEach((doc) => {
        const item = doc.data();
        this.comments.push({
          id: doc.id,
          authorId: item.authorId,
          profile_image_url: item.profile_image_url,
          display_name: item.display_name,
          comment: item.comment,
          likeCount: item.likeCount,
          replyCount:item.replyCount,
          replies: [],
          likeUids: item.likeUids,
          createdAt: item.createdAt.toDate(),
        })
      });
    })
    }
  },
  async created(){
    await this.loadComments('likeCount');
    this.loading = true;

  }
}
</script>
<style>
</style>
