<template>
<div>

  <v-form
    v-if="$vuetify.breakpoint.lgAndUp"
    class="d-flex align-center justify-center"
    @submit.prevent="searchChannel(searchString)">
      <v-text-field
      v-model="searchString"
      outlined
      color="twitch"
      @click:append="searchChannel(searchString)"
      hide-details="auto"
      solo
      type="text"
      dense
      size="20"
      label="Search your Streamer" append-icon="mdi-magnify">
    </v-text-field>
  </v-form>
  <v-dialog
    v-model="$store.state.searchBar"
    max-width="500px"
    transition="dialog-transition"
  >
  <template v-slot:activator="{on}">
    <v-icon v-show="$vuetify.breakpoint.mdAndDown" color="white" v-on="on">mdi-magnify</v-icon>
  </template>
  <v-card>
    <v-card-title class="pa-3 info">
        Search Streamer
    </v-card-title>
    <v-card-text class="py-3">
      <v-form
       @submit.prevent="searchChannel(searchString)">
        <v-text-field
          v-model="searchString"
          outlined
          hide-details
          :rules="[rule.required]"
          color="twitch"
          @click:append="searchChannel(searchString)"
          full-width
          label="Search your Streamer" append-icon="mdi-magnify">
        </v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-spacer></v-spacer>
      <v-btn color="error" text @click="changeSearchBar(false)">close</v-btn>
      <v-btn color="success" @click="searchChannel(searchString)"
      :disabled="searchString === ''"
      text>search</v-btn>
    </v-card-actions>
  </v-card>
  </v-dialog>
</div>
</template>
<script>
import { mapState } from 'vuex'
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      dialog: false,
      rule:{
        required: (value) => !!value || 'Required.',
      }
    };
  },
  computed:{
    ...mapState({
      searchBar: 'searchBar',
    }),
    searchString:{
      get() {
        return this.$store.state.searchString
      },
      set(v) {
        this.$store.commit('SET_SearchString',v)
      }
    }

  },
  methods: {
    ...mapMutations({
      changeSearchBar: 'SET_SearchBar',
    }),
    async searchChannel(el) {
      if(el === '' || null){ return }
      this.$router.push({
        path: '/search',
        query: {
          q: el,
        },
        params: {
          q: el,
        },
      }).catch(()=>{});

      this.changeSearchBar(false);
    },

  },
};
</script>
<style lang="scss" scoped>
#input-368{
  padding: 0;
}

</style>
