import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        twitch: '#772ce8',
        overlayColor: '#F4F6F6',
      },
      dark: {
        twitch: '#772ce8',
        overlayColor: '#F4F6F6',
      },
    },
  },
  breakpoint: {
    thresholds:{
      xs: 450,
      sm: 600,
    }
  }
});
