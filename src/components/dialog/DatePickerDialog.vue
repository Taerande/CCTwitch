<template>
  <v-dialog
    v-model="dialog">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item-title
      v-bind="attrs"
      v-on="on"
      >Custom</v-list-item-title>
    </template>
    <v-card class="justify-center">
        <v-date-picker
          v-model="dates"
          range
          landscape
          locale="ko-KR"
          show-current
          :min="this.dateInfo.min"
          :max="this.dateInfo.max"
        ></v-date-picker>
        <v-btn @click="ApplyDate(dates), dialog = false">Apply</v-btn>
        <v-btn @click="dates = []">Reset</v-btn>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: ['dateInfo'],
  data() {
    return {
      dates: [],
      dialog: false,
    };
  },
  methods: {
    async ApplyDate(el) {
      const orderDates = () => {
        this.dates.sort((a, b) => new Date(a) - new Date(b));
      };
      await orderDates();
      this.$emit('ApplyDate', {
        text: 'Custom Period',
        start: new Date(el[0]).toISOString(),
        end: new Date(el[1]).toISOString(),
      });
    },
  },
  mounted() {
  },

};
</script>
<style lang="scss">
</style>
