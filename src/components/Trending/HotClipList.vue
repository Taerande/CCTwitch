<template lang="">
<v-container fluid>
  <v-row class="d-flex col-12" v-if="!loading">
    <v-col  class="pa-2" cols="6" xl="2" lg="3" md="3" sm="4" v-for="(item, idx) in  24" :key="idx">
      <v-skeleton-loader
            type="image, list-item-two-line"
          ></v-skeleton-loader>
    </v-col>
  </v-row>
  <v-row class="d-flex pt-5 col-12" v-else-if="hotclips.length > 0 && loading">
    <v-col class="pa-2" cols="6" xl="2" lg="3" md="3" sm="4" v-for="(item) in hotclips" :key="item.id">
      <v-card :to="{path:`/hotclip/${item.id}`,params:{title:item.title}}" flat>
        <v-card-text class="pa-0 ma-0">
          <v-img
          :src="item.thumbnail_url"
          lazy-src="@/assets/img/404.jpg"
          >
          </v-img>
        </v-card-text>
      </v-card>
      <div>{{item.title}}</div>
    </v-col>
  </v-row>
  <v-row v-else-if="hotclips.length === 0 && loading" class="absolute-center">
    <v-alert type="error">
      There is no Hot Clip!
    </v-alert>
  </v-row>
</v-container>
</template>
<script>

export default {
  data() {
    return {
      loading: false,
      hotclips:[],

    }
  },
  methods: {

  },
  async created() {
    const sn = await this.$firestore.collection('hotclip').orderBy('createdAt','desc').get();

    let ids = sn.docs.map((v) => {
      return v.id
    })

    sn.docs.forEach(el => {
      const item = el.data();

      this.hotclips.push({
        id: el.id,
        broadcaster_id: item.broadcaster_id,
        commentCount: item.commentCount,
        likeCount: item.likeCount,
        tags: item.tags,
        title: item.title,
        thumbnail_url: item.thumbnail_url
      })

    });

    this.loading = true;


  },

}
</script>
<style>

</style>
