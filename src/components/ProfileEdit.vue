<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ $t('global.EditProfile') }}</h2>
      </div>

      <div class="space4"></div>
      <div class="space4"></div>

      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('first_name')">
          <label>{{ $t('global.FirstName') }}</label>
          <md-input required v-model="form.first_name"></md-input>
          <span class="md-error" v-if="!$v.form.first_name.required">{{ $t('global.FirstNameRequired') }}</span>
        </md-field>

        <imagefield imageFormat="profile" :imageId.sync="form.image" class="flex--50 tablet__move--up"></imagefield>

      </div>

      <div class="flex--row">

        <md-field class="flex--50">
          <label>{{ $t('global.LastName') }}</label>
          <md-input v-model="form.last_name"></md-input>
        </md-field>

        <div class="flex--50">
          <label class="absolute">{{ $t('global.DateOfBirth') }}</label>
          <md-datepicker md-immediately v-model="form.date_of_birth"/>
        </div>

      </div>

      <div class="flex--row">
        <md-field class="flex--50">
          <label>{{ $t('global.Address1') }}</label>
          <md-input v-model="form.address_1"></md-input>
        </md-field>
        <md-field class="flex--50">
          <label>{{ $t('global.Address2') }}</label>
          <md-input v-model="form.address_2"></md-input>
        </md-field>
      </div>

      <div class="flex--row">
        <md-field class="flex--50">
          <label class="active">{{ $t('global.Zip') }}</label>
          <md-input v-model="form.zip_code"></md-input>
        </md-field>
        <md-field class="flex--50">
          <label class="active">{{ $t('global.City') }}</label>
          <md-input v-model="form.city"></md-input>
        </md-field>
      </div>

      <md-field class="flex--50">
        <label>{{ $t('global.Country') }}</label>
        <countryselect :country.sync="form.country"></countryselect>
      </md-field>


      <div class="space8"></div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('email')">
          <label>{{ $t('global.Email') }}</label>
          <md-input required v-model="form.email"></md-input>
          <span class="md-error" v-if="!$v.form.email.required">{{ $t('global.EmailMust') }}</span>
        </md-field>
        <md-field class="flex--50">
          <label>{{ $t('global.Phone') }}</label>
          <md-input v-model="form.phone"></md-input>
        </md-field>
      </div>

      <div class="space8"></div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('password')">
          <label>{{ $t('global.Password') }}</label>
          <md-input v-model="form.password" type="password" autocomplete="new-password"></md-input>
          <span class="md-helper-text">
            {{ $t('global.passDesc') }}
          </span>
          <span class="md-error" v-if="!$v.form.password.minLength">{{ $t('global.passDesc') }}</span>
        </md-field>
        <md-field class="flex--50" :class="getValidationClass('password_repeat')">
          <label>{{ $t('global.repeatPass') }}</label>
          <md-input v-model="form.password_repeat" type="password" autocomplete="new-password"></md-input>
          <span class="md-error" v-if="!$v.form.password_repeat.matchPassword">{{ $t('global.passwordIsDifferent') }}</span>
        </md-field>
      </div>

      <div class="space4"></div>

      <md-button class="md-raised md-primary" @click.prevent="submit">{{ $t('global.Save') }}</md-button>

      <div class="space8"></div>
      <div class="space8"></div>

    </div>
  </div>

</template>

<script>
  import CountrySelect from './CountrySelect.vue'
  import YogoApi from '@/gateways/YogoApi'
  import { mapGetters } from 'vuex'
  import Imagefield from './ImageField.vue'
  import LoadingAnimation from './LoadingAnimation.vue'
  import moment from 'moment-timezone'

  const { required, email, minLength } = require('vuelidate/lib/validators')

    export default {
        name: 'profileedit',
        components: {
            LoadingAnimation,
            Imagefield,
            countryselect: CountrySelect
        },
        data() {
            return {

        form: {},

        loading: true,
      }
    },
    computed: {
      ...mapGetters([
        'user',
        'stateReady',
      ]),
    },

    created() {
      if (this.stateReady) this.fetchProfile()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchProfile()
      },
    },
    methods: {
      async fetchProfile() {
        this.form = await YogoApi.get('/users/' + this.user.id)
        this.form.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth)
          .toDate() : null
        this.originalUser = _.clone(this.form)
        this.loading = false

      },
      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const saveFields = ['first_name', 'last_name', 'image', 'address_1', 'address_2', 'zip_code', 'city', 'country', 'email', 'phone']

        const userData = _.pick(this.form, saveFields)
        userData.date_of_birth = this.form.date_of_birth
          ? moment(this.form.date_of_birth).format('YYYY-MM-DD', 'Europe/Copenhagen')
          : null;

        if (this.form.password) {
          userData.password = this.form.password
        }

        if (userData.email !== this.originalUser.email) {
          const existingUserWithNewEmail = await YogoApi.get('/users' +
            '?email=' + encodeURIComponent(userData.email))
          if (existingUserWithNewEmail && existingUserWithNewEmail.length) {
            alert('Der findes allerede en anden bruger med emailen "' + userData.email + '" i systemet.')
            return
          }
        }

        const updatedUserData = await YogoApi.put('/users/' + this.user.id, userData)
        updatedUserData.date_of_birth = updatedUserData.date_of_birth ? moment(updatedUserData.date_of_birth)
          .toDate() : null
        this.form = updatedUserData

        this.$store.dispatch('updateUser', this.user.id)

                this.$store.commit('postFlashMessage', {
                    type: 'MESSAGE_TYPE_INFO',
                    text: this.$t('global.TheProfileHasBeenUpdated')
                })

              this.$v.$reset()

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
        first_name: {
          required,
        },
        email: {
          required,
          email,
        },
        password: {
          passwordStrength(value) {
            if (typeof value === 'undefined' || value === '') return true
            const length = value.length >= 6
            const upperCase = !!value.match(/[A-Z]+/)
            const lowerCase = !!value.match(/[a-z]+/)
            const numbers = !!value.match(/[0-9]+/)
            return length && upperCase && lowerCase && numbers
          },
        },
        password_repeat: {
          matchPassword(value) {
            return value === this.form.password
          },
        },

      },

    },

  }
</script>
