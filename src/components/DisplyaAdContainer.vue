<template>
  <div>
    <Adsense
    data-ad-client="ca-pub-8597405222136575"
    data-ad-slot="5644022389"
    data-ad-format="horizontal"
    ins-style="display:block;width:100%;"
    ></Adsense>
  </div>
</template>
<script>
export default {
  mounted(){
  setTimeout(() => {
    document.getElementsByClassName('v-application')[0].style['min-height'] = '100vh';
  }, 100);
  }


}
</script>
<style>
</style>
