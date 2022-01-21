<template>
<v-container>
<v-row>
  <v-col>
    <h2>this is channel page</h2>
    <h1>{{$route.params}}</h1>
  </v-col>
</v-row>
<v-row>
  <div class="twitch-video">
   <iframe src="https://clips.twitch.tv/embed?clip=HorribleBlatantSwordNerfBlueBlaster&parent=localhost:8080" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>
  </div>
</v-row>
</v-container>
</template>
<script>
export default {
  updated() {
    if (Object.keys(this.$route.params).length === 0) { this.$router.push({ path: '/' }); }
  },

};
</script>
<style>

</style>
