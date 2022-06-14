<template>
<v-container>
  <v-row class="d-flex align-center py-3">
    <v-btn :block="$vuetify.breakpoint.smAndDown" class="text-caption pa-2 mr-3" :color="clipSort === 'vids' ? 'twitch' : ''"
    :class="clipSort === 'vids' ? 'white--text' : ''"
    @click="changeSortType()">
    <v-icon small>mdi-video</v-icon>
    <span class="px-1">Sort By Vids</span>
    </v-btn>
    <v-menu
      v-model="menu"
      offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          :block="$vuetify.breakpoint.smAndDown"
          class="text-caption mr-3 pa-2"
          :color="clipSort === 'date' ? 'twitch' : ''"
          v-on="on"
          :class="clipSort === 'date' ? 'white--text' : ''"
        >
        <v-icon small>mdi-calendar</v-icon>
        <span class="px-1">
          {{$store.state.dateSort.text === null ? "Sort By Date" : $store.state.dateSort.text}}
        </span>
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
    <v-btn
    v-if="vidInfo && $store.state.userinfo.userInfo"
    :block="$vuetify.breakpoint.smAndDown"
    @click="createTimeline(vidInfo.data.user_login, vidInfo.data.user_id, vidInfo.data.id)"
    :loading="dbLoading"
    :color="clipSort === 'vids' ? 'twitch' : ''"
    :class="clipSort === 'vids' ? 'white--text' : ''"
    class="text-caption mr-3 pa-2" :disabled="vidInfo.data.is_live === 'live' || clipSort === 'date'">
    <v-icon small>mdi-timeline</v-icon><span class="px-2">{{vidInfo.data.is_live ? "Disabled when live" : 'Sort By Timeline'}}</span></v-btn>
    <v-btn
    v-else
    :block="$vuetify.breakpoint.smAndDown"
    @click="$store.commit('SET_SignInDialog', true)"
    class="text-caption mr-3 pa-2"
    :color="clipSort === 'vids' ? 'twitch' : ''"
    :class="clipSort === 'vids' ? 'white--text' : ''"
    ><v-icon small>mdi-timeline</v-icon><span class="px-2">Sort By Timeline</span></v-btn>
  </v-row>
  <v-row>
    <div v-if="clipSort === 'date'" class="py-1 red--text text-subtitle-2">
        <v-icon color="error" size="1rem">mdi-calendar-range</v-icon> {{setDateFormat($store.state.dateSort)}}
    </div>
  </v-row>
</v-container>
</template>

<script>
import DatePickerDialog from '@/components/dialog/DatePickerDialog.vue';
import axios from 'axios';

export default {
  props: ['userInfo', 'clipSort', 'vidInfo'],
  components: {
    DatePickerDialog,
  },
  data() {
    return {
      menu: false,
      dbLoading: false,
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
    async createTimeline(user_login, broadcaster_id, vidId){
      this.$store.commit('SET_SnackBar',{type:'info', text:'Timeline 생성은 1분 정도 소요됩니다.', value:true});
      this.dbLoading = true;
      await axios.post(this.$store.state.backendUrl+'/timeLine/timeline',{
        user_login: user_login,
        broadcaster_id: broadcaster_id,
        vidId: vidId,
        appAccessToken: `${this.$store.state.headerConfig.Authorization}`,
      }).then((res) => {
        this.$router.push(`/timeline/${res.data.id}`).catch(()=>{})
        this.$store.commit('SET_SnackBar', {type:'success', text:`${res.data.message}`, value:true})
        this.dbLoading = false;
      }).catch(()=>{
          this.dbLoading = false;
      })
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
