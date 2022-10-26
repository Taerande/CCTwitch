<template>
<v-container>
  <v-dialog
    v-model="dialog"
    fullscreen
    transition="none"
    disabled
    persistent>
    <v-overlay>
      <v-container fluid>
        <v-row class="d-block">
          <div class="d-flex justify-center">
            <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
          </div>
          <div>
            Creating Timeline...
          </div>
        </v-row>
      </v-container>
    </v-overlay>
  </v-dialog>
  <v-row class="d-flex align-center py-3">
    <v-btn :block="$vuetify.breakpoint.smAndDown" class="text-caption my-1 pa-2 mr-3" :color="clipSort === 'vids' ? 'twitch' : ''"
    width="100"
    :class="clipSort === 'vids' ? 'white--text' : ''"
    @click="changeSortType()">
    <v-icon small>mdi-video</v-icon>
    <span class="px-1">Vids</span>
    </v-btn>
    <v-menu
      v-model="menu"
      offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          width="100"
          :block="$vuetify.breakpoint.smAndDown"
          class="text-caption mr-3 pa-2 my-1"
          :color="clipSort === 'date' ? 'twitch' : ''"
          v-on="on"
          :class="clipSort === 'date' ? 'white--text' : ''"
        >
        <v-icon small>mdi-calendar</v-icon>
        <span class="px-1" v-if="clipSort === 'date'">
          {{$store.state.dateSort.text}}
        </span>
        <span v-else>
          Date
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
          <DatePickerDialog :dateInfo="{min : this.userInfo.data.created_at, max : $moment().format('YYYY-MM-DD'), type:'custom' }" @ApplyDate="changeDateSort"></DatePickerDialog>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn
    v-if="vidInfo"
    :block="$vuetify.breakpoint.smAndDown"
    @click="createTimeline(vidInfo.data.user_login, vidInfo.data.user_id, vidInfo.data.id)"
    :loading="dbLoading"
    width="100"
    :disabled="clipSort !== 'vids' || vidInfo.data.view_count === -1"
    :color="clipSort === 'vids' ? 'twitch' : ''"
    :class="clipSort === 'vids' ? 'white--text' : ''"
    class="text-caption mr-3 pa-2 my-1" >
    <v-icon small>mdi-timeline</v-icon><span class="px-2">Timeline</span></v-btn>
    <v-btn
    v-else
    :block="$vuetify.breakpoint.smAndDown"
    disabled
    width="100"
    class="text-caption mr-3 pa-2 my-1"
    :color="clipSort === 'vids' ? 'twitch' : ''"
    :class="clipSort === 'vids' ? 'white--text' : ''"
    ><v-icon small>mdi-timeline</v-icon><span class="px-2">Timeline</span></v-btn>
    <v-dialog
    max-width="800"
    v-model="searchDialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
        v-on="on"
        v-bind="attrs"
        width="100"
        :block="$vuetify.breakpoint.smAndDown"
        class="text-caption mr-3 pa-2 my-1"
        :color="clipSort === 'search' ? 'twitch' : ''"
        :class="clipSort === 'search' ? 'white--text' : ''"
        ><v-icon small>mdi-magnify</v-icon><span class="px-2">Keyword</span></v-btn>
      </template>
      <v-card
      >
        <v-card-title class="twitch white--text">
          <v-avatar
            class="pr-1"
            size="36">
            <img :src="userInfo.data.profile_image_url" alt="profile_img">
          </v-avatar>
          <div class="px-1">
            {{userInfo.data.display_name}}님({{userInfo.data.login}})의 클립 검색
          </div>
        </v-card-title>
        <v-card-text class="pa-0 pt-3 px-5">
          <!-- <v-subheader>Keyword</v-subheader> -->
          <v-combobox
            color="twitch"
            v-model="searchKeywords"
            outlined
            multiple
            counter="5"
            deletable-chips
            type="text"
            small-chips
            maxlength="15"
            placeholder="Keyword는 최대 5개, 15자까지 가능합니다."
            label="Keywords"
            clear-icon="mdi-close-circle"
            clearable>
            </v-combobox>
          <DatePickerDialog :dateInfo="{min : this.userInfo.data.created_at, max : $moment().format('YYYY-MM-DD'), type:'search' }" @ApplyDate="changeDateSort"></DatePickerDialog>
        </v-card-text>
        <v-card-actions class="pt-10">
          <v-spacer></v-spacer>
          <v-btn class="text-caption" color="error" depressed @click="searchDialog = false" text>close</v-btn>
          <v-btn class="text-caption" color="success" depressed @click="sortTypeSearch(), searchDialog = false" :disabled="searchKeywords.length === 0" text>search</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
  <v-row v-if="$store.state.dateSort.text !== 'vids' && $store.state.dateSort.text !== null" class="pt-3">
    <v-icon class="px-1" color="error">mdi-calendar</v-icon>
    <div class="d-flex justify-center align-center text-subtitle-2 red--text" v-if="$store.state.dateSort.start === null">
      All Time
    </div>
    <div class="d-flex justify-center align-center text-subtitle-2 red--text" v-else>
      {{`${$moment($store.state.dateSort.start).format('ll')} ~ ${$moment($store.state.dateSort.end).format('ll')} `}}
    </div>
  </v-row>
  <div class="d-flex pt1 align-center text-caption red--text" v-if="$store.state.dateSort.text === 'search'">
    (조회수가 1인 클립은 수집하지 않습니다.)
  </div>
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
      rule:{
        required: (value) => !!value || 'Required.',
        counter: (value) => value.length <= 15 || 'Max 15 characters',
      },
      menu: false,
      dbLoading: false,
      dialog: false,
      searchDialog: false,
      searchString: '',
      searchData:{
        text:'search',
        start:null,
        end:null,
      },
      searchKeywords:[],
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
      if(el.text === 'search'){
        this.searchData.start = el.start;
        this.searchData.end = el.end;
      } else {
        const asd = () => {
          this.$emit('changeSort', '');
          this.menu = false;
        };
        await asd();
        this.$emit('changeSort', 'date');
        this.$store.commit('SET_DateSort', el);
      }
    },
    async sortTypeSearch() {
      // if(this.searchString === ''){
      //   return this.$store.commit('SET_SnackBar',{type:'error', text:'Form is not valid!', value:true});
      // }
      const asd = () => {
        this.$emit('changeSort', '');
        this.menu = false;
      };
      await asd();
      this.$store.commit('SET_ClipSearchKeywords',this.searchKeywords);
      this.$store.commit('SET_DateSort', this.searchData);
      this.$emit('changeSort', 'search');
      this.$store.commit('SET_ClipKeyword',this.searchString);
    },
    async createTimeline(user_login, broadcaster_id, vidId){
      this.dialog = true;
      this.dbLoading = true;
      this.$store.commit('SET_SnackBar',{type:'info', text:'Timeline 생성은 1분 정도 소요됩니다.', value:true});
      await axios.post(this.$store.state.backendUrl+'/timeLine/timeline',{
        user_login: user_login,
        broadcaster_id: broadcaster_id,
        vidId: vidId,
        isLive: this.vidInfo.data.is_live === undefined ? 'off' : 'live',
        appAccessToken: `${this.$store.state.headerConfig.Authorization}`,
      }).then((res) => {
        this.$router.push(`/timeline/${res.data.id}`).catch(()=>{})
        this.$store.commit('SET_SnackBar', {type:'success', text:`${res.data.message}`, value:true})
        this.dbLoading = false;
        this.dialog = false;

      }).catch((err)=>{
          this.$store.commit('SET_SnackBar', {type:'error', text:`${err.message}`, value:true})
          this.$store.commit('SET_SnackBar', {type:'error', text:`${res.data.message}`, value:true})
          this.dialog = false;
          this.dbLoading = false;
      })
    },
    async changeSortType(el) {
      if(this.clipSort === 'vids'){
        this.$emit('openVidsListDialog');
      } else {
      const asd = () => {
        this.$emit('changeSort', '');
        this.menu = false;
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
  watch:{
    searchKeywords (val) {
      if (val.length > 5) {
        this.$nextTick(() => this.searchKeywords.pop())
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
  destroyed() {
    this.$store.commit('SET_DateSort', {
      text:null,
      start:null,
      end:null,
    });
  },
};
</script>
<style>

</style>
