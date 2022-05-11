<template>
<v-container>
  <v-row>
    <v-col cols="12" xl="3" lg="3" md="4" sm="6" xs="12"  class="pa-2 d-flex justify-center" v-for="(item, index) in likelist" :key="index">
      <v-card dark outlined class="rounded-xl pa-0" width="280px">
        <v-card-text class="d-flex align-center pa-2">
          <div>
            <v-badge
            v-if="item.broadcaster_type === 'partner'"
            color="twitch"
            icon="mdi-check"
            overlap
            >
              <v-avatar
                size="36"
              >
                <img :src="item.thumbnail" alt="alt">
              </v-avatar>
            </v-badge>
            <v-avatar
              v-else
              size="36"
            >
              <img :src="item.thumbnail" alt="alt">
            </v-avatar>
          </div>
          <div class="text-truncate pl-2" style="width:150px;">
            <div class="text-truncate" style="width:150px;">{{item.display_name}}
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-menu offset-y v-model="menuDialog">
          <template v-slot:activator="{on}">
          <v-btn v-on="on" icon><v-icon>mdi-dots-vertical</v-icon></v-btn>
          </template>
            <v-btn color="primary" dark slot="activator">text</v-btn>
            <v-list>
              <v-list-item>1</v-list-item>
              <v-list-item>2</v-list-item>
              <v-list-item>3</v-list-item>
            </v-list>
          </v-menu>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>

</template>
<script>
export default {
  data(){
    return{
      likelist:[],
      menuDialog: false,
    }
  },
  methods: {

  },
  created(){
    this.likelist = JSON.parse(localStorage.getItem('alllikes'));


  }

}
</script>
<style lang="scss" scoped>

</style>
