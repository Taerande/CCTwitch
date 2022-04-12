<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    >
    <template v-slot:activator="{ on, attrs }">
      <v-list-item-title
      v-bind="attrs"
      v-on="on"
      >Custom</v-list-item-title>
    </template>
    <v-card class="justify-center">
      <v-card-title class="info">
        Select Date
      </v-card-title>
      <v-card-text class="pt-5">
        <v-date-picker
          v-model="dates"
          range
          scrollable
          landscape
          locale="ko-KR"
          show-current
          :min="this.dateInfo.min"
          :max="this.dateInfo.max"
        ></v-date-picker>
        <div v-if="dates[0] !== undefined">
          {{`${dates[0]=== undefined ? '' : dates[0]}~${dates[1]=== undefined ? '' : dates[1]}`}}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="ApplyDate(dates), dialog = false">Apply</v-btn>
        <v-btn @click="dates = []">Reset</v-btn>
      </v-card-actions>
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
