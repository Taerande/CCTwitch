<template>
  <div class="d-flex justify-center">
    <ins class="kakao_ad_area" style="display:none;"
      data-ad-unit    = "DAN-Pzsp2FJKieHwM62D"
      data-ad-width   = "320"
      data-ad-height  = "50"></ins>

    <!-- <Adsense
    data-ad-client="ca-pub-8597405222136575"
    data-ad-slot="3465851493"
    :ins-style="`display:inline-block;width:${AdWidth};height:90px;`"
    ></Adsense> -->
  </div>
</template>
<script>
export default {
  mounted(){
  },
  computed:{
    AdWidth(){
      if(this.$vuetify.breakpoint.xs){
        return '270px';
      }
      else if(this.$vuetify.breakpoint.sm){
        return '440px';
      }
      else if(this.$vuetify.breakpoint.md){
        return '550px';
      }
      else if(this.$vuetify.breakpoint.lg){
        return '728px';
      }
      else{
        return '970px';
      }
    }
  }


}
</script>
<style>
</style>
