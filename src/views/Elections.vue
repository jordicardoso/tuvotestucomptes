<template>
  <v-container grid-list-lg>
    <v-layout column>
      <v-card>
        <v-card-title class="headline pb-0">
          <v-icon color="primary" class="mr-2">{{ $route.meta.icon }}</v-icon>{{ $route.meta.title }}
        </v-card-title>
        <v-list two-line subheader>
          <v-list-tile v-for="eleccio in eleccions" :key="eleccio.Descripció" @click="openPartits(eleccio)">
            <v-list-tile-content>
              <v-list-tile-title class="text--primary">{{ eleccio.Descripció }}</v-list-tile-title>
                <v-list-tile-sub-title type="date">{{ eleccio.data | getDate }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon color="grey lighten-1" @click="openPartits(eleccio)">info</v-icon>
                </v-btn>
              </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
      <v-card color="blue-grey darken-2" class="white--text mt-3" v-if="eleccio">
        <v-card-title><h2>Partits</h2></v-card-title>
        <v-list two-line subheader>
          <v-list-tile v-for="partit in partits" :key="partit.abreviat">
            <v-list-tile-content>
              <v-list-tile-action-text class="text--primary">{{ partit.abreviat }}</v-list-tile-action-text>
                <v-list-tile-sub-title>{{ partit.nom }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon color="grey lighten-1">info</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
import { db } from '../main'

export default {
  name: 'Form',
  data () {
    return {
      eleccions: [],
      partits: [],
      eleccio: null,
      partit: null,
      valid: true
    }
  },
  firestore () {
    return {
      eleccions: db.collection('eleccions').orderBy('data')
    }
  },
  computed: {
  },
  filters: {
    getDate: function (value) {
      const outDate = value
      let day = outDate.toDate().getDate()
      let month = outDate.toDate().getMonth() + 1
      let year = outDate.toDate().getFullYear()
      return (day + '/' + month + '/' + year)
    }
  },
  methods: {
    openPartits (eleccio) {
      this.partits = []
      this.eleccio = eleccio
      var self = this
      db.collection('eleccions').doc('K92HNeLF7hsBDA1KntKB').collection('partits').orderBy('abreviat')
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.partits.push(doc.data())
          })
        })
    }
  }
}
</script>
