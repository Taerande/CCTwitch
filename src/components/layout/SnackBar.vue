<template>
  <div>
    <v-snackbar
      app
      width="100%"
      min-width="300px"
      v-for="(item, index) in $store.state.snackbarArr"
      :key="index"
      :timeout="-1"
      :style="{ 'margin-bottom': `${index * 70 + 70}px` }"
      v-model="item.value"
      :color="item.type"
    >
      <div class="d-flex justify-space-between align-center">
        <span class="text-truncate">
          <v-icon v-if="item.type === 'info'">mdi-information-outline</v-icon>
          <v-icon v-else-if="item.type === 'error'">mdi-alert-outline</v-icon>
          <v-icon v-else-if="item.type === 'success'">mdi-check-circle-outline</v-icon>
          <span class="pl-1 text-truncate">
            {{ item.text }}
          </span>
        </span>
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
}
</script>
<style lang="scss" scoped></style>
