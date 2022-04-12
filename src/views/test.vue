<template>
<v-container>
  <v-row v-for="(item,i) in items" :key="i">
    <v-btn @click="addSnackBar()">{{item.data}}</v-btn>
  </v-row>

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

</v-container>
</template>
<script>
export default {
  data() {
    return {
      items: [
        { data: '1st Snack', type: 'info', value: true },
        { data: '2nd Snack', type: 'error', value: true },
        { data: '3rd Snack', type: 'success', value: true },
        { data: '4th Snack', type: 'primary', value: true },
      ],
      snackbarQue: [],
    };
  },
  methods: {
    addSnackBar() {

    },

  },
};
</script>
<style lang="scss" scoped>
#snack-bar{
  position: fixed;
  margin: 0 auto;
  left: 0;
  right: 0%;
  bottom: 85%;
}
</style>
