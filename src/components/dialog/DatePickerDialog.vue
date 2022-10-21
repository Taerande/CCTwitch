<template>
  <v-dialog
    v-model="dialog"
    max-width="720"
    >
    <template v-slot:activator="{ on, attrs }">
      <v-list-item-title
      v-bind="attrs"
      v-on="on"
      >Custom</v-list-item-title>
    </template>
    <v-card class="justify-center pa-0 ma-0">
      <v-card-text class="justify-center pa-0 ma-0">
        <v-date-picker
        class="d-flex justify-center"
          v-model="dates"
          color="twitch"
          range
          full-width
          locale="ko-KR"
          show-current
          :min="this.dateInfo.min"
          :max="this.dateInfo.max"
        ></v-date-picker>
        <div v-if="dates[0] !== undefined" class="d-flex justify-center pt-3 text-title red--text">
          {{`${dateReuslt[0]=== undefined ? '' : this.$moment(dateReuslt[0]).format('ll')} ~ ${dateReuslt[1]=== undefined ? '' : this.$moment(dateReuslt[1]).format('ll')}`}}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="error" @click="dialog = false">close</v-btn>
        <v-btn text :disabled="dates.length < 2" color="success" @click="ApplyDate(dateReuslt), dialog = false">Apply</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>

export default {
  props: ['dateInfo'],
  data() {
    return {
      dates:[],
      dialog: false,
    };
  },
  methods: {
    ApplyDate(el) {
      this.$emit('ApplyDate', {
        text: 'Custom',
        start: this.$moment(el[0]).toISOString(),
        end: this.$moment(el[1]).add(86399,'seconds').toISOString(),
      });
    },
  },
  computed:{
    dateReuslt(){
      if(this.dates.length === 2){
        return (new Date(this.dates[0]) - new Date(this.dates[1])) > 0 ? [this.dates[1], this.dates[0]] : this.dates;
      }
      return this.dates
    }

  },
  mounted() {
  },

};
</script>
<style lang="scss">
</style>
