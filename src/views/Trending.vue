<template>
<v-container>
  <v-row class="pb-5">
    <v-col v-for="(item, index) in $store.state.likedStreamer" :key="index" class="d-flex pt-7 custom5cols">
        <v-badge
          v-if="item.broadcaster_type == 'partner'"
          bordered
          color="rgb(119,44,232)"
          icon="mdi-check"
          overlap>
          <v-avatar
          @click="toggleClip(item)"
          size="80">
            <v-img :src="item.thumbnail" alt="profile_img">
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
            <v-img :src="item.thumbnail" alt="profile_img">
              <v-sheet
                v-if="item.is_checked" id="checkedIcon_none">
                <v-icon size="60" color="green">mdi-check</v-icon>
              </v-sheet>
            </v-img>
        </v-avatar>
        <div class="d-flex flex-column justify-center pl-5">
          <div class="d-flex align-center">
            <span class="text-h5">{{item.display_name}}</span>
          </div>
        </div>
      </v-col>
  </v-row>
  <v-row>
    <clips></clips>
  </v-row>
</v-container>
</template>

<script>
import clips from '../components/TrendingClip.vue';

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
    toggleClip(el) {
      const toggleClips = document.getElementsByClassName(el.id);
      const check = [...toggleClips][0].classList.contains('hidden');
      const target = this.$store.state.likedStreamer.find((ele) => ele.id === el.id);
      target.is_checked = check;
      if (check) {
        [...toggleClips].forEach((item) => {
          item.classList.remove('hidden');
          this.$store.commit('SET_SnackBar', { type: 'success', text: `Filter : ${el.display_name} 님을 노출합니다.`, value: true });
        });
      } else {
        [...toggleClips].forEach((item) => {
          item.classList.add('hidden');
          this.$store.commit('SET_SnackBar', { type: 'success', text: `Filter : ${el.display_name} 님을 숨깁니다.`, value: true });
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

    kFormatter(el) {
      if (el > 999999) {
        return `${(Math.abs(el) / 1000000).toFixed(1)}M`;
      } if (el > 999) {
        return `${(Math.abs(el) / 1000).toFixed(1)}K`;
      }
      return Math.abs(el);
    },

  },
  computed: {
    getTodayDate() {
      return new Date().toISOString();
    },
  },
  created() {
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
.custom5cols {
  width: 20%;
  max-width: 20%;
  flex-basis: 20%;
}
</style>
