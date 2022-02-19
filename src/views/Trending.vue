<template>
<v-container>
  <v-row>
    <v-row v-for="(item, index) in userInfo" :key="index" class="d-flex justify-center pt-7">
      <v-badge
        v-if="item.broadcaster_type == 'partner'"
        bordered
        color="rgb(119,44,232)"
        icon="mdi-check"
        overlap
        >
          <v-avatar
          @click="toggleClip(item)"
          size="80">
            <v-img :src="item.profile_image_url" alt="profile_img">
              <v-sheet
                v-if="item.is_checked" id="checkedIcon_partner">
                <v-icon size="60" color="green">mdi-check</v-icon>
              </v-sheet>
            </v-img>
          </v-avatar>
        </v-badge>
        <v-avatar
        @click="toggleClip(item)"
        size="80"
        v-else>
            <v-img :src="item.profile_image_url" alt="profile_img">
              <v-sheet
                v-if="item.is_checked" id="checkedIcon_none">
                <v-icon size="60" color="green">mdi-check</v-icon>
              </v-sheet>
            </v-img>
        </v-avatar>
        <div class="d-flex flex-column justify-center pl-5">
          <div class="d-flex align-center">
            <span class="text-h5">{{item.display_name}}</span>
            <v-btn v-if="$store.state.likedStreamer.find(ele => ele.id === item.id)" icon @click="deleteFav($store.state.likedStreamer.findIndex(el => el.id == item.id))">
              <v-icon color="rgb(119,44,232)">mdi-star</v-icon>
            </v-btn>
            <v-btn v-else icon @click="like({id:item.id ,login: item.login, display_name: item.display_name, thumbnail:item.profile_image_url})">
              <v-icon>mdi-star</v-icon>
            </v-btn>
          </div>
        </div>
    </v-row>
  </v-row>
  <v-row>
    <clips :clips="{
        'data': userInfo,
        'data-type': 'user',
        'page': 'trending',
    }"
    @pagination="changePaginationCursor"
    ></clips>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';
import clips from '@/components/clips.vue';

export default {
  components: {
    clips,
  },
  data() {
    return {
      clips: [],
      userInfo: [],
      dataLoading: false,
    };
  },
  methods: {
    changePaginationCursor(el) {
      const target = this.userInfo.find((ele) => ele.id === el.id);
      target.paginationCursor = el.pagination;
    },
    toggleClip(el) {
      const toggleClips = document.getElementsByClassName(el.id);
      const check = [...toggleClips][0].classList.contains('hidden');
      const target = this.userInfo.find((ele) => ele.id === el.id);
      console.log(toggleClips);
      target.is_checked = check;
      if (check) {
        [...toggleClips].forEach((item) => {
          item.classList.remove('hidden');
        });
      } else {
        [...toggleClips].forEach((item) => {
          item.classList.add('hidden');
        });
      }
    },
    getEndDate(el) {
      const startedAt = new Date(el).getTime();
      const endedAt = new Date(startedAt + 48 * 60 * 60 * 1000);
      return endedAt.toISOString();
    },
    getStartDate(el) {
      const endedAt = new Date(el).getTime();
      const startedAt = new Date(endedAt - 7 * 24 * 60 * 60 * 1000);
      return startedAt.toISOString();
    },

    deleteFav(el) {
      this.$store.commit('DELETE_LikedStreamer', el);
    },
    like(el) {
      this.$store.commit('SET_LikedStreamer', el);
    },
    async getUserInfo(element) {
      await axios.get('https://api.twitch.tv/helix/users', {
        headers: this.$store.state.headerConfig,
        params: {
          id: element.id,
        },
      }).then((res) => {
        const data = res.data.data[0];
        data.paginationCursor = '';
        data.is_checked = true;
        this.userInfo.push(data);
      }).catch((error) => console.log(error));
    },

    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },
    async process() {
      const promise = this.$store.state.likedStreamer.map(this.getUserInfo);
      await Promise.all(promise);
    },

  },
  computed: {
    getTodayDate() {
      return new Date().toISOString();
    },
  },
  created() {
    this.process();
  },
};
</script>
<style lang="scss">
.v-progress-circular {
  margin: 1rem;
}
#checkedIcon_partner, #checkedIcon_none{
  display: flex;
  background-color: rgb(0,0,0,0.3);
  width: inherit;
  > i {
    width: -webkit-fill-available;
  }
  :hover{
    cursor: pointer;
  }
}
.v-avatar:hover{
  cursor: pointer;
}
</style>
