<template>
<v-container fluid>
  <v-row class="py-5">
    <span class="text-h3 font-weight-bold text-uppercase"><v-icon color="orange" class="pa-0" x-large>mdi-poll</v-icon> Report | {{this.$route.query.type}}</span>
  </v-row>
  <v-row>
    <v-col>
      <v-card color="primary" elevation="5">
        <v-card-title class="white--text">
          <v-icon color="orange">mdi-poll</v-icon>
          <span>REPORT : KOR - 2022-07-08</span>
        </v-card-title>
        <v-card-text class="white--text">
          <div>
            총 시청자수 및 스트리밍 갯수 라인+바 그래프
            라인(총시청자수)
            바(스트리밍 갯수)
          </div>
          <div>
            해당 데이터 라벨 누르면 해당 시각의 트리맵 dialog로 띄우기
          </div>
          <div>
            최고시청자
          </div>
          <div>
            최고 카테고리
          </div>
          <div>
            hot clip best 5(걍 조회수로)
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-if="$route.query.type === undefined">
    <v-col>
      <v-btn color="success" @click="$router.push({path:'?type=overall'})">text</v-btn>
      <v-btn color="success" @click="$router.push({path:'?type=compare'})">text</v-btn>
      <v-btn color="success" @click="$router.push({path:'?type=detail'})">text</v-btn>
    </v-col>
    <v-col></v-col>
    <v-col></v-col>
  </v-row>
  <v-row>
    <OverallVue v-if="this.$route.query.type === 'overall'"></OverallVue>
    <CompareVue v-if="this.$route.query.type === 'compare'"></CompareVue>
    <DetailVue></DetailVue>
  </v-row>
</v-container>
</template>
<script>
import OverallVue from '../components/Report/Overall.vue'
import DetailVue from '../components/Report/Detail.vue'
import CompareVue from '../components/Report/Compare.vue'
export default {
  data() {
    return {

    }
  },
  components:{
    CompareVue,
    DetailVue,
    OverallVue
  },
  created(){

  }
}
</script>
<style>

</style>
