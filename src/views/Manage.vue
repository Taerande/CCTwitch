<template>
  <div>
    {{data}}
  </div>
</template>
<script>
export default {
  data() {
    return {
      data:null,
    }
  },
  methods: {
    getVids() {
      const storageRef = this.$storage.ref('clips/49045679');
      storageRef.listAll().then((res) => {
        console.log(res.items);
        // this.data = res.items;
      })
    }

  },
  created() {
    this.getVids()

  },

}
</script>
