<template>
  <div class="roomedit">
    <div class="flex__2-1--container">
      <h2>{{ customerInfoTitle }}</h2>
    </div>
    <md-button class="md-raised">
      <router-link :to="{ name: 'Rooms' }">{{ $t('global.Back') }}</router-link>
    </md-button>

    <div>
      <md-field class="flex--50" :class="getValidationClass('name')">
        <label class="active">{{ $t('global.RoomName') }}</label>
        <md-input required v-model="form.name" ref="roomNameInput"></md-input>
        <span class="md-error" v-if="!$v.form.name.required">{{ $t('global.RoomNameMust') }}</span>
      </md-field>

      <md-field class="flex--50" v-if="client.branches && client.branches.length > 1">
        <label>{{ $t('global.Branch') }}</label>
        <md-select v-model="form.branch">
          <md-option value="0">-- {{ $t('global.NotChosen') }} --</md-option>
          <md-option v-for="branch in client.branches" :value="branch.id" :key="'branch_' + branch.id">{{ branch.name
            }}
          </md-option>
        </md-select>
      </md-field>

      <div class="space4"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
      <md-button class="md-raised md-primary red" @click.prevent="deleteRoom" v-if="$route.meta.formType === 'edit'">
        {{ $t('global.Delete') }}
      </md-button>

      <div class="space8"></div>
    </div>


  </div> <!-- customerinfo -->

</template>

<script>

  import LoadingAnimation from "./LoadingAnimation.vue"
  import YogoApi from '../gateways/YogoApi'
  import {mapGetters} from 'vuex'

  const {required, minLength} = require('vuelidate/lib/validators')

  export default {
    name: 'roomform',
    components: {},
    data() {
      return {
        customerInfoTitle: this.$route.meta.formType === 'edit' ? this.$t('global.EditRoom') : this.$t('global.CreateRoom'),
        form: {
          branch: 0,
        },
        roomLabel: 'Lokale',
        roomNameLabel: 'Lokalenavn',
        branchLabel: 'Afdeling',
        deleteRoomLabel: 'Slet lokale',
        saveLabel: this.$route.meta.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreateRoom'),

      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
      ]),
    },
    mounted() {
      if (this.$route.meta.formType === 'add') this.$refs.roomNameInput.$el.focus()
    },
    methods: {

      async fetchRoom() {
        this.form = await YogoApi.get('/rooms/' + this.$route.params.id)
      },

      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const roomData = _.pick(this.form, [
          'name',
          'branch',
        ])

        if (!roomData.branch || roomData.branch === "0") {
          roomData.branch = null
        }

        if (this.$route.meta.formType === 'edit') {

          await YogoApi.put('/rooms/' + this.$route.params.id, roomData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: roomData.name + this.$t('global.hasBeenUpdated'),
          })

        } else {

          await YogoApi.post('/rooms', roomData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.isCreated'),
          })

        }

        this.$router.push({name: 'Rooms'})

      },


      async deleteRoom() {
        if (!confirm(this.$t('global.AreYouSureYouWantToDelete') + this.form.name + this.$t('global.RoomWillStillWork'))) return

        await YogoApi.delete('/rooms/' + this.$route.params.id)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isDeleted'),
        })
        this.$router.push({name: 'Rooms'})

      },

      getValidationClass(fieldName) {

        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
    },
    created() {
      if (this.stateReady && this.$route.meta.formType === 'edit') this.fetchRoom()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState && this.$route.meta.formType === 'edit') this.fetchRoom()
      },
    },
    validations: {
      form: {
        name: {
          required,
        },
      },
    },
  }
</script>

<style lang="stylus">

</style>
