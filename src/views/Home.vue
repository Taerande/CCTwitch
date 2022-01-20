<template>
<v-container>
  <hello-world />
  <div
  v-for="item in this.lists"
  :key="item.id">
  {{item.display_name}}
  </div>
</v-container>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'Home',

  components: {
    HelloWorld,
  },
  data() {
    return {
      searchString: '',
      lists: [],

    };
  },
  methods: {

  },
};
</script>
