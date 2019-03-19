<template>
  <v-dialog v-model="dialog" scrollable fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="closeDialog"><v-icon>close</v-icon></v-btn>
        <v-toolbar-title>Registre de Vots</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items><v-btn dark flat @click="saveRecompte">Guardar</v-btn></v-toolbar-items>
      </v-toolbar>
      <v-card-text>
          <v-layout wrap>
            <v-flex xs12 sm6 md4>
              <v-text-field label="Municipi" :placeholder="mesa.municipi" readonly></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field label="Local Electoral" :placeholder="mesa.localElectoral" readonly></v-text-field>
            </v-flex>
            <v-flex xs6>
              <v-text-field label="Identificació de la Mesa" :placeholder=" mesa.idMesa + ' ' + mesa.mesa + ' : ' + mesa.lletraInici + ' - ' + mesa.lletraFi" readonly></v-text-field>
            </v-flex>
            <v-flex xs6>
              <v-text-field outline v-model="recompte.totalVots" type="number" label="Total Vots" placeholder='0' required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout wrap>
            <v-flex xs3 v-for="partit in partits" v-bind:key="partit.Nomcurt">
              <v-text-field box v-model="recompte.partits[partit.id]" type="number" min="0" :label="partit.Nomcurt" placeholder='0' required></v-text-field>
            </v-flex>
          </v-layout>
        <!--<code>{{mesa}}</code>
        <code>{{recompte}}</code>-->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { db, idEleccions } from '../main'

export default {
  props: ['mesa', 'dialog'],
  data () {
    return {
      // dialog: false,
      // mesa: null,
      resolve: null,
      reject: null,
      partits: null,
      recompte: {
        codProv: this.mesa.codProv + '',
        idEleccions: idEleccions,
        idMesa: this.mesa.idMesa,
        idUser: this.$root.user.uid,
        municipi: this.mesa.municipi,
        processat: false,
        refActa: null,
        partits: {}
      }
    }
  },
  mounted(){
    var self = this
    db.collection('vots')
        .where('idUser', '==', this.$root.user.uid)
        .where('idMesa', '==', this.mesa.idMesa)
        .where('idEleccions', '==', idEleccions)
        .orderBy('data','desc').limit(1).get().then(function (querySnapshot) {
            self.recompte = {}
            querySnapshot.forEach(function (doc) {
              let obj = doc.data()
              obj.id = doc.id
              self.recompte.push(obj)
            })
            // self.loadingMunicipis = false
          })
  },
  firestore () {
    console.log(this.mesa.idMesa)
    console.log(this.$root.user.uid)
    return {
      partits: db.collection('eleccions').doc(idEleccions).collection('partits').orderBy('Nomcurt'),
      /* recompte: db.collection('vots')
        .where('idUser', '==', this.$root.user.uid)
        .where('idMesa', '==', this.mesa.idMesa)
        .where('idEleccions', '==', idEleccions)
        .orderBy('data','desc').limit(1) */
    }
  },
  methods: {
    closeDialog () {
      // this.dialog = false
      console.log(this.partits)
      this.$emit('close', null)
    },
    saveRecompte () {
      this.recompte.data = new Date()
      let self = this
      db.collection('vots').add(this.recompte).then(function () {
        /* db.collection('meses').doc(this.mesa.idMesa).set({
          registreVots = true
        },{ merge: true }) */
        self.mesa.registreVots = true
        db.collection('meses')
          .where('idMesa', '==', self.mesa.idMesa)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              // console.log(doc)
              // console.log(doc.data())
              // db.collection('meses').doc(doc.id).set(self.mesa.idMesa)
            })
            // self.loadingMeses = false
          })
        // db.collection('meses')
          // .where('idMesa', '==', self.mesa.idMesa).get().update(self.mesa)
        // self.mesa.registreVots = true
        // self.mesa.update(self.mesa)
      })
      this.$emit('close', this.recompte)
    }
  }
}
</script>
