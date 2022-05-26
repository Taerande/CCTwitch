<template>
<v-container>
  <v-row class="d-flex align-center py-5">
    <div class="text-h3 font-weight-bold pr-3">
      User |
    </div>
    <v-avatar
      size="60"
    > <img :src="userInfo.profile_image_url">
    </v-avatar>
    <div class="text-h4 font-weight-bold">
      {{userInfo.display_name}}
    </div>
  </v-row>
  <v-divider></v-divider>
  <v-subheader>Created Cliplist</v-subheader>
  <v-row>
    <v-col cols="12" xl="3" lg="4" md="4" sm="6" xs="12" v-for="(item, index) in cliplists" :key="index">
      <CliplistDefaultVue :item="item"></CliplistDefaultVue>
    </v-col>
  </v-row>
</v-container>
</template>
<script>
import CliplistDefaultVue from '../CliplistDefault.vue';



export default {
  components:{
    CliplistDefaultVue
  },
  data() {
    return {
      cliplists:[],
      userInfo:'',
    }
  },
  methods: {

  },
  async created() {
    const docRef = await this.$firertdb.ref('/users/'+`twitch:${this.$route.params.id}`+'/publicData');
    await docRef.get().then(async (sn)=>{
      if(sn.exists()){
        this.userInfo = await sn.val();
        document.title = `${this.userInfo.display_name} | User - CCTWITCH`
      }
    });
    const sn = await this.$firestore.collection('cliplist').where('authorId','==',`twitch:${this.$route.params.id}`).where('isPublic','==',2).orderBy('createdAt','desc').get();
    this.cliplists = sn.docs.map( (v) => {
          const item = v.data();
          return {
            id: v.id,
            title: item.title,
            description: item.description,
            createdAt: item.createdAt.toDate(),
            display_name: item.authorName,
            clipIds: item.clipIds,
            color: item.color,
            thumbnail_url: item.thumbnail_url,
            tags: item.tags,
            clipCount: item.clipCount,
            viewCount: item.viewCount,
            likeCount: item.likeCount,
          }
        })
  },

}
</script>
<style lang="scss" scoped>
</style>
