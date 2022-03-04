import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        twitch: '#772ce8',
      },
      dark: {
        twitch: '#772ce8',
      },
    },
  },
  breakpoint: {
    thresholds: {
      pc: 1280,
      tb: 768,
      mb: 480,
    },
  }
});
