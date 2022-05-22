<template>
<v-row class="d-flex align-center py-3">
    <v-btn class="text-caption mr-3" :color="clipSort === 'vids' ? 'success' : ''" @click="changeSortType()">Sort By Vids</v-btn>
    <v-menu
      v-model="menu"
      offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          class="text-caption"
          :color="clipSort === 'date' ? 'success' : ''"
          v-on="on"
        >
          {{$store.state.dateSort.text === null ? "Sort By Date" : $store.state.dateSort.text}}
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="changeDateSort({
          text: '24Hours',
          start: todayBeforeDay,
          end: today,
        })">
          <v-list-item-title>24Hour</v-list-item-title>
        </v-list-item>
        <v-list-item @click="changeDateSort({
          text: 'Week',
          start: todayBeforeWeek,
          end: today,
        })">
          <v-list-item-title>Week</v-list-item-title>
        </v-list-item>
        <v-list-item @click="changeDateSort({
          text: 'Month',
          start: todayBeforeMonth,
          end: today,
        })">
          <v-list-item-title>Month</v-list-item-title>
        </v-list-item>
        <v-list-item @click="changeDateSort({
          text: 'Year',
          start: todayBeforeYear,
          end: today,
        })">
          <v-list-item-title>Year</v-list-item-title>
        </v-list-item>
        <v-list-item @click="changeDateSort({
          text: 'All',
          start: null,
          end: null,
        })">
          <v-list-item-title>All</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <DatePickerDialog :dateInfo="{min : this.userInfo.data.created_at, max : today }" @ApplyDate="changeDateSort"></DatePickerDialog>
        </v-list-item>
      </v-list>
    </v-menu>
    <div v-if="this.clipSort === 'date'" class="pl-3 red--text text-caption">
      <v-icon color="error" size="1rem">mdi-calendar-range</v-icon> {{setDateFormat($store.state.dateSort)}}
    </div>
</v-row>
</template>

<script>
import DatePickerDialog from '@/components/dialog/DatePickerDialog.vue';

export default {
  props: ['userInfo', 'clipSort'],
  components: {
    DatePickerDialog,
  },
  data() {
    return {
      menu: false,
    };
  },
  methods: {
    setDateFormat(el) {
      if (el.text === 'All') {
        return '전체';
      }
      return `${this.$moment(el.start).format('ll')} ~ ${this.$moment(el.end).format('ll')}`;
    },
    async changeDateSort(el) {
      const asd = () => {
        this.$emit('changeSort', '');
        this.menu = false;
      };
      await asd();
      this.$emit('changeSort', 'date');
      this.$store.commit('SET_DateSort', el);
    },
    async changeSortType() {
      const asd = () => {
        this.$emit('changeSort', '');
      };
      await asd();
      this.$emit('changeSort', 'vids');
    },
  },
  computed: {
    today() {
      return this.$moment().toISOString();
    },
    todayBeforeDay() {
      return this.$moment().subtract(1, 'd').toISOString();
    },
    todayBeforeWeek() {
      return this.$moment().subtract(7, 'd').toISOString();
    },
    todayBeforeMonth() {
      return this.$moment().subtract(1, 'month').toISOString();
    },
    todayBeforeYear() {
      return this.$moment().subtract(1, 'year').toISOString();
    },

  },
  mounted() {
  },

};
</script>
<style lang="">

</style>
