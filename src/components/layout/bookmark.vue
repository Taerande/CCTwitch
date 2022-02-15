<template>
 <div id="bookmark">
      <v-card>
        <v-card-title class="d-flex justify-center align-center pa-2 pb-0 ma-0">
          Liked Streamer
        </v-card-title>
          <div class="d-flex grey--text justify-end pr-2 pb-1 text-caption">
            <span :class="$store.state.likedStreamer.length == 10 ? 'red--text' : ''">
            {{$store.state.likedStreamer.length}} / 10
            </span></div>
        <v-divider></v-divider>
        <v-card-text class="ma-0 pa-0">
          <v-list v-if="$store.state.likedStreamer.length > 0" class="pa-0 ma-0">
            <v-list-item
            dense
            v-for="(item, index) in $store.state.likedStreamer" :key="index">
             <router-link :to="{name: 'Channel',
             query:{
               q: item.id
              },
              params: item}">
              <span class="d-flex align-center twitch--text">
                <span class="pr-1">
                {{ item.display_name }}
                </span>
              <v-icon size="15" color="red" v-if="item.is_live">
                mdi-broadcast
              </v-icon>
              </span>
            </router-link>
                <v-icon @click="deleteFav(index)" class="ml-1" size="16">mdi-close</v-icon>
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
  width: 220px;
  top: 100px;
  right: 5%;
}

</style>
