<template>
<v-row class="d-flex align-center py-3">
    <v-btn class="text-caption mr-3" :color="clipSort === 'vids' ? 'success' : ''" @click="changeSortType(), $store.commit('SET_DateSort',{text: null, start: null, end: null})">Sort By Vids</v-btn>
    <v-menu
    v-model="menu"
      offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="text-caption"
          :color="clipSort === 'date' ? 'success' : ''"
          v-bind="attrs"
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
      <v-icon color="red" size="1rem">mdi-calendar-range</v-icon> {{setDateFormat($store.state.dateSort)}}
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
        return 'All';
      }
      return `${el.start.substr(0, 10)} ~ ${el.end.substr(0, 10)}`;
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
      return new Date().toISOString();
    },
    todayBeforeDay() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString();
    },
    todayBeforeWeek() {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    },
    todayBeforeMonth() {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toISOString();
    },

  },
  mounted() {
  },

};
</script>
<style lang="">

</style>
