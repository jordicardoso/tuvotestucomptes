<template>
  <div>
    <template v-if="!$route.meta.public">
      <v-app>
        <v-navigation-drawer v-model="sideNav" fixed app :clipped="$vuetify.breakpoint.lgAndUp">
          <v-toolbar flat class="transparent" v-if="user">
            <v-list class="pa-0">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <v-img :src="user.photoURL"/>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ user.displayName }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-toolbar>
          <v-divider/>
          <v-list dense>
            <v-list-tile v-for="item in menuItems" :key="item.name" :to="item.path">
              <v-list-tile-action>
                <v-icon>{{ item.meta.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content class="text-capitalize">{{ item.meta.title }}</v-list-tile-content>
            </v-list-tile>
            <v-divider/>
            <v-list-tile v-if="userIsAuthenticated" @click="onLogout">
              <v-list-tile-action>
                <v-icon>exit_to_app</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>Sortir</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-navigation-drawer>

        <v-toolbar dark fixed app class="primary" :clipped-left="$vuetify.breakpoint.lgAndUp">
          <v-toolbar-side-icon @click.stop="sideNav = !sideNav"/>
          <v-toolbar-title>
            <router-link to="/" tag="span" style="cursor: pointer">tu Votes tu Comptes</router-link>
          </v-toolbar-title>
        </v-toolbar>

        <!--<v-dialog v-model="$root.loading" persistent fullscreen content-class="loading-dialog">
            <v-container fill-height>
              <v-layout column justify-center align-center>
                <v-flex xs12>
                  <v-img
                    :src="require('./assets/logo.svg')"
                    class="my-3"
                    contain
                    height="200"
                  ></v-img>
                </v-flex>
                <v-progress-circular indeterminate :size="70" :width="7" color="purple"></v-progress-circular>
                <h1>Carregant</h1>
              </v-layout>
            </v-container>
          </v-dialog>-->

        <v-content>
          <router-view/>
        </v-content>
      </v-app>
    </template>
    <template v-else>
      <v-app>
        <router-view/>
      </v-app>
    </template>
  </div>
</template>

<script>
import { authService } from './main'
export default {
  name: 'App',
  data () {
    return {
      sideNav: null
    }
  },
  methods: {
    onLogout () {
      // this.$store.dispatch('logout')
      authService.logout().then(user => {
        this.user = null
        this.$router.push('/signin')
      })
    }
  },
  computed: {
    menuItems () {
      if (this.userIsAuthenticated) {
        return this.$router.options.routes.filter(r => r.meta.requiresAuth === true)
      } else {
        return this.$router.options.routes.filter(r => r.meta.requiresAuth === false)
      }
    },
    user () {
      return this.$root.user
    },
    userIsAuthenticated () {
      return this.$root.user != null
    }
  }
}
</script>
<style>
.loading-dialog {
   background-color: #303030;
   color: whitesmoke;
}
</style>
