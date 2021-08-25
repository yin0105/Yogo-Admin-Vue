<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.NewCustomers') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--50">
          <div>
            <md-checkbox v-model="form.signup_show_phone_field">{{ $t('global.ShowPhoneField') }}</md-checkbox>
          </div>
          <div v-if="form.signup_show_phone_field">
            <md-checkbox v-model="form.signup_phone_field_required">{{ $t('global.PhoneFieldRequired') }}</md-checkbox>
          </div>

          <div>
            <md-checkbox v-model="form.signup_show_date_of_birth_field">{{ $t('global.ShowDateOfBirthField') }}</md-checkbox>
          </div>
          <div v-if="form.signup_show_date_of_birth_field">
            <md-checkbox v-model="form.signup_date_of_birth_field_required">{{ $t('global.DateOfBirthFieldRequired') }}</md-checkbox>
          </div>

          <div>
            <md-checkbox v-model="form.signup_show_address_fields">{{ $t('global.ShowAddressField') }}</md-checkbox>
          </div>
          <div v-if="form.signup_show_address_fields">
            <md-checkbox v-model="form.signup_address_fields_required">{{ $t('global.AddressFieldRequired') }}</md-checkbox>
          </div>
        </div>

        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      </div>
    </div>    
  </div> 

</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from "./LoadingAnimation"

  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'

  import _pick from 'lodash/pick'

  export default {
    name: 'SettingsSignup',
    components: {
      LoadingAnimation,
      SettingsSubMenu,
    },
    data() {
      return {
        loading: true,

        form: {
          signup_show_phone_field: false,
          signup_phone_field_required: false,
          signup_show_date_of_birth_field: false,
          signup_date_of_birth_field_required: false,
          signup_show_address_fields: false,
          signup_address_fields_required: false,
        },      

      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    async created() {
      this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=signup_show_phone_field' +
        '&keys[]=signup_phone_field_required' +
        '&keys[]=signup_show_date_of_birth_field' +
        '&keys[]=signup_date_of_birth_field_required' +
        '&keys[]=signup_show_address_fields' +
        '&keys[]=signup_address_fields_required',
      )
      this.loading = false
    },
    watch: {
      form: {
        handler: (val) => {
          if (!val.signup_show_phone_field) {
            val.signup_phone_field_required = false
          }
          if (!val.signup_show_date_of_birth_field) {
            val.signup_date_of_birth_field_required = false
          }
          if (!val.signup_show_address_fields) {
            val.signup_address_fields_required = false
          }
        },
        deep: true,
      },
    },
    methods: {
      async submit() {
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'signup_show_phone_field',
            'signup_phone_field_required',
            'signup_show_date_of_birth_field',
            'signup_date_of_birth_field_required',
            'signup_show_address_fields',
            'signup_address_fields_required',
          ],
        )
        await YogoApi.put(
          '/clients/' + this.client.id + '/settings',
          submitData,
        )
        this.loading = false        

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.SettingsHasBeenUpdated'),
        })

      },
    },
  }

</script>
