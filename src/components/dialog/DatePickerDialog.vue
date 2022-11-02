<template>
  <v-dialog
    @click:outside="dialog = false"
    v-model="dialog"
    max-width="720"
    >
    <template v-slot:activator="{ on, attrs }">
      <v-list-item-title
        v-if="dateInfo.type === 'custom'"
        v-bind="attrs"
        v-on="on"
      >Custom</v-list-item-title>
      <v-input
        v-else-if="dateInfo.type === 'search'"
        class="d-flex align-center mx-3"
        :hide-details="true"
      >
      <template v-slot:default>
        <div @click="dialog = true" v-if="dates[0] !== undefined" class="red--text text-caption hoverCursor align-center" style="width:100%;">
          {{`${dateReuslt[0]=== undefined ? '' : $moment(dateReuslt[0]).format('ll')} ~ ${dateReuslt[1]=== undefined ? '' : $moment(dateReuslt[1]).format('ll')}`}}
          <v-divider></v-divider>
        </div>
        <div @click="dialog = true" v-else class="red--text text-caption hoverCursor align-center" style="width:100%;">
          All Time
          <v-divider></v-divider>
        </div>
      </template>
      <template v-slot:prepend>
        <v-icon color="error" @click="dialog = true">mdi-calendar</v-icon>
      </template>
      <template v-slot:append v-if="dates.length === 2">
        <v-icon color="primary" @click="resetDate()">mdi-refresh</v-icon>
      </template>
      </v-input>
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
          @change="changeDetect()"
          show-current
          :min="this.dateInfo.min"
          :max="this.dateInfo.max"
        ></v-date-picker>
        <div v-if="dates[0] !== undefined" class="d-flex justify-center pt-3 text-title red--text">
          <v-icon color="error" class="pr-2">mdi-calendar</v-icon>{{`${dateReuslt[0]=== undefined ? '' : $moment(dateReuslt[0]).format('ll')} ~ ${dateReuslt[1]=== undefined ? '' : $moment(dateReuslt[1]).format('ll')}`}}
        </div>
        <div v-else class="d-flex justify-center pt-3 text-title red--text">
          <v-icon color="error" class="pr-2">mdi-calendar</v-icon>
          All time
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="text-caption" text color="error" @click="dialog = false">close</v-btn>
        <v-btn class="text-caption" text :disabled="dates.length < 2" color="success" @click="ApplyDate(dateReuslt), dialog = false">Apply</v-btn>
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
    changeDetect(){
      if(this.dateInfo.type === 'search'){
        this.ApplyDate(this.dateReuslt);
      }
    },
    resetDate(){
      this.dates = [];
      this.$emit('ApplySearchDate',{
        text:this.dateInfo.type,
        start:null,
        end:null,
      })
    },
    ApplyDate(el) {
      if(this.dateInfo.type === 'custom'){
        this.$emit('ApplyDate', {
          text: this.dateInfo.type,
          start: this.$moment(el[0]).toISOString(),
          end: this.$moment(el[1]).add(86399,'seconds').toISOString(),
        });
      } else if(this.dateInfo.type === 'search'){
        this.$emit('ApplySearchDate', {
          text: this.dateInfo.type,
          start: this.$moment(el[0]).toISOString(),
          end: this.$moment(el[1]).add(86399,'seconds').toISOString(),
        });
      }
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

};
</script>
<style lang="scss">
</style>
