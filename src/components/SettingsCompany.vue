<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Company Details</h2>

      <loading-animation v-if="loading"/>

        <div v-else>
            <div class="flex--row">
                <div class="flex--50">
                <md-field>
                    <label> Name</label>
                    <md-input v-model="form.name"></md-input>
                </md-field>
                <div class="space"></div>
                
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
                    <label>{{ $t('global.Zip') }}</label>
                    <md-input v-model="form.zip_code"></md-input>
                </md-field>
                <md-field class="flex--50">
                    <label>{{ $t('global.City') }}</label>
                    <md-input v-model="form.city"></md-input>
                </md-field>
            </div>
            <div class="flex--row">
                <md-field class="flex--50">
                    <label>{{ $t('global.Country') }}</label>
                    <countryselect :country.sync="form.country"></countryselect>
                </md-field>
                <md-field class="flex--50">
                    <label >VAT ID </label>
                    <md-input v-model="form.vat_number"></md-input>
                </md-field>
            </div>
            <div class="flex--row">
                <md-field class="flex--50">
                    <label>{{ $t('global.Email') }}</label>
                    <md-input v-model="form.email"></md-input>
                </md-field>
                <md-field class="flex--50">
                  <label>{{ $t('global.Phone') }}</label>
                  <md-input v-model="form.phone"></md-input>
                </md-field>
            </div>
            <div class="flex--row">
                <md-field class="flex--50" >
                    <label>Website</label>
                    <md-input required v-model="form.website"></md-input>
                    <span class="md-error" v-if="!$v.form.website.required">The website URL is required</span>
                    <span class="md-error" v-else-if="!$v.form.website.valid">Invalid website URL</span>
                    <div id="website_feedback" v-bind:style="invalidFeedbackStyleObject">{{ website_feedback }}</div>
                </md-field>
                <md-field class="flex--50">
                    <label>SMS Sender Name</label>
                    <md-input v-model="form.sms_sender_name"></md-input>
                </md-field>
            </div>
            <div class="space8"></div>
            <div class="space8"></div>
            <div class="flex--row">
                <label>Company Logo</label><br>
                <imagefield :imageId.sync="form.logo" imageFormat="square"></imagefield> 
                <label>Company Logo in White for Admin Login</label><br> 
                <imagefield :imageId.sync="form.logo_white" imageFormat="square"></imagefield>       
            </div>  

        <div class="space"></div>

        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      </div>


    </div>

  </div>

</template>

<script>

  import { validationMixin } from 'vuelidate';
  import { required, email, minLength, sameAs } from 'vuelidate/lib/validators'
  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from "./LoadingAnimation"
  import CountrySelect from './CountrySelect.vue'
  import Imagefield from "./ImageField.vue"

  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'

  import _pick from 'lodash/pick'

  import qs from 'qs'

  export default {
    components: {
      LoadingAnimation,
      SettingsSubMenu,
      countryselect: CountrySelect,
      Imagefield
    },
    data() {
      return {
        loading: true,
        form:{
          // name : '',
          // address_1 : '',
          // address_2 : '',
          // zip_code : '',
          // city : '',
          // country : '',
          // vat_number : '',
          // email : '',
          // phone : '',
          // website : '',
          // sms_sender_name : '',
          // logo : '',
          // logo_white : ''
        },
        website_feedback: '',

        invalidFeedbackStyleObject: {
          display: 'block',
          width: '100%',
          position: 'relative',
          top: '33px',
          color: 'red',
          textAlign: 'center',
          fontSize: 'small',
        }
      }
    },
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    async created() {
      const queryParams = {
        keys : [
          'checkin_classes_are_visible_until',
          'checkin_classes_are_visible_for_minutes_after_start',
          'checkin_show_classes_that_start_within',
          'checkin_show_classes_that_start_within_number_of_minutes',
          'checkin_direct_customer_to_room_after_checkin',
        ]
      }
      
      this.form = await YogoApi.get('/clients/' + this.client.id);
      this.loading = false
    },
    methods: {
      async submit() {
        if (!this.form.website) {
          this.website_feedback = "You must enter the website URL.";
          return;
        }
        
        
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'name',
            'address_1',
            'address_2',
            'zip_code',
            'city',
            'country',
            'vat_number',
            'email',
            'phone',
            'website',
            'sms_sender_name',
            'logo',
            'logo_white'
          ],
        )
        console.log("submitData = ", submitData);
        await YogoApi.put('/clients/' + this.client.id , submitData)
        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.SettingsHasBeenUpdated'),
        })
      },
    },
    validations: {
      form: {
        website: {
          required,

          valid: function(value) {
            const matches = this.form.website.match(/^(([a-zA-Z0-9][a-zA-Z0-9-]{1,60}[a-zA-Z0-9]|([a-zA-Z0-9])+)\.)+[a-zA-Z]{2,}$/g);
            if (!matches) return false;
            return true;
          },
        },
        // first_name: {
        //   required,
        // },
        // last_name: {
        //   required,
        // },
        // email: {
        //   required,
        //   email,
        // },
        // password: {
        //   required,
        //   valid: function(value) {
        //     const containsUppercase = /[A-Z]/.test(value)
        //     const containsLowercase = /[a-z]/.test(value)
        //     const containsNumber = /[0-9]/.test(value)
        //     // const containsSpecial = /[#?!@$%^&*-]/.test(value)
        //     return containsUppercase && containsLowercase && containsNumber
        //   },
        //   minLength: minLength(6),
        // confirm_password: { 
        //   required, 
        //   sameAsPassword: sameAs("password") 
        // },
        // locale: {},
      },
    },
  };

</script>
