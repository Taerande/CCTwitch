<template>
<v-container fluid>
  <v-row class="py-5 align-baseline">
    <span class="text-h3 font-weight-bold pr-3">Timeline | All</span>
  </v-row>
  <v-divider></v-divider>
  <v-row v-if="loading" class="absolute-center">
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
  </v-row>
  <v-row class="d-block justify-center pt-5" v-else>
    <v-row class="d-flex justify-center pt-5">
      <v-data-table
      dense
      :headers="headers"
      :items="timelines"
      :page.sync="page"
      :items-per-page="50"
      item-key="name"
      hide-default-footer
      mobile-breakpoint="100"
    >
    <template v-slot:item.thumbnail_url="{ item }">
    <v-img
    width="100"
    :src="item.thumbnail_url"
    >
    </v-img>
    </template>
    <template v-slot:item.index="{item}">
    <span>{{item.index}}</span>
    </template>
    <template v-slot:item.title="{item}">
    <div class="twitch--text hoverCursor" @click="toTimeline(item.id)">{{item.title}}</div>
    </template>
    <template v-slot:no-data>
      <div>
        😫No Data
      </div>
    </template>


    </v-data-table>

    </v-row>
    <v-pagination :length="pageCount" v-model="page"></v-pagination>
  </v-row>
</v-container>
</template>

<script>
export default {
  components: {
  },
  data() {
    return {
      page:1,
      loading:false,
      pageCount:0,
      timelines:[],
      headers:[
        {
          text: 'No.',
          value: 'index',
        },
        {
          text: 'Thumbnail',
          value: 'thumbnail_url',
        },
        {
          text: 'Vids Date',
          value: 'vidCreatedAt',
        },
        {
          text: 'broadcaster',
          value: 'broadcaster',
        },
        {
          text: 'Title',
          value: 'title',
        },
        {
          text: 'Clips',
          value: 'clipCount',
        },
        {
          text: 'Updated',
          value: 'updatedAt'
        },
      ],
    };
  },
  computed:{
  },
  methods: {
    toTimeline(el){
      this.$router.push({path:`/timeline/${el}`}).catch(()=>{});
    },
  },
  async created(){
    document.title = 'Timelines - CCTWITCH';
    const sn = await this.$firestore.collection('timeline').get();
    const meta = await this.$firestore.collection('metadata').doc('timeline').get();

    console.log(meta.data());



    // if(sn.docs.length == 24){
      sn.docs.forEach((el,idx) => {
        const item = el.data();
        this.timelines.push({
          id: el.id,
          index: idx,
          clipCount: item.clipCount,
          title: item.vidTitle,
          viewCount: item.viewCount,
          createdAt: this.$moment(item.createdAt.toDate()).format('l'),
          updatedAt: this.$moment(item.updatedAt.toDate()).fromNow(),
          vidCreatedAt: this.$moment(item.vidCreated).format('l'),
          broadcaster: item.broadcaster,
          thumbnail_url: item.thumbnail_url,
        })

      })

    // }
  },
   mounted() {
  },
  destroyed() {
  },
};
</script>
<style lang="scss" scoped>

</style>
