<template>
  <div>
    <v-snackbar
      app
      width="100%"
      v-for="(item, index) in $store.state.snackbarArr"
      :key="index"
      :timeout="-1"
      :style="{ 'margin-bottom': `${index * 70 + 70}px` }"
      v-model="item.value"
      :color="item.type"
    >
      <div class="d-flex justify-space-between align-center">
        {{ item.text }}
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
