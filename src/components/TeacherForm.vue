<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ customerInfoTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'Teachers' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <div class="space4"></div>

      <div class="flex--row">

        <md-field class="flex--50 move--up" :class="getValidationClass('first_name')">
          <label class="active">{{ $t('global.FirstName') }}</label>
          <md-input required v-model="form.first_name"></md-input>
          <span class="md-error" v-if="!$v.form.first_name.required">{{ $t('global.FirstNameRequired') }}</span>
        </md-field>

        <imagefield :imageFormat="'profile'" :imageId.sync="form.image" class="flex--50 tablet__move--up"></imagefield>

      </div>

      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('last_name')">
          <label class="active">{{ $t('global.LastName') }}</label>
          <md-input v-model="form.last_name"></md-input>
          <!--<span class="md-error" v-if="!$v.form.last_name.required">Efternavn skal indtastes</span>-->
        </md-field>

        <div class="flex--50" :class="getValidationClass('last_name')">
          <label class="absolute">{{ $t('global.DateOfBirth') }}</label>
          <md-datepicker md-immediately v-model="form.date_of_birth"/>
          <!--<span class="md-error" v-if="!$v.form.date_of_birth.required">Fødselsdato skal indtastes</span>-->
        </div>

      </div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('email')">
          <label class="active">{{ $t('global.Email') }}</label>
          <md-input required v-model="form.email"></md-input>
          <span class="md-error" v-if="!$v.form.email.required">{{ $t('global.emailMustBeEntered') }}</span>
          <span class="md-error" v-if="!$v.form.email.email">{{ $t('global.notValidEmail') }}</span>
        </md-field>
        <md-field class="flex--50" :class="getValidationClass('phone')">
          <label class="active">{{ $t('global.Phone') }}</label>
          <md-input v-model="form.phone"></md-input>
          <!--<span class="md-error" v-if="!$v.form.phone.required">Telefonnummer skal indtastes</span>-->
        </md-field>
      </div>


      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('address_1')">
          <label>{{ $t('global.Address1') }}</label>
          <md-input v-model="form.address_1"></md-input>
          <!--<span class="md-error" v-if="!$v.form.address_1.required">Adresse skal indtastes</span>-->
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
          <!--<span class="md-error" v-if="!$v.form.zip_code.required">Postnummer skal indtastes</span>-->
        </md-field>
        <md-field class="flex--50" :class="getValidationClass('city')">
          <label class="active">{{ $t('global.City') }}</label>
          <md-input v-model="form.city"></md-input>
          <!--<span class="md-error" v-if="!$v.form.city.required">By skal indtastes</span>-->
        </md-field>
      </div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('country')">
          <label>{{ $t('global.Country') }}</label>
          <countryselect :country.sync="form.country"></countryselect>
          <!--<span class="md-error" v-if="!$v.form.country.required">Land skal vælges</span>-->
        </md-field>
      </div>


      <div class="flex--row">
        <md-field class="flex--50">
          <label class="active">{{ $t('global.MoreInfoAboutTeacher') }}</label>
          <md-textarea v-model="form.teacher_description"></md-textarea>
        </md-field>
        <div class="flex--50">
          <md-checkbox v-model="form.checkin" :disabled="form.admin">{{ $t('global.TeacherCanOpenCheckin') }} <span
              v-if="form.admin">{{ $t('global.adminTeacherCheckinDesc', {name: `${form.first_name} ${form.last_name}`}) }}</span></md-checkbox>
          <div></div>
          <md-checkbox v-model="form.teacher_can_manage_all_classes" :disabled="form.admin">{{ $t('global.TeacherCanManageAllClassesInTeacherModule') }} <span
              v-if="form.admin">{{ $t('global.adminTeacherManageAllClassesDesc', {name: `${form.first_name} ${form.last_name}`}) }}</span></md-checkbox>
        </div>
      </div>

      <div class="space4"></div>

      <div class="flex--row flex__justify--start">
        <md-button class="md-raised md-primary" @click.prevent="submit">{{ $t('global.Save') }}</md-button>
        <div v-if="$route.meta.formType === 'edit'">
          <md-button class="md-raised md-primary red" @click.prevent="deleteTeacher">{{ $t('global.Delete') }}</md-button>
        </div>
      </div>

      <div class="space8"></div>
      <div class="space8"></div>
    </div>
  </div>
</template>


<script>

  import YogoApi from '@/gateways/YogoApi'
  import router from '@/router/'
  import {mapGetters} from 'vuex'
  import Countryselect from "./CountrySelect.vue"
  import Imagefield from "./ImageField.vue"
  import _ from 'lodash'
  import moment from 'moment'
  import LoadingAnimation from "./LoadingAnimation.vue"

  const {required, email} = require('vuelidate/lib/validators')

  export default {
    components: {
      LoadingAnimation,
      Imagefield,
      Countryselect,
    },
    name: 'teacherform',
    data() {
      return {
        customerInfoTitle: this.$route.meta.formType === 'add' ? this.$t('global.CreateNewTeacher') : this.$t('global.EditTeacher'),

        saveLabel: this.$route.meta.formType === 'add' ? this.$t('global.CreateNewTeacher') : this.$t('global.UpdateTeacher'),
        deleteTeacherLabel: 'Slet',
        changeLabel: 'Skift',


        form: {
          country: 'DK',
          date_of_birth: null,
          checkin: true,
          teacher_can_manage_all_classes: false,
        },

        originalUser: null,

        loading: this.$route.meta.formType === 'edit',
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
      ]),
    },
    created() {
      if (this.$route.meta.formType === 'edit' && this.stateReady) this.fetchTeacher()
    },
    watch: {
      stateReady(newReadyState) {
        if (this.$route.meta.formType === 'edit' && newReadyState) this.fetchTeacher()
      },
    },

    methods: {

      async fetchTeacher() {
        const user = await YogoApi.get('/users/' + this.$route.params.id)

        user.date_of_birth = user.date_of_birth ? moment(user.date_of_birth).toDate() : null

        this.form = user
        this.originalUser = _.clone(user)

        if (this.form.admin) {
          this.form.checkin = true;
          this.form.teacher_can_manage_all_classes = true;
        }

        this.loading = false
      },

      async submit() {

        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        const saveFields = ['first_name', 'last_name', 'image', 'address_1', 'address_2', 'zip_code', 'city', 'country', 'email', 'phone', 'teacher_description']

        const teacherData = _.pick(this.form, saveFields)

        // Admins can always open checkin
        if (!this.form.admin) {
          teacherData.checkin = this.form.checkin;
          teacherData.teacher_can_manage_all_classes = this.form.teacher_can_manage_all_classes;
        }

        teacherData.date_of_birth = this.form.date_of_birth ?
          moment(this.form.date_of_birth, 'DD-MM-YYYY').format('YYYY-MM-DD') :
          null

        if (this.$route.meta.formType === 'edit') {
          await this.updateTeacher(teacherData)
        }

        if (this.$route.meta.formType === 'add') {
          await this.addTeacher(teacherData)
        }

      },

      async updateTeacher(teacherData) {
        if (teacherData.email !== this.originalUser.email) {
          const existingUserWithNewEmail = await YogoApi.get('/users' +
            '?email=' + encodeURIComponent(teacherData.email))
          if (existingUserWithNewEmail && existingUserWithNewEmail.length) {
            alert(this.$t('global.AllreadyAnotherUserWithEmail') + teacherData.email + this.$t('global.InTheSystem'))
            return
          }

        }

        await YogoApi.put('/users/' + this.$route.params.id, teacherData)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: teacherData.first_name + (teacherData.last_name ? ' ' + teacherData.last_name : '') + this.$t('global.hasBeenUpdated'),
        })
        this.$router.push({name: 'Teachers'})
      },


      async addTeacher(teacherData) {

        teacherData.teacher = true
        teacherData.customer = true

        const existingUsersWithNewEmail = await YogoApi.get('/users' +
          '?email=' + encodeURIComponent(teacherData.email))

        if (existingUsersWithNewEmail && existingUsersWithNewEmail.length) {
          if (!confirm(this.$t('global.AllreadyAnotherUserWithEmail') + teacherData.email + this.$t('global.DoYouWantToUpdateAndAtTheSameTimeCreate'))) return

          await YogoApi.put('/users/' + existingUsersWithNewEmail[0].id, teacherData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: teacherData.first_name + (teacherData.last_name ? ' ' + teacherData.last_name : '') + this.$t('global.isCreatedAsTeacher'),
          })
          this.$router.push({name: 'Teachers'})
          return

        }


        await YogoApi.post('/users', teacherData)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: teacherData.first_name + (teacherData.last_name ? ' ' + teacherData.last_name : '') + this.$t('global.isCreatedAsTeacher'),
        })
        this.$router.push({name: 'Teachers'})

      },

      async deleteTeacher() {
        let confirmMessage = this.$t('global.AreYouSureYouWantToRemove') + this.form.first_name + ' ' + this.form.last_name + '?'
        if (this.originalUser.admin) {
          confirmMessage += this.$t('global.ThisTeacherAlsoHasAccessToAdmin')
        }

        if (this.originalUser.customer) {
          confirmMessage += this.$t('global.ThisTeacherAlsoIsCustomer')
        }

        if (!confirm(confirmMessage)) return

        if (this.originalUser.admin || this.originalUser.customer) {
          await YogoApi.put('/users/' + this.originalUser.id, {
            teacher: false,
          })
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.originalUser.first_name + (this.originalUser.last_name ? ' ' + this.originalUser.last_name : '') + this.$t('global.isNoLongerTeacher'),
          })

        } else {
          await YogoApi.delete('/users/' + this.originalUser.id)
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.originalUser.first_name + (this.originalUser.last_name ? ' ' + this.originalUser.last_name : '') + this.$t('global.isDeleted'),
          })
        }
        this.$router.push({name: 'Teachers'})

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
        /*last_name: {
            required
        },
        date_of_birth: {
            required
        },
        address_1: {
            required
        },
        zip_code: {
            required
        },
        city: {
            required
        },
        country: {
            required
        },*/
        email: {
          required,
          email,
        },
        /*phone: {
            required
        },*/
      },

    },
  }

</script>
