import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import ca from 'vuetify/es5/locale/ca'

Vue.use(Vuetify, {
  iconfont: 'md',
  lang: {
    locales: { ca },
    current: 'ca'
  }
})
