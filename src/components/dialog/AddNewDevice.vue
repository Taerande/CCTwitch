<template>
<v-dialog
  v-model="dialog"
  transition="dialog-transition"
  max-width="500"
>
  <template v-slot:activator="{on}">
    <v-btn v-on="on" color="success" icon><v-icon>mdi-bell</v-icon></v-btn>
  </template>
  <v-card>
    <v-card-title>
      Register Device
    </v-card-title>
    <v-card-text>
      <v-text-field
        name="name"
        label="Device Name"
        id="id"
      ></v-text-field>
      {{fcm}}
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="dialog = false" color="error" text>close</v-btn>
      <v-btn color="success" text>register</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
export default {
  props:['fcm'],
  data() {
    return {
      dialog: false,
    }
  },

}
</script>
<style>

</style>
