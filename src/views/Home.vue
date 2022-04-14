<template>
  <v-container fluid>
    <v-row class="text-center pt-10 justify-center align-center">
      <v-col cols="12">
        <h1 class="display-3 font-weight-bold mb-3">
          Find Your Streamer
        </h1>
      </v-col>
      <Search class="pt-6"></Search>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          {{ $store.state.userInfo }}
        </v-card>
      </v-col>
    </v-row>
    <v-row class="pt-10">
      <v-col>
        <v-card flat class="error">
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>
            <span>Top Trendings</span>
          </v-card-title>
        </v-card>
      </v-col>
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
};
</script>
