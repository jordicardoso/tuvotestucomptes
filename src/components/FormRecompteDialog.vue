<template>
  <v-dialog v-model="dialog" scrollable fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="closeDialog"><v-icon>close</v-icon></v-btn>
        <v-toolbar-title>Registre de Vots</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items><v-btn dark flat @click="saveRecompte">Guardar</v-btn></v-toolbar-items>
      </v-toolbar>
      <v-card-text class="pt-1">
          <v-layout wrap>
            <v-flex xs12 sm6 md4>
              <v-text-field class="mb-1" hide-details label="Municipi" :placeholder="mesa.municipi" readonly></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field class="mb-1" hide-details label="Local Electoral" :placeholder="mesa.localElectoral" readonly></v-text-field>
            </v-flex>
            <v-flex xs6>
              <v-text-field hide-details label="Identificació de la Mesa" :placeholder=" mesa.idMesa + ' ' + mesa.mesa + ' : ' + mesa.lletraInici + ' - ' + mesa.lletraFi" readonly></v-text-field>
            </v-flex>
            <v-flex offset-xs1 xs5>
              <v-text-field outline hide-details class="mb-1" v-model="recompte.totalVots" @focus="$event.target.select()" type="number" label="Total Vots" placeholder='0' required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout wrap v-if="recompte.idMesa">
            <v-flex xs4 v-for="partit in recompte.vots" v-bind:key="partit.idPartit">
              <v-text-field box hide-details class="mb-2 mr-1" v-model="partit.vots" @focus="$event.target.select()" type="number" min="0" :label="partit.abreviat" placeholder='0' required></v-text-field>
            </v-flex>
          </v-layout>
          <!--https://stackoverflow.com/questions/44989162/file-upload-in-vuetify-->
          <input type="file" ref="image" style="display:none" accept="image/*" capture="environment" @change="onFilePicked">
          <v-btn :loading="adjuntant" :disabled="adjuntant" block large color="secondary" @click="pickFile"><v-icon left>camera</v-icon>Adjuntar foto de l'acta</v-btn>
          <v-progress-linear v-show="adjuntant" v-model="progress"></v-progress-linear>
          <v-img :src="imageUrl"/>
          <!--<div class="camera-modal">
            <video ref="video" class="camera-stream"/>
            <div class="camera-modal-container">
              <span @click="capture" class="take-picture-button take-picture-button mdl-button mdl-js-button mdl-button--fab mdl-button--colored">
                <i class="material-icons">camera</i>
              </span>
            </div>
          </div>-->
        <!--<code>{{mesa}}</code>-->
        <!--<code>{{recompte}}</code>-->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { db, idEleccions } from '../main'
import firebase from 'firebase/app'
export default {
  props: ['mesa', 'dialog'],
  data () {
    return {
      // dialog: false,
      // mesa: null,
      resolve: null,
      reject: null,
      partits: null,
      mediaStream: null,
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
    /* navigator.mediaDevices.getUserMedia({ video: true })
      .then(mediaStream => {
        this.mediaStream = mediaStream
        this.$refs.video.srcObject = mediaStream
        this.$refs.video.play()
      })
      .catch(error => console.error('getUserMedia() error:', error)) */
  },
  /* destroyed () {
    const tracks = this.mediaStream.getTracks()
    tracks.map(track => track.stop())
  }, */
  firestore () {
    return {
      partits: db.collection('eleccions').doc(idEleccions).collection('partits').orderBy('nom')
    }
  },
  computed: {
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
      for (var idPartit in this.partits) {
        obj.push(
          {
            idPartit: idPartit,
            nom: this.partits[idPartit].nom,
            abreviat: this.partits[idPartit].abreviat,
            vots: 0
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
    /* capture () {
      const mediaStreamTrack = this.mediaStream.getVideoTracks()[0]
      const imageCapture = new window.ImageCapture(mediaStreamTrack)
      return imageCapture.takePhoto().then(blob => {
        console.log(blob)
      })
    }, */
    closeDialog () {
      // this.dialog = false
      this.$emit('close', null)
    },
    onFilePicked (f) {
      console.log(f)
      const files = f.target.files
      if (files[0] !== undefined) {
        this.adjuntant = true
        this.imageName = files[0].name
        if (this.imageName.lastIndexOf('.') <= 0) {
          return
        }
        const fr = new FileReader()
        fr.readAsDataURL(files[0])
        fr.addEventListener('load', () => {
          this.imageUrl = fr.result
          this.imageFile = files[0] // this is an image file that can be sent to server...
          console.log(this.imageUrl)
          console.log(this.imageFile)
          var storageRef = firebase.storage().ref()
          var ref = storageRef.child(this.imageFile.name)
          var progress = ref.put(this.imageFile).then(function (snapshot) {
            console.log('ref.put(...')
            console.log(snapshot)
            this.adjuntant = false
          })
          progress.on('state_changed', function (snapshot) {
            this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          }, function (error) {
            // Handle unsuccessful uploads
            console.log(error)
          }, function () {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            progress.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              console.log('File available at', downloadURL)
              this.imageUrl = downloadURL
              this.recompte.refActa = downloadURL
              this.adjuntant = false
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
      if (this.recompteCorrecte) {
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
      } else {
        alert('🤕\nLa suma de vots dels partits no és igual al total de vots')
      }
    }
  }
}
</script>

<style scoped>
/* .camera-modal {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    background-color: white;
    z-index: 10;
}
.camera-stream {
    width: 100%;
    max-height: 100%;
} */
</style>
