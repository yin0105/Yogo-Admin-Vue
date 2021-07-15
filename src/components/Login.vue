<template>
  <div class="relative__container--100">
    <div class="modal__fixed--container-bg"></div>
    <div class="login modal__fixed--container">
      <!--<img :src="Imgix(client.logo_white.filename)" alt="" class="logo-svg"
           v-if="client && client.logo_white.filename.slice(-4) === '.svg'">
      <img :src="Imgix(client.logo_white.filename, {w:400,h:200})" alt="" class="logo-bitmap" v-else-if="client">-->
      <ModalLogo/>
      <div class="modal__fixed--inner">
        <h2 class="my-0 py-2">{{ $t('global.AdminLogin') }}</h2>
        <div class="space4"></div>
        <div class="message" v-show="loginErrorMessage">{{ loginErrorMessage }}</div>
        <form novalidate @submit.prevent="submitForm">
          <md-field :class="getValidationClass('email')">
            <label>{{ $t('global.Email') }}</label>
            <md-input required type="email" v-model="form.email" autocomplete="email"></md-input>
            <span class="md-error" v-if="!$v.form.email.required">{{ $t('global.EmailMust') }}</span>
            <span class="md-error" v-else-if="!$v.form.email.email">{{ $t('global.EmailNotValid') }}</span>
          </md-field>

          <md-field :class="getValidationClass('password')">
            <label>{{ $t('global.Password') }}</label>
            <md-input v-model="form.password" required type="password"></md-input>
            <span class="md-error" v-if="!$v.form.password.required">{{ $t('global.PasswordMust') }}</span>
          </md-field>
          <div class="login-failed" v-if="loginFailed">{{ $t('global.wrongEmailOrPassword') }}</div>
          <div class="space4"></div>
          <div class="margin__bottom--mobile">
            <md-checkbox type="checkbox" v-model="rememberMe">
              {{ $t('global.rememberMeLabel') }}
            </md-checkbox>
          </div>
          <div class="flex--row space--between">
            <md-button class="md-raised md-primary" type="submit">
              {{ $t('global.login') }}
            </md-button>
            <router-link class="upper text-yellow" :to="{name: 'PasswordReset'}">{{ $t('global.forgotPass') }}</router-link>
          </div>
        </form>
      </div>
    </div>

    <md-dialog-alert :md-active.sync="showEmailAndPasswordDoesntMatchDialog" :md-title="$t('global.loginError')"
                     :md-content="$t('global.EmailOrPasswordWrong')"></md-dialog-alert>
  </div>

</template>

<script>

  import {validationMixin} from 'vuelidate'
  import {
    required,
    email,
    sameAs,
  } from 'vuelidate/lib/validators'

  import {mapGetters} from 'vuex'

  import YogoApi from '@/gateways/YogoApi'

  import Imgix from '@/services/Imgix'
  import ModalLogo from './ModalLogo'

  export default {
    mixins: [validationMixin, Imgix],
    components: { ModalLogo },
    data() {
      return {
        email: '',
        password: '',
        rememberMe: false,
        loginErrorMessage: '',
        loginFailed: false,
        form: {
          email: '',
          password: '',
        },

        showEmailAndPasswordDoesntMatchDialog: false,
      }
    },
    computed: {
      ...mapGetters([
        'requestedRoute',
        'client',
      ]),
    },
    methods: {
      submitForm() {
        this.$v.$touch()

        if (this.$v.$invalid) return

        this.doLogin()

      }
      ,
      getValidationClass(fieldName) {
        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      doLogin: async function () {
        try {

          this.$v.$touch()

          if (this.$v.$invalid) return

          const response = await YogoApi.post('/login', this.form)

          if (response === 'E_LOGIN_FAILED') {
            this.showEmailAndPasswordDoesntMatchDialog = true
          }

          if (response === 'E_USER_IS_NOT_ADMIN') {
            alert(this.$t('global.PasswordIsCorrectButNotAccessToAdmin'))
          }

          if (!response.user || !response.token) {
            return
          }
          if (this.rememberMe) {
            window.localStorage.setItem('accessToken', response.token)
            window.sessionStorage.removeItem('accessToken')
          } else {
            window.localStorage.removeItem('accessToken')
            window.sessionStorage.setItem('accessToken', response.token)
          }
          await this.$store.dispatch('updateUser', response.user.id)
          if (this.requestedRoute) {
            const requestedRoute = _.pick(this.requestedRoute, ['name', 'params'])
            this.$store.commit('setRequestedRoute', null)
            this.$router.push(requestedRoute)
          } else {
            this.$router.push({name: 'Dashboard'})
          }


        } catch (err) {
          console.log(err.response)
        }

      },
    },
    validations: {
      form: {
        email: {
          required,
          email,
        },
        password: {
          required,
        },
      },
    },
  }

</script>

<style lang="stylus" scoped="true">

  label
    display block
    height 100%

  .router-link-active
    background none

  /*    input[type=checkbox]
          position: static
          opacity: 1*/

  input.error
    border-color: red;

</style>
