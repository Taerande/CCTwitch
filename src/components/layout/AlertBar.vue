<template>
 <v-snackbar
  id="snack-bar"
  v-model="$store.state.snackbar.value"
  :color="$store.state.snackbar.type">
  <span>
      {{ $store.state.snackbar.text }}
  </span>
  <v-btn
    icon
    @click="$store.commit('SET_SnackBar',{value: false})"
  >
  <v-icon>mdi-close</v-icon>
  </v-btn>
</v-snackbar>
</template>
<script>
export default {
  data() {
    return {

    };
  },
  methods: {

  },
};
</script>
<style lang="scss">
#snack-bar{
  position: fixed;
  margin: 0 auto;
  left: 0;
  right: 0;
  bottom: 5%;
}
</style>
