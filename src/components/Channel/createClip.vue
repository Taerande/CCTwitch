<template>
<v-dialog
  v-model="dialog"
  :overlay="false"
  max-width="500px"
  transition="dialog-transition"
>
<template v-slot:activator="{on}">
<v-btn v-on="on" color="twitch">create clip</v-btn>
</template>
<v-container grid-list-xs>
  <v-row>
    <iframe
      :src="`https://player.twitch.tv/?video=${vidInfo.data.id}&parent=${$store.state.embedUrl}&autoplay=false`"
      height="500"
      width="800"
      autoplay="false"
      allowfullscreen>
    </iframe>
  </v-row>
</v-container>
</v-dialog>
</template>
<script>
export default {
  props:['vidInfo'],
  data() {
    return {
      dialog:false,
    }
  },

}
</script>
<style lang="">

</style>
