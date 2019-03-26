import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VueFire from 'vuefire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

Vue.config.productionTip = false
Vue.use(VueFire)
firebase.initializeApp({
  apiKey: 'AIzaSyBuVnxXP3BL6J0AysynbBewZrVJ9b-w724',
  authDomain: 'tuvotestucomptes-2ecb8.firebaseapp.com',
  projectId: 'tuvotestucomptes-2ecb8',
  databaseURL: 'https://tuvotestucomptes-2ecb8.firebaseio.com'
  // storageBucket: 'gs://tuvotestucomptes-2ecb8.appspot.com'
})
firebase.firestore().enablePersistence()
  .catch(function (err) {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.')
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support all of the features required to enable persistence.')
    }
  })

export const idEleccions = 'K92HNeLF7hsBDA1KntKB'
export const db = firebase.firestore()

const initializeAuth = new Promise(resolve => {
  // this adds a hook for the initial auth-change event
  firebase.auth().onAuthStateChanged(user => {
    authService.setUser(user)
    resolve(user)
  })
})

export const authService = {

  user: null,

  authenticated () {
    return initializeAuth.then(user => {
      return user && !user.isAnonymous
    })
  },

  setUser (user) {
    this.user = user
  },

  /* login (email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  }, */

  logout () {
    return firebase.auth().signOut()
    /* firebase.auth().signOut().then(() => {
      this.user = null
      // console.log('logout done')
    }) */
  }
}

/* export const api = {
  comarques: null,

  getComarques () {
    console.log('getComarques')
    if (this.comarques === null) {
      console.log('Carreguar comarques')
      this.comarques = db.collection('comarques').orderBy('Codi')
      return this.comarques
    } else {
      console.log('Ja les tenim comarques')
      return this.comarques
    }
  }
} */

/* new Vue({
  el: '#app',
  router,
  render: h => h(App),
  data () {
    return {
      user: null,
      loading: true
      // messages: []
    }
  },
  beforeCreate () {
    firebase.auth().onAuthStateChanged(user => {
      this.loading = false
      if (user) {
        this.user = user // this.$root.user (des de altres components)
        // this.$bindAsArray('messages', firebasedb.ref('messages/' + user.uid))
        // authService.setUser(user)
      } else {
        // firebase.auth().signInAnonymously().catch(console.error)
        this.user = null
      }
    })
  }
}).$mount('#app') */

firebase.auth().onAuthStateChanged(user => {
  new Vue({
    el: '#app',
    router,
    render: h => h(App),
    data () {
      return {
        user: user,
        loading: true
        // messages: []
      }
    },
    beforeCreate () {
      firebase.auth().onAuthStateChanged(user => {
        this.loading = false
        if (user) {
          this.user = user // this.$root.user (des de altres components)
          // this.$bindAsArray('messages', firebasedb.ref('messages/' + user.uid))
          // authService.setUser(user)
        } else {
          // firebase.auth().signInAnonymously().catch(console.error)
          this.user = null
        }
      })
    }
  }).$mount('#app')
})
