import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { db } from './main'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/signin',
      name: 'signin',
      meta: {
        title: 'Iniciar sessió',
        icon: 'lock_open',
        requiresAuth: false,
        requiresAdmin: false,
        public: true
      },
      // Carregant el component d'aquesta manera, el fitxer Vots.[hash].js no es carregarà fins que es necessiti
      // Optimitzant el rendiment de la pàgina 🚀
      component: () => import(/* webpackChunkName: "signin" */ './views/Signin.vue')
    },
    {
      path: '/',
      name: 'vots',
      meta: {
        title: 'Entrada de Vots',
        icon: 'how_to_vote',
        requiresAuth: true
      },
      // Carregant el component d'aquesta manera, el fitxer Vots.[hash].js no es carregarà fins que es necessiti
      // Optimitzant el rendiment de la pàgina 🚀
      component: () => import(/* webpackChunkName: "vots" */ './views/Vots.vue')
    },
    {
      path: '/eleccions',
      name: 'eleccions',
      meta: {
        title: 'Eleccions',
        icon: 'event_note',
        requiresAuth: true
      },
      // Carregant el component d'aquesta manera, el fitxer Vots.[hash].js no es carregarà fins que es necessiti
      // Optimitzant el rendiment de la pàgina 🚀
      component: () => import(/* webpackChunkName: "eleccions" */ './views/Elections.vue')
    },
    {
      path: '/meses',
      name: 'meses',
      meta: {
        title: 'Edició de meses',
        icon: 'location_city',
        requiresAuth: true
      },
      // Carregant el component d'aquesta manera, el fitxer Vots.[hash].js no es carregarà fins que es necessiti
      // Optimitzant el rendiment de la pàgina 🚀
      component: () => import(/* webpackChunkName: "meses" */ './views/Meses.vue')
    },
    {
      path: '/security',
      name: 'seguretat',
      meta: {
        title: 'Seguretat',
        icon: 'security',
        requiresAuth: true,
        requiresAdmin: true
      },
      component: () => import(/* webpackChunkName: "meses" */ './views/Security.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const user = firebase.auth().currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  let dbusers = db.collection('users').doc(user.uid)
  // this.roles = null

  // Get the user data from the database.
  dbusers.get().then(function (doc) {
    if (doc.exists) {
      let data = doc.data()
      let roles = data.roles
      console.log(roles)
      if (requiresAdmin && roles.admin) next()
      if (requiresAuth && !user) next('/signin')
      else if (!requiresAuth && user) next('/')
      else next()
    } else {
      // doc.data() will be undefined in this case
      console.log('No such document!')
      if (requiresAuth && !user) next('/signin')
      else if (!requiresAuth && user) next('/')
      else next()
    }
  }).catch(function (error) {
    console.log('Error getting document:', error)
    if (requiresAuth && !user) next('/signin')
    else if (!requiresAuth && user) next('/')
    else next()
  })
})
export default router
