<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Company Details</h2>

      <loading-animation v-if="loading"/>

        <div v-else>
          <form novalidate @submit.prevent="submit">
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
                <div class="flex--50">
                  <md-field :class="getValidationClass('email')">
                    <label>{{ $t('global.Email') }}</label>
                    <md-input v-model="form.email"></md-input>
                    <span class="md-error" v-if="!$v.form.email.email">{{ $t('global.notValidEmail') }}</span>
                  </md-field>
                </div>
                <md-field class="flex--50">
                  <label>{{ $t('global.Phone') }}</label>
                  <md-input v-model="form.phone"></md-input>
                </md-field>
            </div>
            <div class="flex--row">
              <div class="flex--50">
                <md-field :class="getValidationClass('website')">
                    <label>Website</label>
                    <md-input required v-model="form.website"></md-input>
                    <span class="md-error" v-if="!$v.form.website.required">The website URL is required</span>
                    <span class="md-error" v-else-if="!$v.form.website.valid">Invalid website URL</span>
                </md-field>
              </div>
              <div class="flex--50">
                <md-field :class="getValidationClass('sms_sender_name')">
                    <label>SMS Sender Name</label>
                    <md-input required v-model="form.sms_sender_name"></md-input>
                    <!-- <span class="md-error" v-if="!$v.form.sms_sender_name.required">The website URL is required</span> -->
                    <span class="md-error" v-if="!$v.form.sms_sender_name.maxLength">Max 11 characters including spaces</span>
                </md-field>
              </div>
              <!-- <md-field class="flex--50">
                  <label>SMS Sender Name</label>
                  <md-input v-model="form.sms_sender_name"></md-input>
              </md-field> -->
            </div>
            <div class="space8"></div>
            <div class="space8"></div>
            <div class="flex--row">
                <label>Company Logo</label><br>
                <imagefield :imageId.sync="form.logo" imageFormat="square"></imagefield> 
                <label>Company Logo in White for Admin Login</label><br> 
                <imagefield :imageId.sync="form.logo_white" imageFormat="square"></imagefield>       
            </div>  
          </form>

        <div class="space"></div>

        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      </div>


    </div>

  </div>

  

</template>

<script>

  import { validationMixin } from 'vuelidate';
  import { required, email, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from "./LoadingAnimation"
  import CountrySelect from './CountrySelect.vue'
  import Imagefield from "./ImageField.vue"

  import YogoApi from '@/gateways/YogoApi'
  import {mapGetters} from 'vuex'

  import _pick from 'lodash/pick'

  import qs from 'qs'

  export default {
    mixins: [validationMixin,],    
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
          name : '',
          address_1 : '',
          address_2 : '',
          zip_code : '',
          city : '',
          country : '',
          vat_number : '',
          email : '',
          phone : '',
          website : '',
          sms_sender_name : '',
          logo : '',
          logo_white : '',


          // firstName: null,
          // lastName: null,
          // gender: null,
          // age: null,
          // email: null,
        },
        // userSaved: false,
        // sending: false,
        // lastUser: null,

        
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
      getValidationClass(fieldName) {
        const field = this.$v.form[fieldName];

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          };
        }
        return {};
      },

      // validateUser () {
      //   this.$v.$touch()

      //   if (!this.$v.$invalid) {
      //     this.saveUser()
      //   }
      // },

      async submit() {
        console.log("1");
        this.$v.$touch();
        console.log("2: ", this.form.website.required);
        if (this.$v.$invalid) return;
        console.log("3");
        
        
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
            console.log("valid");
            const matches = this.form.website.match('^(https?:\\/\\/)?'+ // protocol
              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
              '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
              '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
              '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
            if (!matches) return false;
            return true;
          },
        },
        email: {
          required,
          email
        },
        sms_sender_name: {
          maxLength: maxLength(11),
        }
      },
    },
  };

</script>
