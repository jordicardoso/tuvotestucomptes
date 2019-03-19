<template>
  <v-container grid-list-lg>
    <v-layout column>
      <v-card>
        <v-card-title class="headline pb-0">
          <v-icon color="primary" class="mr-2">{{ $route.meta.icon }}</v-icon>{{ $route.meta.title }}
        </v-card-title>
        <v-card-text class="pt-0">
          <v-form ref="Form" v-model="valid" lazy-validation>
            <v-select :items="provincies" v-model="provincia" label="Província" v-on:change="provinciaChange"></v-select>
            <v-select :items="filteredComarques" :loading="loadingMunicipis" item-text="Nom" v-model="comarca" v-if="provincia" label="Comarca" v-on:change="comarcaChange"></v-select>
            <v-select :items="filteredMunicipis" :loading="loadingMeses" item-text="Nom" v-model="municipi" v-if="comarca" label="Municipi" v-on:change="municipiChange"></v-select>
          </v-form>
        </v-card-text>
      </v-card>
      <v-card color="blue-grey darken-2" class="white--text mt-3" v-if="municipi">
        <v-card-title>
          <h2>Meses</h2>
        </v-card-title>
        <v-list two-line subheader v-if="municipi">
          <v-list-tile v-for="mesa in meses" :key="mesa.idMesa" avatar @click="openDialog(mesa)">
            <v-list-tile-content>
              <v-list-tile-action-text class="text--primary">{{ mesa.localElectoral }}</v-list-tile-action-text>
                <v-list-tile-sub-title>{{ mesa.idMesa }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon color="grey lighten-1" @click="openDialog(mesa)">info</v-icon>
                </v-btn>
              </v-list-tile-action>
              <v-dialog v-model="dialog" v-if="dialog" @close="dialog = false" :data="dialogData" max-width="500px">
                <v-card>
                  <v-card-title class="headline grey lighten-2">Dades Mesa</v-card-title>
                  <v-card-text>
                    <v-layout wrap align-content-space-around text-xs-left>
                    <v-flex xs11>
                      <v-text-field
                        label="idMesa" :placeholder="mesa.idMesa" readonly>
                      </v-text-field>
                      <v-text-field
                        label="Adreça" :placeholder="mesa.adreça" readonly>
                      </v-text-field>
                      <v-text-field
                        label="Local Electoral" :placeholder="mesa.localElectoral" readonly
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        label="Lletra Inicial" :placeholder="mesa.lletraInici" readonly>
                      </v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        label="Lletra Final" :placeholder="mesa.lletraFi" readonly>
                      </v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        label="Mesa" :placeholder="mesa.mesa" readonly></v-text-field>
                    </v-flex>
                    </v-layout>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-btn color="primary" flat @click="dialog=false">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
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
      dialog: false,
      provincia: null,
      comarca: null,
      municipi: '',
      mesa: null,
      codComarca: null,
      codMunicipi: null,
      provincies: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
      comarques: [],
      municipis: [],
      meses: [],
      valid: true,
      loadingMeses: false,
      loadingMunicipis: false
    }
  },
  firestore () {
    return {
      comarques: db.collection('comarques').orderBy('Nom')
    }
  },
  computed: {
    filteredComarques () {
      let options = this.comarques
      return options.filter(o => o.Provincia === this.provincia)
    },
    filteredMunicipis () {
      let options = this.municipis
      return options.filter(o => o['Nom comarca'] === this.comarca)
    }
  },
  methods: {
    provinciaChange () {
      this.comarca = null
      this.municipi = null
      this.meses = []
    },
    comarcaChange () {
      this.municipi = null
      this.loadingMunicipis = true
      this.meses = []
      let options = this.comarques
      var self = this
      let cod = options.filter(o => o.Nom === this.comarca)
      this.codComarca = cod[0].Codi
      db.collection('municipis').where('Codi comarca', '==', this.codComarca).orderBy('Nom')
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.municipis.push(doc.data())
            self.loadingMunicipis = false
          })
        })
    },
    municipiChange () {
      this.meses = []
      this.loadingMeses = true
      let options = this.municipis
      var self = this
      let cod = options.filter(o => o.Nom === this.municipi)
      this.codMunicipi = cod[0].Codi
      console.log(this.codMunicipi)
      db.collection('meses').where('codMunicipi', '==', this.codMunicipi)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.meses.push(doc.data())
            self.loadingMeses = false
          })
        })
    },
    openDialog (mesa) {
      this.dialogData = mesa
      this.dialog = true
    }
  }
}
</script>
