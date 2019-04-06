<template>
  <v-dialog v-model="dialog" scrollable fullscreen>
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="closeDialog"><v-icon>close</v-icon></v-btn>
        <v-toolbar-title>Registre de vots</v-toolbar-title>
        <v-spacer/>
        <v-toolbar-items><v-btn dark flat @click="saveRecompte">Guardar</v-btn></v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pa-0" >
        <v-list>
          <v-list-tile v-for="item in detalls" :key="item.titol" class="pa-0 ma-0">
            <v-list-tile-content>
              <v-list-tile-title>{{ item.titol }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ item.subtitol }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-form >
          <v-text-field required box hide-details class="mx-2 mb-1" v-model="recompte.totalVots" @focus.native="$event.target.select()" type="number" label="Total Vots" placeholder='0' required/>
          <v-layout mx-1 wrap v-if="recompte.idMesa">
            <!-- TODO: Fer un loading -->
            <v-flex xs6 v-for="partit in recompte.vots" v-bind:key="partit.idPartit">
              <v-text-field required hide-details class="mb-1 mx-1" v-model="partit.vots" @focus.native="$event.target.select()" type="number" min="0" :label="partit.nom" placeholder='0' required/>
            </v-flex>
          </v-layout>
        </v-form>
        <!--https://stackoverflow.com/questions/44989162/file-upload-in-vuetify-->
        <input type="file" ref="image" style="display:none" accept="image/*" capture="environment" @change="onFilePicked">
        <v-btn :loading="adjuntant" :disabled="adjuntant" block large color="primary" @click="pickFile"><v-icon left>camera</v-icon>Adjuntar foto de l'acta</v-btn>
        <v-progress-linear v-show="adjuntant" v-model="progress"></v-progress-linear>
        <v-img v-if="recompte.refActa" :src="recompte.refActa"/>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { db, idEleccions, storage } from '../main'
export default {
  props: ['mesa','provincia','dialog'],
  data () {
    return {
      partits: null,
      imageName: '',
      imageFile: '',
      imageUrl: '',
      adjuntant: false,
      progress: 0,
      recompte: {}
    }
  },
  mounted () {
    var self = this
    //db.collection('eleccions').doc(idEleccions)
    db.collection('vots')
      // .where('idUser', '==', this.$root.user.uid)
      .where('idMesa', '==', this.mesa.idMesa)
      .where('idEleccions', '==', idEleccions)
      .orderBy('data', 'desc').limit(1).get().then(function (querySnapshot) {
        self.init()
        querySnapshot.forEach(function (doc) {
          let obj = doc.data()
          if (obj) {
            // obj.id = doc.id
            // TODO: sincronitzar objecte en comptes de copiar-lo tal qual
            self.recompte = obj
          }
        })
      })
  },
  firestore () {
    return {
      partits: db.collection('eleccions').doc(idEleccions).collection('partits').orderBy('nom')
      //partits: db.collection('eleccions').doc(idEleccions)
    }
  },
  computed: {
    detalls () {
      return [
        {
          titol: this.mesa.municipi,
          subtitol: this.mesa.localElectoral
        },
        {
          titol: 'Mesa ' + this.identificacioMesa,
          subtitol: this.mesa.idMesa
        }
      ]
    },
    identificacioMesa () {
      return this.mesa.mesa + ': ' + this.mesa.lletraInici + ' - ' + this.mesa.lletraFi
    },
    sumaVots () {
      var sum = 0
      for (let el in this.recompte.vots) {
        sum += parseInt(this.recompte.vots[el].vots)
      }
      return sum
    },
    recompteCorrecte () {
      return this.sumaVots === parseInt(this.recompte.totalVots)
    },
    partitsVots () {
      var obj = []
      for (let idPartit in this.partits) {
        obj.push(
          {
            idPartit: idPartit,
            nom: this.partits[idPartit].nom,
            abreviat: this.partits[idPartit].abreviat,
            vots: null
          }
        )
      }
      return obj
    }
  },
  methods: {
    init () {
      this.recompte = {
        // _____RELACIONS_____
        // Província
        codProv: this.mesa.codProv,
        // Comarca
        // idComarda: null,
        // codComarda: null,
        // Municipi
        // idMunicipi: null,
        codMunicipi: this.mesa.codMunicipi,
        municipi: this.mesa.municipi,
        // Districte
        // idDistricte: this.mesa.districte + '',
        // Mesa
        // idMesaFirebase: this.mesa.id,
        idMesa: this.mesa.idMesa,
        // codMesa: this.mesa.codMesa,
        // Eleccions
        idEleccions: idEleccions,
        // Usuari
        idUser: this.$root.user.uid,
        // ______PROPIETATS_____
        data: '',
        processat: false,
        // ______REGISTRE EN SI______
        refActa: null,
        totalVots: 0,
        vots: this.partitsVots
      }
    },
    closeDialog () {
      this.$emit('close', null)
    },
    onFilePicked (f) {
      const files = f.target.files
      if (files[0] !== undefined) {
        let self = this
        this.adjuntant = true
        this.imageName = files[0].name
        if (this.imageName.lastIndexOf('.') <= 0) {
          return
        }
        const fr = new FileReader()
        fr.readAsDataURL(files[0])
        fr.addEventListener('load', () => {
          // this.imageUrl = fr.result
          this.imageFile = files[0] // this is an image file that can be sent to server...
          var storageRef = storage.ref()
          var ref = storageRef.child(this.recompte.idMesa + '/' + this.$root.user.uid + '/' + new Date().getTime() + '/' + this.imageFile.name)
          var progress = ref.put(this.imageFile)
          /* .then(function (snapshot) {
            console.log('ref.put(...')
            console.log(snapshot)
            this.adjuntant = false
          }) */
          progress.on('state_changed', function (snapshot) {
            self.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          }, function (error) {
            // Handle unsuccessful uploads
            console.log(error)
          }, function () {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            progress.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              // console.log('File available at', downloadURL)
              self.imageUrl = downloadURL
              self.recompte.refActa = downloadURL
              self.adjuntant = false
            })
          })
        })
      } else {
        this.imageName = ''
        this.imageFile = ''
        this.imageUrl = ''
      }
    },
    pickFile () {
      this.$refs.image.click()
    },
    saveRecompte () {
      if (this.recompteCorrecte && this.totalVots > 0) {
        this.recompte.data = new Date()
        let self = this
        db.collection('vots').add(this.recompte).then(function () {
          self.mesa.registrat = true
          db.collection('meses').doc(self.mesa.id).update({ registrat: true }).then(() => {
            self.$emit('close', self.recompte)
          }).catch((error) => {
            console.log(error)
            alert('🤕\nNo s\'ha pogut guardar')
          })
        })
      } else if (this.totalVots > 0) {
        alert('🤕\nLa suma de vots dels partits no és igual al total de vots')
      } else {
        alert('🤕\nCal registrar vots per poder guardar')
      }
    }
  }
}
</script>
