<template>
  <div class="about">
    <h1>This is an about page</h1>
    <v-row
      v-for="item in items" :key="item.id"
    >
      <v-dialog
      hide-overlay
      attach
      origin="top right"
      :value="currId === item.id">
      <template v-slot:activator="{on, attrs}">
        <v-btn v-bind="attrs" v-on="on" @click="currId = item.id">
          Click Here
        </v-btn>
      </template>
          <v-card>
            <v-card-title>{{item.title}}</v-card-title>
            <v-card-text>{{item.text}}</v-card-text>
          </v-card>

      </v-dialog>
    </v-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      currId: '',
      dialog: false,
      items: [
        {
          id: 1,
          title: '1123',
          text: 'asdfczㄴㅁㅇㄹㄴㅁㅇㄹ',
        },
        {
          id: 2,
          title: 'ㅁㄴㅇㄹ',
          text: 'asdfczㄴㅁㅇㄹㄴㅁㅇㄹ',
        },
        {
          id: 3,
          title: '11ㅋㅊㅌㅍ23',
          text: 'asdfczㄴㅁㅇㄹㄴㅁㅇㄹ',
        },
        {
          id: 4,
          title: '11ㄹㄹ23',
          text: 'asdfczㄴㅁㅇㄹㄴㅁㅇㄹ',
        },
        {
          id: 5,
          title: '112ㄹㄹ3',
          text: 'asdfczㄴㅁㅇㄹㄴㅁㅇㄹ',
        },
        {
          id: 6,
          title: '1121233',
          text: 'asdfczㄴㅁㅇㄹㄴㅁㅇㄹ',
        },
      ],
    };
  },

};
</script>

<style lang="">

</style>
