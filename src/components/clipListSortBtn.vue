<template>
<v-menu offset-x>
  <template v-slot:activator="{on}">
    <v-btn color="twitch" text v-on="on" class="ma-0 pa-0">
    <v-icon>
      mdi-sort
    </v-icon>
    </v-btn>
  </template>
  <v-list class="text-caption">
    <v-list-item-group v-model="model" color="twitch">
      <v-list-item v-for="(item ,index) in sortType" :key="index" :disabled="model === index">
        <v-list-item-content @click="sortEmit(item.actions)">
          <span>
            <v-icon class="pa-0 ma-0" style="width:1rem;" small color="twitch">{{index !== model ? '' : 'mdi-check'}}</v-icon>
            {{item.text}}
          </span>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</v-menu>
</template>
<script>
export default {
  props:['data'],
  data() {
    return {
      model:0,
      sortType:[
        {text:'최신 순', actions:{data:'createdAt', sort:'desc'}},
        {text:'오래된 순', actions:{data:'createdAt', sort:'asc'}},
        {text:'인기 순', actions:{data:'likeCount', sort:'desc'}},
        {text:'클립수 순', actions:{data:'clipCount', sort:'desc'}},
        {text:'공개 상태', actions:{data:'isPublic', sort:'desc'}},
      ]

    }
  },
  methods: {
    sortEmit(el){
      if(this.model !== undefined){
        this.$emit('sortCliplist',el);
      } else {
        this.$emit('sortCliplist',this.sortType[0].actions);
      }
    }
  },
}
</script>
<style>
</style>
