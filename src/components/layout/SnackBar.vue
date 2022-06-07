<template>
  <div>
    <v-snackbar
      app
      dark
      outlined
      width="50%"
      max-width="500"
      v-for="(item, index) in $store.state.snackbarArr"
      :key="index"
      :timeout="-1"
      :style="{ 'margin-bottom': `${index * 55 + 55}px` }"
      v-model="item.value"
    >
      <div class="d-flex text-truncate pa-0 ma-0 align-center">
        <v-icon v-if="item.type === 'info'" :color="item.type">mdi-information-outline</v-icon>
        <v-icon v-else-if="item.type === 'error'" :color="item.type">mdi-alert-outline</v-icon>
        <v-icon v-else-if="item.type === 'success'" :color="item.type">mdi-check-circle-outline</v-icon>
        <!-- </div>
        <div class="pa-0 ma-0 d-flex align-center"> -->
        <div class="pl-1 d-block text-truncate" style="width:90%">
          {{ item.text }}
        </div>
        <v-spacer></v-spacer>
        <v-btn icon @click="deleteSnacks(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </div>
</template>
<script>
export default {
  data() {
    return {
    }
  },
  methods: {
    deleteSnacks(i) {
      this.$store.commit('DELETE_snackBar',i);
    },
  },
  mounted() {
  },
}
</script>
<style lang="scss" scoped>
.v-snack__wrapper{
  display: block;
}

</style>
