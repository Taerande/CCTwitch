<template>
<v-container fluid>
  <v-row class="d-block">
    <div class="d-flex align-center py-3">
      <v-icon class="pr-2">mdi-label-multiple-outline</v-icon>
      <v-chip class="d-flex align-center text-caption chipPill mx-1" v-for="(tag, index) in hotClipData.tags" :key="index" :to="`/tag/${tag}`">
        {{tag}}
      </v-chip>
    </div>
    <div class="px-1 text-h3 font-weight-bold">
      {{hotClipData.title}}
    </div>
    <div class="d-flex text-caption align-center">
      <div class="align-baseline">
        <div class=" text-caption px-1">
          게시자 : {{hotClipData.author.display_name}} ({{hotClipData.author.login}}) <v-icon v-if="hotClipData.author.broadcaster_type === 'partner'" color="twitch" small>mdi-check-circle</v-icon>
        </div>
      </div>
    </div>
    <div class="px-1 d-flex align-baseline">
      <span class="pr-2">조회수: {{hotClipData.viewCount}}회</span>
      <span class="blue-grey--text text-subtitle-2">
        {{formatDateWithFromNow(hotClipData.createdAt)}}
      </span>
      {{hotClipData.created_at}}
      <v-spacer></v-spacer>
      <span class="d-flex align-center px-1"> <v-icon class="px-1">mdi-thumb-up-outline</v-icon> {{hotClipData.likeCount}}</span>
      <span class="d-flex align-center px-1"> <v-icon class="px-1">mdi-comment-text-multiple-outline</v-icon> {{hotClipData.commentCount}} </span>
    </div>
    <v-divider class="my-2"></v-divider>
  </v-row>
  <v-row>
    <router-link :to="`/channel?q=${hotClipData.broadcaster.login}`">
      <div class="d-flex align-center">
        <v-avatar
          size="48"
        >
        <v-img
        :src="hotClipData.broadcaster.profile_image_url"
        >
        </v-img>
        </v-avatar>
        <div class="align-baseline">
            <div class="text-h6 font-weight-black px-1 twitch--text hoverCursor">
              {{hotClipData.broadcaster.display_name}} ({{hotClipData.broadcaster.login}}) <v-icon v-if="hotClipData.broadcaster.broadcaster_type === 'partner'" color="twitch" small>mdi-check-circle</v-icon>
            </div>
        </div>
      </div>
    </router-link>
  </v-row>
  <v-divider class="my-2"></v-divider>
</v-container>
</template>
<script>
export default {
  props:['hotClipData'],
  data() {
    return {
    }
  },
  methods: {
    formatDateWithFromNow(el){
      const timeDiff = this.$moment().diff(el);
      return timeDiff > 86400000 ? this.$moment(el).format('l') :this.$moment(el).fromNow();
    }
  },

}
</script>
<style>

</style>
