<template>
<v-container>
  <v-row>
    <v-col v-for="item in $store.state.searchList"
     :key="item.id"
     class="col-4"
     >
     <v-card>
       <v-card-title>{{item.display_name}}</v-card-title>
       <v-avatar>
         <img :src="item.profile_image_url" :alt="item.login">
       </v-avatar>
       <v-card-subtitle>{{item.title}}</v-card-subtitle>
       <v-card-subtitle>{{item.id}}</v-card-subtitle>
       <v-card-subtitle>조회수 : {{item.view_count}}</v-card-subtitle>
     </v-card>

    </v-col>
  </v-row>
  <v-row>
    {{$store.state.searchList.length}}
  </v-row>
</v-container>
</template>
<script>

export default {
  data() {
    return {
      userInfoLists: [],
    };
  },
  methods: {
  },
  mounted() {
  },
};
</script>
<style>

</style>
