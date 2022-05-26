<template>
  <div>
    <v-snackbar
      app
      max-width="1280"
      min-width="300"
      v-for="(item, index) in $store.state.snackbarArr"
      :key="index"
      :timeout="-1"
      multi-line
      :style="{ 'margin-bottom': `${index * 70 + 70}px` }"
      v-model="item.value"
    >
      <div class="d-flex align-center text-truncate" style="{max-width:1280px; min-width: 300px; }">
        <div>
          <v-icon v-if="item.type === 'info'" :color="item.type">mdi-information-outline</v-icon>
          <v-icon v-else-if="item.type === 'error'" :color="item.type">mdi-alert-outline</v-icon>
          <v-icon v-else-if="item.type === 'success'" :color="item.type">mdi-check-circle-outline</v-icon>
        </div>
        <div class="pl-1 text-truncate">
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
<style lang="scss" scoped></style>
