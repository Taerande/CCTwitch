<template>
 <v-dialog
  height="100%"
  :content-class="$vuetify.breakpoint.smAndUp ? '' : 'clipIframe'"
  v-model="dialog">
  <template v-slot:activator="{on, attrs}">
    <div class="d-flex align-center" v-bind="attrs" v-on="on">
      <div aria-label="avatar">
        <v-badge
          v-if="data.broadcaster_type == 'partner'"
          bordered
          color="rgb(119,44,232)"
          icon="mdi-check"
          overlap>
          <v-avatar
          outline
          size="50">
              <v-img :src="data.thumbnail" alt="profile_img"></v-img>
          </v-avatar>
        </v-badge>
        <v-avatar size="50" v-else>
          <v-img :src="data.thumbnail" alt="profile_img"></v-img>
        </v-avatar>
      </div>
      <div aria-label="streamer info" class="pl-3" style="max-width:130px">
        <div class="d-flex text-truncate align-center">
          {{data.display_name}}
        </div>
      </div>
    </div>
  </template>
  <v-card>
    <v-card-title class="info">
      <span class="text-h5"
        >{{ data.display_name }}님의 Video List</span
      >
    </v-card-title>
    <v-container class="pa-3 mx-0 mx-auto">
      <v-row class="d-flex align-center">
        <v-col
          @click="changeVid(item)"
          class="d-flex vid-list-item overflow-x-hidden"
          cols="12"
          xl="2"
          lg="3"
          md="4"
          sm="6"
          xs="12"
          v-for="(item, index) in this.vidLists"
          :key="index"
        >
          <v-img
            max-width="150"
            :src="
              setThumbnailSize(item.data.thumbnail_url) ||
              '@/assets/img/404.jpg'
            "
            lazy-src="@/assets/img/404.jpg"
          >
          </v-img>
          <div class="pl-2">
            <div class="text-truncate">{{ item.data.title }}</div>
            <div class="text-caption d-flex align-center">
              <v-icon class="pr-1" x-small>mdi-eye</v-icon>
              {{ viewerkFormatter(item.data.view_count) }}
            </div>
            <div class="text-caption">
              {{ getDurationTime(item.data.duration) }}
            </div>
            <div class="text-caption">{{ item.data.created_at }}</div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="dialog = false">Close</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
import axios from 'axios';

export default {
  props: ['data'],
  data() {
    return {
      vidLists:[],
      dialog: false,
    };
  },
  methods: {
    changeVid(el){
      this.$emit('changeVid',el.data);
      this.dialog = false;
    },
    viewerkFormatter(el) {
      const num = el.toString()
      if (num > 999999999) {
        return `${num.slice(0, -9)},${num.slice(
          num.length - 9,
          -6,
        )},${num.slice(num.length - 6, -3)},${num.slice(-3)}`
      }
      if (num > 999999) {
        return `${num.slice(0, -6)},${num.slice(
          num.length - 6,
          -3,
        )},${num.slice(-3)}`
      }
      if (num > 999) {
        return `${num.slice(0, -3)},${num.slice(-3)}`
      }
      return Math.abs(num)
    },
     getDurationTime(el) {
      const regex = /h|m|s/
      const duration = el.split(regex)
      if (duration.length === 4) {
        if (duration[1] === '0') {
          return `${duration[0]}시간`
        }
        return `${duration[0]}시간 ${duration[1]}분`
      }
      if (duration.length === 3) {
        return `${duration[0]}분`
      }

      return '1분 미만'
    },
    setThumbnailSize(el) {
      const width = /%{width}/
      const height = /%{height}/
      return el.replace(width, '1280').replace(height, '720')
    },
    async deleteFav(el) {
      await this.$store.commit('DELETE_LikedStreamer', el);
      this.dialog = false;
    },
    async getVid(userId) {
      await axios
        .get('https://api.twitch.tv/helix/videos', {
          headers: this.$store.state.headerConfig,
          params: {
            user_id: userId,
            first: 100,
            type: 'archive',
          },
        })
        .then((res) => {
          res.data.data.forEach((el) => {
            this.vidLists.push({
              data: el,
            })
          })
        })
        .catch((error) => console.log(error))
    },
  },
  mounted(){
    this.getVid(this.data.id);
  }
};
</script>
<style lang="scss" scoped>
.no-clips {
  position: absolute !important;
  top: 50% !important;
  right: 50% !important;
}
.vid-list-item:hover {
  cursor: pointer;
  background: var(--twitch-color);
}
.vid-list-item:hover div {
  color: white;
}
.vid-list-item:hover i {
  color: white;
}
</style>
