import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase/app'
import 'firebase/auth'

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
    }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  firebase.auth().onAuthStateChanged(user => {
    if (requiresAuth && !user) next('/signin')
    else if (!requiresAuth && user) next('/')
    else next()
  })
})
export default router
