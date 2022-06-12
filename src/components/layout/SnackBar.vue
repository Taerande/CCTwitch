<template>
  <div class="ma-0 pa-0">
    <v-snackbar
      app
      bottom
      left
      :light="$vuetify.theme.dark"
      :dark="!$vuetify.theme.dark"
      max-width="500"
      min-width="270"
      width="inherit"
      v-for="(item, index) in $store.state.snackbarArr"
      :key="index"
      :timeout="-1"
      :style="{ 'margin-bottom': `${index * 55 + 55}px` }"
      v-model="item.value"
    >
      <v-card class="d-flex align-center ma-0 pa-0" flat style="background:none;">
        <v-card-title class="justify-center ma-0 pa-1 pl-2">
          <v-icon class="pa-0 ma-0" v-if="item.type === 'info'" :color="item.type">mdi-information-outline</v-icon>
          <v-icon class="pa-0 ma-0" v-else-if="item.type === 'error'" :color="item.type">mdi-alert-outline</v-icon>
          <v-icon class="pa-0 ma-0" v-else-if="item.type === 'success'" :color="item.type">mdi-check-circle-outline</v-icon>
        </v-card-title>
        <v-card-text class="align-center ma-0 pa-0 text-truncate">
          <div class="text-truncate pa-0 ma-0 align-center">
            <div class="text-truncate">
              {{ item.text }}
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="ma-0 pa-0">
          <v-btn small icon @click="deleteSnacks(index)" class="pa-0 ma-0">
            <v-icon color="error">mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
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
</style>
