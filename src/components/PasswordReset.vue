<template>
  <div class="relative__container--100">
    <div class="modal__fixed--container-bg"></div>
    <div class="login modal__fixed--container">
      <!--<img :src="Imgix(client.logo_white.filename)" alt="" class="logo-svg"
           v-if="client && client.logo_white.filename.slice(-4) === '.svg'">
      <img :src="Imgix(client.logo_white.filename, {w:400,h:200})" alt="" class="logo-bitmap" v-else-if="client">-->
      <ModalLogo/>
      <div class="modal__fixed--inner">
        <loading-animation v-if="loading"></loading-animation>

        <div v-show="!loading">

          <h2 class="my-0 py-2">{{ $t('global.resetPass') }}</h2>
          <div class="space4"></div>
          {{ $t('global.resetPasswordDesc') }}
          <form @submit.prevent="submit">
            <md-field :class="getValidationClass('email')">
              <label>{{ $t('global.Email') }}</label>
              <md-input type="email" v-model="form.email"></md-input>
              <span class="md-error" v-if="!$v.form.email.required">{{ $t('global.EmailMust') }}</span>
              <span class="md-error" v-else-if="!$v.form.email.email">{{ $t('global.EmailNotValid') }}</span>
            </md-field>
            <div class="space4"></div>
            <div class="flex--row space--between">
              <md-button class="md-primary md-raised" type="submit">
                {{ $t('global.resetPass') }}
              </md-button>

              <router-link class="upper text-yellow" :to="{name: 'Login'}">{{ $t('global.Back') }}</router-link>
            </div>
          </form>
        </div>
      </div>

      <md-dialog-alert :md-active.sync="showEmailNotFoundDialog" :md-title="$t('global.UnknownEmail')"
                       :md-content="$t('global.PleaseCheckEmail')"></md-dialog-alert>
      <md-dialog-alert :md-active.sync="showSuccessDialog" :md-title="$t('global.EmailSent')"
                       :md-content="$t('global.WeHaveSentEmailDesc')"
                       @md-closed="onSuccessDialogClosed"></md-dialog-alert>

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

  const {required, email} = require('vuelidate/lib/validators')

  export default {
    components: {
      ModalLogo,
      LoadingAnimation,

    },
    mixins: [Imgix],
    data() {
      return {

        showEmailNotFoundDialog: false,
        showSuccessDialog: false,

        form: {
          email: '',
        },

        loading: false,
      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    methods: {
      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const location = window.location
        const route = this.$router.resolve({
          name: 'PasswordNew',
          params: {email: '{email}', token: '{token}'},
        })

        this.loading = true

        const response = await YogoApi.post('/password-reset-send-token', {
          email: this.form.email,
          setNewPasswordLink: location.protocol + '//' + location.host + location.pathname + route.href,
        })

        if (response === 'E_EMAIL_NOT_FOUND') {
          this.showEmailNotFoundDialog = true
        } else {
          this.showSuccessDialog = true
        }
        this.loading = false

      },
      getValidationClass(fieldName) {

        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      onSuccessDialogClosed() {
        this.$router.push({name: 'Login'})
      },
    },
    validations: {
      form: {
        email: {
          required,
          email,
        },
      },
    },
  }
</script>
