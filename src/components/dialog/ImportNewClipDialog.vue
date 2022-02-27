<template>
<v-dialog
  v-model="dialog"
  no-click-animation
  @keydown:esc="dialog = !dialog"
  persistent
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
      <span class="left-element" style="margin-right:auto, opacity:0">none</span>
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
          hide-details=""
          placeholder="Input Twitch Clip URL or Id"
        >
        <template v-slot:progress>
          <v-progress-linear
            :indeterminate="false"
            height="10"
            :color="success"
            absolute
          ></v-progress-linear>
        </template>
        </v-text-field>
      </div>
      <div v-else>
       <v-text-field
          v-model="cliplistString"
          :loading="loading"
          outlined
          width="500"
          class="pt-5"
          append-icon="mdi-magnify"
          @click:append="getCliplist(cliplistString)"
          hide-details=""
          placeholder="Cliplist String"
        >
        <template v-slot:progress>
          <v-progress-linear
            :indeterminate="false"
            height="10"
            :color="success"
            absolute
          ></v-progress-linear>
        </template>
        </v-text-field>
      </div>
      <div v-if="result.id !== undefined" class="d-flex justify-center align-center pt-5">
        <div>
          <span>{{result.title}}</span>
        </div>
        <div v-for="item in result.pinnedClips" :key="item.id">
          <div>
            <iframe
            v-if="item.id !== undefined"
            :src="`https://clips.twitch.tv/embed?clip=${item.id}&parent=localhost`" parent="localhost"
            preload="auto"
            frameborder="0"
            height="100"
            width="160"
            allowfullscreen="true"></iframe>
          </div>
          <div class="pl-10">
            <div class="twitch--text text-h6">{{item.broadcaster_name}}</div>
            <div class="text-h5">{{item.title}}</div>
            <div>
              <span> 조회수 : {{item.view_count}}</span>
              <span> 날짜 : {{setDate(item.created_at)}}</span>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <pinClip name="importedClipPin" :clipData="result"></pinClip>
      <v-btn
        color="red darken-1"
        text
        @click="dialog = false"
      >
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
import pinClip from '@/components/pinClip.vue';
// import axios from 'axios';

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
      result: '',
      cliplistString: '',
    };
  },
  methods: {
    async getCliplist(el) {
      this.$firestore.collection('cliplist').doc(`${el}`).get().then((res) => {
        console.log(res.data());
        this.result = res.data();
        console.log(this.result);
      });
    },
    setDate(el) {
      const time = new Date(el).getTime();
      const krTime = time + 9 * 60 * 60 * 1000;
      const dateFormatted = new Date(krTime).toISOString().substr(0, 10);
      return dateFormatted;
    },
    dataType(el) {
      if (el) {
        return 'URL & String';
      }
      return 'Data File';
    },
    // async test(el) {
    //   this.loading = false;
    //   console.log(el);
    //   axios.get('https://api.twitch.tv/helix/clips', {
    //     headers: this.$store.state.headerConfig,
    //     params: {
    //       id: ['WittyBrightOcelotDxAbomb-NIZR3oY0YzUNXHkw', 'LaconicDoubtfulWombatPRChase-9J9sz-ekCs_1rL5L', 'OnerousAffluentWrenchFUNgineer-XYVPRreBOMTXD6J3'],
    //     },
    //   }).then((res) => {
    //     console.log(res);
    //     // this.result = res.data.data['0'];
    //     // this.loading = false;
    //   });
    // },
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
