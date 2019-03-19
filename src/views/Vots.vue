<template>
  <v-container grid-list-lg>
    <v-layout column>
        <v-card>
          <v-card-title class="headline pb-0">
            <v-icon color="primary" class="mr-2">{{ $route.meta.icon }}</v-icon>{{ $route.meta.title }}
          </v-card-title>
          <v-card-text class="pt-0">
            <v-form ref="Form">
              <v-select :items="provincies" v-model="provincia" label="Província" v-on:change="provinciaChange"/>
              <v-select v-if="provincia" :items="filteredComarques" :loading="loadingMunicipis" item-text="Nom" return-object v-model="comarca" label="Comarca" v-on:change="comarcaChange"/>
              <v-select v-if="comarca" :items="filteredMunicipis" :loading="loadingMeses" item-text="Nom" return-object v-model="municipi" label="Municipi" v-on:change="municipiChange"/>
              <v-select v-if="districtes" :items="districtes" :loading="loadingDistrictes" item-text="nomDistricte" return-object v-model="districte" label="Districte" v-on:change="districteChange"/>
            </v-form>
          </v-card-text>
        </v-card>
        <v-card color="blue-grey darken-2" class="white--text mt-3" v-if="meses">
          <v-card-title><h2>Meses</h2></v-card-title>
          <v-list two-line subheader dense>
            <v-list-tile v-for="mesa in meses" :key="mesa.idMesa" avatar @click="openDialog(mesa)">
              <v-list-tile-content>
                <v-list-tile-action-text class="text--primary">{{ mesa.localElectoral }}</v-list-tile-action-text>
                <v-list-tile-sub-title><span class='text--primary'>{{ mesa.mesa }} : {{ mesa.lletraInici }} - {{ mesa.lletraFi }}</span> &mdash; {{ mesa.idMesa }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon :class="[ mesa.registreVots ? 'green--text' : 'grey--text' ]" @click="openDialog(mesa)">how_to_vote</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
        <form-recompte-dialog v-if="dialog" :mesa="mesa" v-on:close="formRecompteClose" :dialog="dialog"/>
    </v-layout>
  </v-container>
</template>

<script>
import { db } from '../main'
import FormRecompteDialog from '../components/FormRecompteDialog'
export default {
  name: 'Form',
  components: {
    'form-recompte-dialog': FormRecompteDialog
  },
  data () {
    return {
      provincia: null,
      comarca: null,
      municipi: null,
      mesa: '', // Ha d'estar així, ja que no pot ser null
      districte: null,
      codComarca: null,
      codMunicipi: null,
      provincies: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
      comarques: null,
      municipis: null,
      meses: null,
      districtes: null,
      dialog: null,
      loadingMunicipis: false,
      loadingMeses: false,
      loadingDistrictes: false
    }
  },
  firestore () {
    return {
      comarques: db.collection('comarques').orderBy('Nom')
    }
  },
  computed: {
    filteredComarques () {
      if (this.comarques) return this.comarques.filter(o => o.Provincia === this.provincia)
    },
    filteredMunicipis () {
      if (this.municipis) return this.municipis.filter(o => o['Codi comarca'] === this.comarca.Codi)
    }
  },
  methods: {
    provinciaChange () {
      this.dialog = null
      this.comarca = null
      this.municipi = null
      this.districtes = null
      this.meses = null
      this.mesa = ''
    },
    comarcaChange () {
      var self = this
      this.dialog = null
      this.municipi = null
      this.districtes = null
      this.meses = null
      this.mesa = ''
      this.loadingMunicipis = true
      // TODO: No tornar a carregar municipis que ja tenim en memòria
      db.collection('municipis')
        .where('Codi comarca', '==', this.comarca.Codi)
        .orderBy('Nom')
        .get()
        .then(function (querySnapshot) {
          self.municipis = []
          querySnapshot.forEach(function (doc) {
            let obj = doc.data()
            obj.id = doc.id
            self.municipis.push(obj)
          })
          self.loadingMunicipis = false
        })
    },
    municipiChange () {
      var self = this
      this.dialog = null
      this.districtes = null
      this.meses = null
      this.mesa = ''
      this.loadingMeses = true
      if (!this.municipi.filtreDistricte) {
        db.collection('meses')
          .where('codMunicipi', '==', this.municipi.Codi)
          .get()
          .then(function (querySnapshot) {
            self.meses = []
            querySnapshot.forEach(function (doc) {
              let obj = doc.data()
              obj.id = doc.id
              self.meses.push(obj)
            })
            self.loadingMeses = false
          })
      } else {
        db.collection('districtes')
          .where('codiMunicipi', '==', this.municipi.Codi)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              self.districtes = doc.data().districtes
            })
            self.loadingMeses = false
          })
      }
    },
    districteChange () {
      var self = this
      this.dialog = null
      this.meses = null
      this.mesa = ''
      this.loadingDistrictes = true
      db.collection('meses')
        .where('codMunicipi', '==', this.municipi.Codi)
        .where('districte', '==', this.districte.idDistricte)
        .get()
        .then(function (querySnapshot) {
          self.meses = []
          querySnapshot.forEach(function (doc) {
            self.meses.push(doc.data())
          })
          self.loadingDistrictes = false
        })
    },
    openDialog (mesa) {
      this.mesa = mesa
      this.dialog = true
    },
    formRecompteClose (recompte) {
      this.dialog = false
      // TODO: actualitzar la llista en calent
    }
  }
}
</script>
