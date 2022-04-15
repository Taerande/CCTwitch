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
        <v-spacer></v-spacer>
        <v-icon @click="dialog = false" color="error">mdi-close</v-icon>
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
        <div v-if="dates[0] !== undefined" class="d-flex justify-center pt-3 text-title red--text">
          {{`${dates[0]=== undefined ? '' : this.$moment(dates[0]).format('ll')} ~ ${dates[1]=== undefined ? '' : this.$moment(dates[1]).format('ll')}`}}
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
        start: this.$moment(el[0]).toISOString(),
        end: this.$moment(el[1]).add(86399,'seconds').toISOString(),
      });
      console.log(this.$store.state.dateSort);
    },
  },
  mounted() {
  },

};
</script>
<style lang="scss">
</style>
