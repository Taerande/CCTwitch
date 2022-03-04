<template>
 <div id="bookmark" v-if="this.$store.state.likedStreamer">
      <v-card>
        <v-card-title class="d-flex justify-center align-center pa-2 pb-0 ma-0">
          <span class="text-body-1">Liked Streamer</span>
        </v-card-title>
          <div class="d-flex grey--text justify-end pr-2 pb-1 text-caption">
            <span class="text-caption" :class="this.$store.state.likedStreamer.length == 10 ? 'red--text' : ''">
            {{this.$store.state.likedStreamer.length}} / 10
            </span></div>
        <v-divider></v-divider>
        <v-card-text class="ma-0 pa-0">
          <v-list v-if="this.$store.state.likedStreamer.length > 0" class="pa-0 ma-0">
            <v-list-item
            dense
            v-for="(item, index) in $store.state.likedStreamer" :key="index">
            <v-row class="d-flex justify-space-between">
            <div>
              <router-link :to="{name: 'Channel',
              query:{
                q: item.login
                },
                params: item}">
                <span class="twitch--text pr-1">
                  {{ item.display_name }}
                </span>
              </router-link>
            </div>
            <div>
                <v-icon @click="deleteFav({index: index, display_name:item.display_name})" class="ml-1" size="16">mdi-close</v-icon>
            </div>
            </v-row>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <div class="d-flex pa-1 flex-column justify-center">
              <v-icon class="ma-1" color="purple" large>mdi-information</v-icon>
              <div class="d-flex justify-center ma-1">
                There's no liked Streamer
              </div>
            </div>
          </v-list>
        </v-card-text>
      </v-card>
  </div>
</template>
<script>
export default {
  data() {
    return {

    };
  },
  methods: {
    deleteFav(el) {
      this.$store.commit('DELETE_LikedStreamer', el);
    },
  },
};
</script>
<style lang="scss">

#bookmark{
  position: fixed;
  width: 150px;
  top: 150px;
  right: 1%;
}

</style>
