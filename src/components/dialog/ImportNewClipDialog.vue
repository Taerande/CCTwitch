<template>
<v-dialog
  v-model="dialog"
  max-width="1280">
  <template v-slot:activator="{ on, attrs }">
    <v-btn
      outlined
      text
      class="text-caption mr-3"
      color="success"
      v-bind="attrs"
      v-on="on"
    >
    Import Clip Data
    </v-btn>
  </template>
  <v-card height="700" class="justify-center">
    <v-card-title class="d-flex justify-center text-h5">
      <span class="left-element" style="margin-right:auto,
  opacity:0">none</span>
      <div>
        <div> Import Clip Data </div>
        <div class="d-flex justify-center align-baseline twitch--text text-body-1"> {{dataType(switch1)}} </div>
      </div>
      <v-switch
      class="right-element"
      style="margin-left:auto"
      v-model="switch1"
      flat
      :label="dataType(switch1)"
    ></v-switch>
    </v-card-title>

    <v-card-text
    class="d-flex justify-center">
      <div v-if="switch1">
        <v-text-field
          v-model="clipData"
          :loading="loading"
          outlined
          width="500"
          class="pt-5"
          append-icon="mdi-magnify"
          @click:append="test()"
          hide-details=""
          placeholder="Input Twitch Clip URL or Id"
          @input="searchClip(clipData)"
        >
        <template v-slot:progress>
          <v-progress-linear
            v-if="clipData"
            :indeterminate="false"
            value="100"
            color="error"
            absolute
          ></v-progress-linear>
        </template>
        </v-text-field>
      </div>
      <div v-else>
        <v-img src="@/assets/img/upload-icon.png">

        </v-img>

      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="green darken-1"
        text
      >
        Add
      </v-btn>
    </v-card-actions>
  <pinClip name="importedClipPin"></pinClip>
  </v-card>
</v-dialog>
</template>
<script>
import pinClip from '@/components/pinClip.vue';

export default {
  components: {
    pinClip,
  },
  props: ['type'],
  data() {
    return {
      switch1: true,
      dialog: false,
      color: '',
      clipData: '',
      loading: false,
    };
  },
  methods: {
    dataType(el) {
      if (el) {
        return 'URL & String';
      }
      return 'Data File';
    },
    test() {
      console.log('hi');
    },
    searchClip(el) {
      const intervalID = () => { setTimeout(() => { console.log('setInterval'); this.loading = true; }, 3000); };
      if (el.length > 10) {
        console.log(this.clipData);
        this.loading = false;
        intervalID();
      }
    },
  },
  created() {
  },

};
</script>
<style lang="scss" scoped>
.cliplist-canvas{
  border-radius: 5%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  width: 50px;
  height: 50px;
}
.v-list-item__content{
  padding-left: 10px !important;
}
div[role=listitem]:hover{
  cursor: pointer;
  background-color: rgb(0, 0, 0, 0.2) !important;
}
.left-element{
    visibility: hidden;
    margin-right: auto;
    width: 200px;
}
.right-element{
  margin-left: auto;
  width: 200px;

}
.v-text-field{
  width: 500px;
}

</style>
