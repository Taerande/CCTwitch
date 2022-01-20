<template>
  <div class="about">
    <h1>{{this.$router}}</h1>
    <h2>this is channel page</h2>
  </div>
</template>
<script>
export default {
  computed: {
    channelName() {
      return this.$route;
    },
  },

};
</script>
<style>

</style>
