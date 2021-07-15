<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="space4"></div>

      <md-button class="md-raised">
        <router-link :to="{ name: 'Users' }">{{ $t('global.Back') }}</router-link>
      </md-button>

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

        <md-field class="flex--50" :class="getValidationClass('last_name')">
          <label>{{ $t('global.LastName') }}</label>
          <md-input v-model="form.last_name"></md-input>
        </md-field>

        <div class="flex--50" :class="getValidationClass('date_of_birth')">
          <label class="absolute">{{ $t('global.DateOfBirth') }}</label>
          <md-datepicker md-immediately v-model="form.date_of_birth"/>
        </div>

      </div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('address_1')">
          <label>{{ $t('global.Address1') }}</label>
          <md-input v-model="form.address_1"></md-input>
        </md-field>
        <md-field class="flex--50">
          <label>{{ $t('global.Address2') }}</label>
          <md-input v-model="form.address_2"></md-input>
        </md-field>
      </div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('zip_code')">
          <label class="active">{{ $t('global.Zip') }}</label>
          <md-input v-model="form.zip_code"></md-input>
        </md-field>
        <md-field class="flex--50" :class="getValidationClass('city')">
          <label class="active">{{ $t('global.City') }}</label>
          <md-input v-model="form.city"></md-input>
        </md-field>
      </div>

      <md-field class="flex--50" :class="getValidationClass('country')">
        <label>{{ $t('global.Country') }}</label>
        <countryselect :country.sync="form.country"></countryselect>
      </md-field>


      <div class="space8"></div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('email')">
          <label>{{ $t('global.Email') }}</label>
          <md-input required v-model="form.email"></md-input>
          <span class="md-error" v-if="!$v.form.email.required">{{ $t('global.EmailMust') }}</span>
          <span class="md-error" v-if="!$v.form.email.email">{{ $t('global.EmailNotValid') }}</span>
        </md-field>
        <md-field class="flex--50" :class="getValidationClass('phone')">
          <label>{{ $t('global.Phone') }}</label>
          <md-input v-model="form.phone"></md-input>
        </md-field>
      </div>

      <div class="space8"></div>

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
  import router from '@/router/'
  import {mapGetters} from 'vuex'
  import Imagefield from "./ImageField.vue"
  import LoadingAnimation from "./LoadingAnimation.vue"
  import moment from 'moment'

  const {required, email, minLength} = require('vuelidate/lib/validators')

  export default {

    name: 'userform',
    components: {
      countryselect: CountrySelect,
      imagefield: Imagefield,
      'loading-animation': LoadingAnimation,
    },
    //props: ['userId'],
    data() {
      return {
        pageTitle: this.$route.meta.formType === 'edit' ? this.$t('global.EditAdmin') : this.$t('global.CreateAdmin'),
        loading: this.$route.meta.formType === 'edit',

        originalUser: {},

        form: {
          country: 'DK',
        },
      }
    },
    computed: {
      ...mapGetters([
        'user',
        'stateReady',
      ]),
    },

    created() {
      if (this.$route.meta.formType === 'edit' && this.stateReady) this.fetchUser()
    },
    watch: {
      stateReady(newReadyState) {
        if (this.$route.meta.formType === 'edit' && newReadyState) this.fetchUser()
      },
    },
    methods: {
      async fetchUser() {
        try {
          this.form = await YogoApi.get('/users/' + this.$route.params.id)
          this.form.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth).toDate() : null
          this.originalUser = _.clone(this.form)
          this.loading = false

        } catch (err) {
          console.log(err)
        }
      },
      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const saveFields = ['first_name', 'last_name', 'image', 'address_1', 'address_2', 'zip_code', 'city', 'country', 'email', 'phone']

        const userData = _.pick(this.form, saveFields)
        userData.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth).format('YYYY-MM-DD') : null

        if (userData.email !== this.originalUser.email) {
          const existingUserWithNewEmail = await YogoApi.get('/users' +
            '?email=' + encodeURIComponent(userData.email))
          if (existingUserWithNewEmail && existingUserWithNewEmail.length) {
            alert(this.$t('global.AllreadyAnotherUserWithEmail') + userData.email + this.$t('global.InTheSystem'))
            return
          }
        }

        if (this.$route.meta.formType === 'edit') {
          await YogoApi.put('/users/' + this.$route.params.id, userData)
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: userData.first_name + ' ' + userData.last_name + this.$t('global.hasBeenUpdated'),
          })
        }

        if (this.$route.meta.formType === 'add') {
          userData.admin = true
          await YogoApi.post('/users', userData)
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: userData.first_name + ' ' + userData.last_name + this.$t('global.isCreated'),
          })
        }

        this.$router.push({name: 'Users'})

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
      },

    },

  }

</script>
