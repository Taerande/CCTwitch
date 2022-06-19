<template>
<v-container fluid>
  <v-row>
    <span>
      Comments : {{hotClipData.commentCount}}
    </span>
    <span>
      정렬
    </span>
  </v-row>
  <v-row class="d-flex align-center" v-if="$store.state.userinfo.userInfo" >
    <v-avatar
      size="48"
    >
      <v-img
      :src="$store.state.userinfo.userInfo.photoURL"
      ></v-img>
    </v-avatar>
    <v-text-field
    class="pa-3"
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
  <v-row v-if="comments.length > 0" class="py-3">
    <v-col cols="12" v-if="commentLoading" class="d-flex justify-center">
      <v-progress-circular color="twitch" width="3" indeterminate></v-progress-circular>
    </v-col>
    <v-col cols="12" v-for="(item, idx) in comments" :key="idx" class="d-flex py-2">
      <div>
        <v-avatar
          size="48"
        >
        <v-img
        :src="item.profile_image_url"></v-img>
        </v-avatar>
      </div>
      <div v-if="item.id !== editId">
        <div class="pt-2">
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
          <v-btn x-small icon><v-icon>mdi-thumb-up-outline</v-icon></v-btn>
          <span class="pl-1 text-caption">
            {{item.likeCount}}
          </span>
          <v-btn small text color="twitch">답글</v-btn>
        </div>
      </div>
      <v-text-field
        v-else
        class="pa-3"
        color="twitch"
        full-width
        width="80%"
        dense
        name="comments"
        :loading="dbloading"
        type="text"
        v-model="editComment"
        hide-details="auto"
      >
      <template v-slot:append>
        <v-btn text color="error" small @click="closeEdit()" class="text-caption" >close</v-btn>
        <v-btn :loading="dbloading" :disabled="editComment.length === 0" color="twitch" text class="text-caption" small @click="editComment()">Edit</v-btn>
      </template>
      </v-text-field>
      <v-spacer v-if="item.id !== editId"></v-spacer>
      <v-menu
      transition="slide-x-transition"
      left
      nudge-left="5"
      offset-x>
        <template v-slot:activator="{on}">
        <div class="pt-2 d-flex justify-end">
          <v-btn small v-on="on" slot="activator" icon><v-icon>mdi-dots-vertical</v-icon></v-btn>
        </div>
        </template>
        <v-list class="text-caption pa-0" v-if="$store.state.userinfo.userInfo && item.authorId === $store.state.userinfo.userInfo.uid">
          <v-list-item>
            <v-btn text @click="openEdit(item)" class="text-caption">
              <v-icon small class="px-1">mdi-pencil</v-icon> 수정
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn text @click="editId = item.id" class="text-caption">
              <v-icon small class="px-1">mdi-delete-outline</v-icon> 삭제
            </v-btn>
          </v-list-item>
        </v-list>
        <v-list class="text-caption pa-0" v-else>
          <v-list-item>
            <v-btn text class="text-caption">
              <v-icon small class="px-1">mdi-flag-outline</v-icon> 신고
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-col>
    </v-row>
  <v-row v-else>
    <div>
      No Comments
    </div>
  </v-row>
</v-container>
</template>
<script>
export default {
  props:['hotClipData'],
  data() {
    return {
      comment:'',
      editId:'',
      comments:[],
      editComment:'',
      dbloading:false,
      commentLoading:false,
    }
  },
  methods:{
    openEdit(el){
      this.editId = el.id
      this.editComment = el.comment;
    },
    closeEdit(){
      this.editComment = '';
      this.editId = '';
    },
    formatDateWithFromNow(el){
      const timeDiff = this.$moment().diff(el);
      return timeDiff > 86400000 ? this.$moment(el).format('l') :this.$moment(el).fromNow();
    },
    async editComments(){

    },
    async addComments(){
      this.dbloading = true;
      this.commentLoading = true;
      let hotclip = this.$firestore.collection('hotclip').doc(this.hotClipData.id);
      let batch = this.$firestore.batch();

      batch.set(hotclip.collection('comments').doc(),{
        authorId: this.$store.state.userinfo.userInfo.uid,
        createdAt: new Date(),
        comment: this.comment,
        profile_image_url: this.$store.state.userinfo.userInfo.photoURL,
        likeCount: 0,
        likeUids:[],
        display_name: this.$store.state.userinfo.userInfo.displayName,
        commentCount:0,
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
            commentCount:item.commentCount,
            display_name: item.display_name,
            profile_image_url: item.profile_image_url,
          })
          this.commentLoading = false;
        })
        this.hotClipData.commentCount += 1;
        this.dbloading = false;
        this.comment = '';
        this.$store.commit('SET_SnackBar',{type:'success', text:'Write comment successfully!'})
      })
    },
    async loadComments(order){
      await this.$firestore.collection('hotclip').doc(this.$route.params.id).collection('comments').orderBy(order,'desc').limit(10).get().then( async (sn) => {
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
          createdAt: item.createdAt.toDate(),

        })
      });
    })
    }
  },
  async created(){
    await this.loadComments('createdAt');

  }
}
</script>
<style>
</style>
