<template>
  <v-app>
    <AppBar app></AppBar>
    <bookmark app></bookmark>
    <v-main id="container" app>
      <router-view :key="$route.fullPath"/>
    </v-main>
      <SnackBar app></SnackBar>
      <Footer app></Footer>
  </v-app>
</template>

<script>
import bookmark from '@/components/layout/bookmark.vue';
import SnackBar from '@/components/layout/SnackBar.vue';
import AppBar from '@/components/layout/AppBar.vue';
import Footer from '@/components/layout/Footer.vue';

export default {
  name: 'App',
  components: {
    AppBar,
    Footer,
    bookmark,
    SnackBar,
  },
  data() {
    return {

    };
  },
  methods: {
    searchBarToggle() {
      this.$store.commit('TOGGLE_SearchBar');
    },

  },
  created() {
    const likesInit = JSON.parse(localStorage.getItem('alllikes'));
    const cliplistInit = JSON.parse(localStorage.getItem('allCliplists'));
    if (likesInit === null) {
      const likes = [];
      localStorage.setItem('alllikes', JSON.stringify(likes));
    }
    if (cliplistInit === null) {
      const likes = [];
      localStorage.setItem('allCliplists', JSON.stringify(likes));
    }
    this.$store.commit('INIT_localStorage');
    this.$vuetify.theme.dark = JSON.parse(localStorage.getItem('dark'));
  },
};
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap');
:root {
  --twitch-color: rgb(119,44,232);
}
header{
  height: fit-content;
  padding-left: 15%;
  padding-right: 15%;
  // background: rgb(119,44,232);
  // background: linear-gradient(90deg, rgba(119,44,232,1) 0%, rgba(119,44,232,0.8911939775910365) 74%, rgba(119,44,232,0.7203256302521008) 100%);
}
.col, .row, .container{
  padding: 0 !important;
  margin: 0 !important;
}
html, body{
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
}
#app{
  font-family: 'Noto Sans KR', sans-serif;

}
a{
  text-decoration: none !important;
  color: inherit !important;
}
.hidden{
  display: none;
}
div[role="dialog"]{
  box-shadow: none;
}
::-webkit-scrollbar {
  width: 7px;
}
::-webkit-scrollbar-thumb {
  background-color: var(--twitch-color);
  border-radius: 5px;
  background-clip: padding-box;
}
::-webkit-scrollbar-track {
  background-color: rgb(255,255,255,0.1);
  border-radius: 5px;
}

</style>
