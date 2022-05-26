<template>
  <v-container fluid>
    <v-row class="py-3">
      <v-col class="d-flex justify-center">
        <span class="twitch--text text-h3 font-weight-bold">
          CCTwitch
        </span>
      </v-col>
    </v-row>
    <v-row class="text-center justify-center align-center">
      <v-col cols="12">
        <h1 class="display-3 font-weight-bold mb-3">
          Find Your Streamer
        </h1>
      </v-col>
      <Search class="pt-6"></Search>
    </v-row>
    <v-row class="pt-3">
      <v-col>
        <v-card>
          <v-card-title>
            <span>Top Trendings</span>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
     <v-row class="d-flex pt-3 px-3">
      <div class="text-h2 font-weight-bold">
        <div>
          <span class="twitch--text text-h1 font-weight-bold">C</span>lip
        </div>
        <div>
          <span class="twitch--text text-h1 font-weight-bold">C</span>ollect for
        </div>
        <div>
          <span class="twitch--text text-h1 font-weight-bold">TWITCH</span>
        </div>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import Search from '../components/Search';
export default {
  name: 'Home',

  components: {
    Search,
  },
  data() {
    return {

    };
  },
  methods: {

  },
  mounted(){
    document.title = 'Welcome CCTWITCH'
  }
};
</script>
