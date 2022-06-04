<template>
<v-container>
  <v-row class="d-flex align-center py-3">
    <v-btn class="text-caption mr-3" :color="clipSort === 'vids' ? 'twitch' : ''"
    :class="clipSort === 'vids' ? 'white--text' : ''"
    @click="changeSortType()">Sort By Vids</v-btn>
    <v-menu
      v-model="menu"
      offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          class="text-caption"
          :color="clipSort === 'date' ? 'twitch' : ''"
          v-on="on"
          :class="clipSort === 'date' ? 'white--text' : ''"
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
  </v-row>
  <v-row>
    <div v-if="this.clipSort === 'date'" class="py-1 red--text text-subtitle-2">
        <v-icon color="error" size="1rem">mdi-calendar-range</v-icon> {{setDateFormat($store.state.dateSort)}}
    </div>
  </v-row>
</v-container>
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
        return 'All Time';
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
      if(this.clipSort === 'vids'){
        this.$emit('openVidsListDialog');
      } else {
        const asd = () => {
        this.$emit('changeSort', '');
      };
      await asd();
      this.$store.commit('SET_DateSort', {
        text: null,
        start: null,
        end: null,
      });
      this.$emit('changeSort', 'vids');
      }
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
