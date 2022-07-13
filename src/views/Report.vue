<template>
<v-container fluid>
  <v-row>
    query로 componenet 생성,
  </v-row>
  <v-row class="col-12">
    <v-col cols="12" class="py-3">
      <v-card color="primary" dark elevation="5">
        <v-card-title>
          <v-icon>mdi-poll</v-icon>
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
          <v-card-title>
            title2
          </v-card-title>
        <v-card-actions>

        </v-card-actions>

      </v-card>
    </v-col>
    <v-col cols="12" class="py-3">
      <v-card color="primary" dark elevation="5">
        <v-card-title>
          <v-icon>mdi-poll</v-icon>
          <span>REPORT : KOR - 2022-07-08</span>
        </v-card-title>
        <v-card-text class="white--text">
          This is Report Page

        </v-card-text>
          <v-card-title>
            title2
          </v-card-title>
        <v-card-actions>

        </v-card-actions>

      </v-card>

    </v-col>
  </v-row>
</v-container>
</template>
<script>
export default {

}
</script>
<style>

</style>
