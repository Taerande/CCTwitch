<template>
  <v-container fluid fill-height>
    <v-row class="text-center pt-10">
      <v-col cols="12">
        <h1 class="display-4 font-weight-bold mb-3">
          Find Your Streamer
        </h1>
      </v-col>
    </v-row>
    <v-row class="d-flex justify-center align-center pt-10">
      <search></search>
    </v-row>
    <v-row>
      <v-card>
          <v-card-title>
            Recent Search
          </v-card-title>
      </v-card>
    </v-row>
    <v-row>
      <v-card>
        <v-card-title>
          Clip lists
        </v-card-title>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import search from '@/components/Search.vue';

export default {
  components: {
    search,
  },
  name: 'HelloWorld',
  data() {
    return {

    };
  },
  created() {
  },
};
</script>
<style lang="scss" scoped>
// .row{
//   margin: 0;
//   display: flex !important;
//   justify-content: center !important;
//   padding-top: 50px !important;
// }

</style>
