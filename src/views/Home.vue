<template>
  <v-container fluid>
    <v-row class="d-flex justify-center pt-10">
      <div class="text-h1 font-weight-bold">
        <v-icon color="twitch" size="120">mdi-twitch</v-icon>
        <span class="twitch--text text-h1 font-weight-bold">C</span>ollect
        <span class="twitch--text text-h1 font-weight-bold">C</span>lip
        <span class="twitch--text text-h1 font-weight-bold">Twitch</span>
      </div>
    </v-row>
    <v-row class="text-center pt-10 justify-center align-center">
      <v-col cols="12">
        <h1 class="display-3 font-weight-bold mb-3">
          Find Your Streamer
        </h1>
      </v-col>
      <Search class="pt-6"></Search>
    </v-row>

    <v-row v-if="$store.state.userinfo.userInfo">
      <v-col>
        <v-card flat>
          <v-avatar
            size="36">
            <v-img :src="$store.state.userinfo.userInfo.photoURL">
            </v-img>
          </v-avatar>
          {{ $store.state.userinfo.userInfo.displayName }}님 환영합니다.
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
