<template>
  <div class="relative__container--100">
    <div class="modal__fixed--container-bg"></div>
    <div class="login modal__fixed--container">
      <!--<img :src="Imgix(client.logo_white.filename)" alt="" class="logo-svg"
           v-if="client && client.logo_white.filename.slice(-4) === '.svg'">
      <img :src="Imgix(client.logo_white.filename, {w:400,h:200})" alt="" class="logo-bitmap" v-else-if="client">-->
      <ModalLogo/>
      <loading-animation v-if="loading"></loading-animation>

      <div v-if="!loading">

        <div class="modal__fixed--inner">
          <h2 class="my-0 py-2">{{ $t('global.NewPassword') }}</h2>
          <div class="space4"></div>
          {{ $t('global.EnterYourNewPassword') }}
          <div class="space4"></div>

          <form @submit.prevent="submit" novalidate>


            <md-field :class="getValidationClass('password')">
              <label>{{ $t('global.Password') }}</label>
              <md-input v-model="form.password" required type="password" autocomplete="off"></md-input>
              <span class="md-error" v-if="!$v.form.password.required">{{ $t('global.PasswordMust') }}</span>
              <span class="md-error" v-else-if="!$v.form.password.passwordStrength">
                {{ $t('global.passDesc') }}
              </span>
            </md-field>

            <md-field :class="getValidationClass('password_repeat')">
              <label>{{ $t('global.repeatPass') }}</label>
              <md-input v-model="form.password_repeat" required type="password" autocomplete="off"></md-input>
              <span class="md-error" v-if="!$v.form.password_repeat.required">{{ $t('global.passwordMustBeRepeated') }}</span>
              <span class="md-error"
                    v-else-if="!$v.form.password_repeat.sameAsPassword">{{ $t('global.passwordIsDifferent') }}</span>
            </md-field>
            <div class="space4"></div>
            <div class="flex--row space--between">
              <md-button class="md-raised md-primary" type="submit">
                {{ $t('global.setNewPassword') }}
              </md-button>

            </div>
          </form>
        </div>

      </div>

      <md-dialog-alert :md-active.sync="showAlert" :md-title="alertTitle"
                       :md-content="alertText" @md-closed="alertClosed"></md-dialog-alert>

    </div>
  </div>
</template>

<script>

  import YogoApi from '@/gateways/YogoApi'
  import router from '@/router/'
  import {mapGetters} from 'vuex'
  import LoadingAnimation from "./LoadingAnimation.vue"

  import Imgix from '@/services/Imgix'
  import ModalLogo from './ModalLogo'

  const {required} = require('vuelidate/lib/validators')

  export default {
    components: {
      ModalLogo,
      LoadingAnimation},
    mixins: [Imgix],
    data() {
      return {

        form: {
          password: '',
          password_repeat: '',
        },

        showAlert: false,
        alertTitle: '',
        alertText: '',

        loading: true,
      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    async created() {

      const email = this.$route.params.email
      const token = this.$route.params.token

      const response = await YogoApi.post('/password-reset-check-token', {
        email: email,
        token: token,
      })

      if (this.handleResponseErrors(response)) {
        this.loading = false
      }

    },
    methods: {
      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const email = this.$route.params.email
        const token = this.$route.params.token

        this.loading = true

        const response = await YogoApi.post('/password-reset-set-password-with-token', {
          email: email,
          token: token,
          password: this.form.password,
        })

        if (this.handleResponseErrors(response)) {
          this.alertTitle = this.$t('global.passwordUpdated')
          this.alertText = this.$t('global.youCanNowSignup')
          this.showAlert = true
        }

      },
      handleResponseErrors(response) {
        if (response === 'E_EMAIL_NOT_FOUND') {
          this.alertTitle = this.$t('global.emailNotFound')
          this.alertText = this.$t('global.Email') + ' ' + email + this.$t('global.doesNotExistInSystem')
          this.showAlert = true
          return false
        } else if (response === 'E_PASSWORD_TOO_WEAK') {
          this.alertTitle = this.$t('global.passwordNotStrong')
          this.alertText = this.$t('global.passDesc')
          this.showAlert = true
          return false
        } else if (response === 'E_INVALID_TOKEN') {
          this.alertTitle = this.$t('global.couldNotSetPassword')
          this.alertText = this.$t('global.linkExpiredText2')
          this.showAlert = true
          return false
        } else if (response === 'E_TOKEN_EXPIRED') {
          this.alertTitle = this.$t('global.linkExpired')
          this.alertText = this.$t('global.linkExpiredText')
          this.showAlert = true
          return false
        } else {
          return true
        }
      },
      alertClosed() {
        if (this.loading) {
          this.$router.push({name: 'Login'})
        }
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
    validations: {
      form: {
        password: {
          required,
          passwordStrength(value) {
            const upperCase = !!value.match(/[A-Z]+/)
            const lowerCase = !!value.match(/[a-z]+/)
            const numbers = !!value.match(/[0-9]+/)
            const length = value.length >= 6
            return upperCase && lowerCase && numbers && length
          },
        },
        password_repeat: {
          required,
          sameAsPassword(value) {
            return value === this.form.password
          },
        },
      },
    },
  }
</script>
