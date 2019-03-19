<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm4>
        <form @submit.prevent="onSignin">
          <v-card class="pt-3 pl-3 pr-3 pb-1">
            <v-img max-height="150" contain position="center center" src="/img/urna.jpg"/>
            <v-card-text v-if="!register">
              <v-text-field prepend-icon="fas fa-user fa-lg" autocomplete="username" name="email" label="Email" id="email" v-model="email" type="email" required></v-text-field>
              <v-text-field prepend-icon="fas fa-lock fa-lg" autocomplete="current-password" name="password" label="Contrasenya" id="password" v-model="password" type="password" required></v-text-field>
            </v-card-text>
            <v-card-text v-else>
              <v-text-field prepend-icon="fas fa-user fa-lg" autocomplete="username" name="email" label="Email" id="email" v-model="email" type="email" required></v-text-field>
              <v-text-field prepend-icon="fas fa-lock fa-lg" autocomplete="new-password" name="password" label="Contrasenya" id="password" v-model="password" type="password" required></v-text-field>
              <v-text-field prepend-icon="fas fa-lock fa-lg" autocomplete="repeat-password" name="password" label="Confirmar contrasenya" id="password" v-model="password" type="password" required></v-text-field>
            </v-card-text>
            <v-card-actions v-if="!register">
              <v-layout column>
                <v-btn type="submit" color="primary" :disabled="loading" :loading="loading">
                  Iniciar sessió
                  <v-icon right>fas fa-lock-open fa-lg"</v-icon>
                  <span slot="loader" class="custom-loader"><v-icon light>cached</v-icon></span>
                </v-btn>
                <v-spacer/>
                <v-btn :disabled="loading" class="mt-3" :loading="loading" @click="register = !register">
                  Registrar-se
                  <v-icon right></v-icon>
                  <span slot="loader" class="custom-loader"><v-icon light>cached</v-icon></span>
                </v-btn>
                <v-layout row class="mt-3" justify-space-between>
                  <v-btn fab small class="elevation-1" v-for="item in socialLogins" v-bind:key="item.title" :disabled="loading" :loading="loading" @click.prevent="item.click">
                    <v-icon :color="item.color">{{item.icon}}</v-icon>
                  </v-btn>
                </v-layout>
              </v-layout>
            </v-card-actions>
            <v-card-actions v-else>
              <v-btn block type="submit" color="primary" :disabled="loading" :loading="loading">
                  Registre
                <v-icon right>fas fa-lock-open fa-lg"</v-icon>
                <span slot="loader" class="custom-loader"><v-icon light>cached</v-icon></span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </form>
        <v-btn round v-if="register" block class="mt-3" color="warning" dark :disabled="loading" :loading="loading" @click="register = !register">Ja tinc usuari
          <v-icon right dark>fas fa-envelope</v-icon>
          <span slot="loader" class="custom-loader">
          <v-icon light>cached</v-icon>
          </span>
        </v-btn>
        <v-btn round v-if="!register" block class="mt-3" color="warning" dark :disabled="loading" :loading="loading" @click.prevent="onResetPassword">Recuperar la contrasenya
          <v-icon right dark>fas fa-envelope</v-icon>
          <span slot="loader" class="custom-loader">
          <v-icon light>cached</v-icon>
          </span>
        </v-btn>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
import '@fortawesome/fontawesome-free/css/all.css'
import firebase from 'firebase/app'
export default {
  data () {
    return {
      email: '',
      password: '',
      loading: false,
      register: false,
      socialLogins: [
        {
          title: 'Inici de sessió amb Google',
          color: 'red',
          click: this.onSigninGoogle,
          icon: 'fab fa-google'
        },
        {
          title: 'Inici de sessió Facebook',
          color: 'primary',
          click: this.signUserInFacebook,
          icon: 'fab fa-facebook-square'
        },
        {
          title: 'Inici de sessió Github',
          color: null,
          click: this.signUserInGithub,
          icon: 'fab fa-github'
        },
        {
          title: 'Inici de sessió Twitter',
          color: 'info',
          click: this.signUserInTwitter,
          icon: 'fab fa-twitter'
        }
      ]
    }
  },
  /* computed: {
    user () {
      return this.$store.getters.user
    },
    error () {
      return this.$store.getters.error
    },
    loading () {
      return this.$store.getters.loading
    }
  },
  watch: {
    user (value) {
      if (value !== null && value !== undefined) {
        this.$router.push('/')
      }
    }
  }, */
  methods: {
    onSignup () {
      let self = this
      firebase.auth().createUserWithEmailAndPassword()
        .catch(error => alert('🤕' + error.message))
        .then(data => {
          self.$router.push('/')
        })
    },
    onSignin () {
      let self = this
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .catch(error => alert('🤕' + error.message))
        .then(data => {
          self.$router.push('/')
        })
      // this.$store.dispatch('signUserIn', {email: this.email, password: this.password})
    },
    onSigninGoogle () {
      let self = this
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithPopup(provider)
        .catch(error => alert('🤕' + error.message))
        .then(data => {
          self.$router.push('/')
        })
    }
    /* onSigninFacebook () {
      this.$store.dispatch('signUserInFacebook')
    },
    onSigninGithub () {
      this.$store.dispatch('signUserInGithub')
    },
    onSigninTwitter () {
      this.$store.dispatch('signUserInTwitter')
    },
    onResetPassword () {
      if (this.email === '') {
        return this.$store.dispatch('setError', {message: 'Email no pot estar en blanc'})
      }
      this.$store.dispatch('resetPasswordWithEmail', {email: this.email})
    },
    onDismissed () {
      this.$store.dispatch('clearError')
    } */
  }
}

</script>
