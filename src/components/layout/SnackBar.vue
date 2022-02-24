<template>
 <v-snackbar
  id="snack-bar"
  timeout="1500"
  v-model="$store.state.snackbar.value"
  :color="$store.state.snackbar.type">
  <div class="d-flex justify-space-between align-center">
    <div>
      {{ $store.state.snackbar.text }}
    </div>
    <v-btn
      icon
      @click="$store.commit('SET_SnackBar',{value: false})">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </div>
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
<style lang="scss" scoped>
#snack-bar{
  position: fixed;
  margin: 0 auto;
  left: 0;
  right: 0%;
  bottom: 15%;
}
</style>
