<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'CustomerInfo', params: {id: $route.params.id } }" v-if="formType === 'edit'">
          {{ $t('global.Back') }}
        </router-link>
        <router-link :to="{ name: 'Customers' }" v-else>{{ $t('global.Back') }}</router-link>
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
          <md-input required v-model="form.last_name"></md-input>
          <span class="md-error" v-if="!$v.form.last_name.required">{{ $t('global.LastNameRequired') }}</span>
        </md-field>

        <div class="flex--50" :class="getValidationClass('date_of_birth')">
          <label class="absolute">{{ $t('global.DateOfBirth') }}</label>
          <md-datepicker md-immediately v-model="form.date_of_birth"/>
        </div>

      </div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('address_1')">
          <label>{{ $t('global.Address') }}</label>
          <md-input v-model="form.address_1"></md-input>
        </md-field>
        <md-field class="flex--50">
          <label>{{ $t('global.AddressLine2') }}</label>
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

      <div v-if="client.settings.customer_profile_use_additional_info_field">
        <p class="bold">{{ $t('global.AdditionalInformation') }}</p>
        <label>{{ client.settings.customer_profile_additional_info_field_subtitle }}</label>
        <md-field>
          <md-textarea v-model="form.customer_additional_info"></md-textarea>
        </md-field>
      </div>

      <div class="space8"></div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('email')">
          <label>{{ $t('global.Email') }}</label>
          <md-input required v-model="form.email"></md-input>
          <span class="md-error" v-if="!$v.form.email.required">{{ $t('global.EmailRequired') }}</span>
        </md-field>
        <md-field class="flex--50" :class="getValidationClass('phone')">
          <label>{{ $t('global.Phone') }}</label>
          <md-input v-model="form.phone"></md-input>
        </md-field>
      </div>

      <div class="space4"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveButtonText }}</md-button>
      <md-button class="md-raised md-primary red" v-if="formType === 'edit'" @click="deleteCustomer">{{ $t('global.Delete') }}
      </md-button>
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
    components: {
      Imagefield,
      LoadingAnimation,
      countryselect: CountrySelect,
    },
    props: ['formType'],
    data() {
      return {
        pageTitle: this.formType === 'edit' ? this.$t('global.EditCustomer') : this.$t('global.NewCustomer'),

        saveButtonText: this.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreateCustomer'),

        loading: this.formType === 'edit',

        originalCustomer: {},

        form: {
          country: 'DK',
        },
      }
    },
    computed: {
      ...mapGetters([
        'user',
        'stateReady',
        'client',
      ]),
    },

    created() {
      if (this.formType === 'edit' && this.stateReady) this.fetchCustomer()
    },
    watch: {
      stateReady(newReadyState) {
        if (this.formType === 'edit' && newReadyState) this.fetchCustomer()
      },
    },
    methods: {
      async fetchCustomer() {
        this.form = await YogoApi.get('/users/' + this.$route.params.id)

        if (this.form.archived) {
          alert(this.$t('global.ThisCustomerHasBeenDeleted'));
          this.$router.push({name: 'Customers'})
        }

        this.form.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth).toDate() : null
        this.originalCustomer = _.clone(this.form)
        this.loading = false
      },


      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const saveFields = [
          'first_name',
          'last_name',
          'image',
          'address_1',
          'address_2',
          'zip_code',
          'city',
          'country',
          'email',
          'phone',
        ]

        if (this.client.settings.customer_profile_use_additional_info_field) {
          saveFields.push('customer_additional_info')
        }

        const customerData = _.pick(this.form, saveFields)
        customerData.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth).format('YYYY-MM-DD') : null

        if (this.formType === 'edit') {
          await this.updateCustomer(customerData)
        }

        if (this.formType === 'add') {
          await this.addCustomer(customerData)
        }

      },

      async updateCustomer(customerData) {

        if (customerData.email !== this.originalCustomer.email) {
          const existingUserWithNewEmail = await YogoApi.get('/users' +
            '?email=' + encodeURIComponent(customerData.email))
          if (existingUserWithNewEmail && existingUserWithNewEmail.length) {
            alert(this.$t('global.AllreadyAnotherUserWithEmail') + customerData.email + this.$t('global.InTheSystem'))
            return
          }

        }

        await YogoApi.put('/users/' + this.$route.params.id, customerData)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: customerData.first_name + ' ' + customerData.last_name + this.$t('global.hasBeenUpdated'),
        })
        this.$router.push({name: 'CustomerInfo', params: {id: this.$route.params.id }})
      },


      async addCustomer(customerData) {

        customerData.customer = true

        const existingUsersWithNewEmail = await YogoApi.get('/users' +
          '?email=' + encodeURIComponent(customerData.email))

        if (existingUsersWithNewEmail && existingUsersWithNewEmail.length) {

          if (existingUsersWithNewEmail[0].customer) {
            if (!confirm(this.$t('global.AllreadyAnotherUserWithEmail') + customerData.email + '.' + this.$t('global.CustomersNameIs') + existingUsersWithNewEmail[0].first_name + ' ' + existingUsersWithNewEmail[0].last_name + this.$t('global.WillYouGetAndEditCustomer'))) {
              return
            }
            this.$router.push({name: 'CustomerEdit', params: {id: existingUsersWithNewEmail[0].id}})
            return

          } else if (!confirm(this.$t('global.AllreadyAnotherUserWithEmail') + customerData.email + '.' + this.$t('global.UsersNameIs') + existingUsersWithNewEmail[0].first_name + ' ' + existingUsersWithNewEmail[0].last_name + this.$t('global.WillYouCreateTheUserAsCustomer'))) {
            return
          }

          await YogoApi.put('/users/' + existingUsersWithNewEmail[0].id, {customer: 1})

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: existingUsersWithNewEmail[0].first_name + ' ' + existingUsersWithNewEmail[0].last_name + this.$t('global.isCreatedAsCustomer'),
          })
          this.$router.push({name: 'CustomerEdit', params: {id: existingUsersWithNewEmail[0].id}})
          return

        }


        const insertedUser = await YogoApi.post('/users', customerData)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: customerData.first_name + ' ' + customerData.last_name + this.$t('global.isCreatedAsCustomer'),
        })
        this.$router.push({name: 'CustomerInfo', params: {id: insertedUser.id}})

      },

      async deleteCustomer() {
        let confirmMessage = this.$t('global.AreYouSureYouWantToRemove') + this.form.first_name + ' ' + this.form.last_name + '?'
        if (this.originalCustomer.admin) {
          confirmMessage += this.$t('global.CustomerAlsoHasAccessToAdmin')
        }

        if (this.originalCustomer.teacher) {
          confirmMessage += this.$t('global.CustomerAlsoTeacher')
        }

        if (!confirm(confirmMessage)) return


        if (this.originalCustomer.admin || this.originalCustomer.teacher) {
          await YogoApi.put('/users/' + this.originalCustomer.id, {
            customer: false,
          })
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.originalCustomer.first_name + ' ' + this.originalCustomer.last_name + this.$t('global.isNoLongerCustomer'),
          })

        } else {
          await YogoApi.delete('/users/' + this.originalCustomer.id)
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.originalCustomer.first_name + ' ' + this.originalCustomer.last_name + this.$t('global.isDeleted'),
          })
        }
        this.$router.push({name: 'Customers'})

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
        last_name: {
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


<style lang="scss">

</style>
