<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div class="space4"></div>
      <md-button class="md-raised">
        <router-link :to="{ name: 'Events' }">{{ $t('global.Back') }}</router-link>
      </md-button>
      <div class="space4"></div>

      <div class="flex--row align__items--center">

        <md-field class="flex--50" :class="getValidationClass('name')">
          <label>{{ $t('global.Title') }}</label>
          <md-input v-model="form.name" required></md-input>
          <span class="md-error" v-if="!$v.form.name.required">{{ $t('global.EventNameMust') }}</span>
        </md-field>

        <div class="space8"></div>
        <div class="space4"></div>

        <imagefield class="flex--50" imageFormat="landscape" :imageId.sync="form.image"></imagefield>

        <div class="space8"></div>
        <div class="space4"></div>

      </div>

      <div class="flex--row align__items--center">

        <md-field class="flex--50">
          <label>{{ $t('global.Teachers') }}</label><br/>
          <md-select multiple v-model="form.teachers">
            <md-option v-for="teacher in teachers" :value="teacher.id" :key="teacher.id">
              {{ teacher.first_name + ' ' + teacher.last_name }}</md-option>
          </md-select>
        </md-field>

        <md-field class="flex--50">
          <label>{{ $t('global.Room') }}</label>
          <md-select v-model="form.room">
            <md-option value="0">-- {{ $t('global.NotChosen') }} --</md-option>
            <md-option v-for="room in rooms" :value="room.id" :key="'room_' + room.id">
              {{ room.name }}
              <span v-if="client.branches && client.branches.length > 1 && room.branch">({{ room.branch.name }})</span>
            </md-option>
          </md-select>
        </md-field>

      </div>

      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('seats')">
          <label>{{ $t('global.MaxParticipants') }}</label>
          <md-input v-model="form.seats" required type="number"></md-input>
          <span class="md-error" v-if="!$v.form.seats.required">{{ $t('global.MaxParticipantsMust') }}</span>
        </md-field>

        <md-field class="flex--50" :class="getValidationClass('price')">
          <label>{{ $t('global.Price') }}</label>
          <md-input v-model="form.price" required type="number"></md-input>
          <span class="md-error" v-if="!$v.form.price.required">{{ $t('global.EventPriceMust') }}</span>
        </md-field>

      </div>

      <div class="flex--row">

        <md-field class="flex--50">
          <label>{{ $t('global.EventGroup') }}</label>
          <md-select v-model="form.event_group">
            <md-option value="0">-- {{ $t('global.NotChosen') }} --</md-option>
            <md-option v-for="eventGroup in eventGroups" :value="eventGroup.id" :key="eventGroup.id">
              {{ eventGroup.name }}
            </md-option>
          </md-select>
          <span class="md-helper-text">{{ $t('global.EventMustBeInEventGroupToBeShown') }}</span>
        </md-field>

      </div>

      <md-field class="flex--50">
        <label class="active">{{ $t('global.EventInformation') }}</label>
        <md-textarea v-model="form.description"></md-textarea>
      </md-field>


      <md-radio v-model="form.use_time_slots" :value="false">{{ $t('global.TimeIndicationInFreeText') }}</md-radio>
      <md-radio v-model="form.use_time_slots" :value="true" @change="onChangeUseTimeSlots">{{ $t('global.SpecifiedTimeLabel') }}
      </md-radio>


      <div class="flex--50" v-if="!form.use_time_slots">
        <label>{{ $t('global.StartDate') }} *</label>
        <md-datepicker md-immediately v-model="form.start_date" class="not-clearable" />
        <span class="md-error" v-if="!$v.form.start_date.required">{{ $t('global.EventDateMust') }}</span>
      </div>

      <md-field class="flex--50" v-if="!form.use_time_slots">
        <label>{{ $t('global.CustomTimeTextLabel') }}</label>
        <md-textarea v-model="form.time_freetext"></md-textarea>
      </md-field>

      <div v-if="form.use_time_slots">

        <div class="flex--row">
          <div class="flex--50">
            <md-checkbox v-model="form.show_in_calendar">{{ $t('global.ShowTimesInWeeklySchedule') }}</md-checkbox>
          </div>
        </div>

        <div class="flex--50">
          <md-button class="md-fab turkis md-mini md-primary" @click="addTimeSlot">
            <md-icon>add</md-icon>
            <md-tooltip md-direction="right">{{ $t('global.CreateMoreTimeslots') }}</md-tooltip>
          </md-button>
        </div>

        <div class="flex--row">

          <div class="flex--100">
            <div v-for="(timeSlot, idx) in timeSlots">

              <div class="flex--row">

                <div class="flex--25" :class="getTimeSlotValidationClass(idx, 'date')">

                  <md-datepicker md-immediately v-model="timeSlot.date" class="not-clearable" ><label>{{ $t('global.Date') }}</label></md-datepicker>
                  <span class="md-error" v-if="!$v.timeSlots.$each[idx].date.required">{{ $t('global.DateMust') }}</span>
                </div>

                <div class="space8"></div>

                <div class="flex--25">
                  <md-field :class="getTimeSlotValidationClass(idx, 'start_time')">
                    <label>{{ $t('global.StartTime') }}</label>
                    <md-input v-model="timeSlot.start_time"
                              @blur="timeSlot.start_time = AutoFormatTime(timeSlot.start_time)"></md-input>
                    <span class="md-error"
                          v-if="!$v.timeSlots.$each[idx].start_time.required">{{ $t('global.StartTimeMust') }}</span>
                  </md-field>
                </div>

                <div class="flex--25">
                  <md-field :class="getTimeSlotValidationClass(idx, 'end_time')">
                    <label>{{ $t('global.EndTime') }}</label>
                    <md-input v-model="timeSlot.end_time"
                              @blur="timeSlot.end_time = AutoFormatTime(timeSlot.end_time)"></md-input>
                    <span class="md-error"
                          v-if="!$v.timeSlots.$each[idx].end_time.required">{{ $t('global.EndTimeMust') }}</span>
                  </md-field>
                </div>

                <div class="flex--25">
                  <md-button
                    class="md-icon-button md-mini delete-payment-option-button"
                    @click="removeTimeSlot(idx)"
                  >
                    <md-icon>delete</md-icon>
                  </md-button>
                  <div class="space8"></div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      <div class="space4"></div>

      <md-checkbox v-model="form.send_email_to_customer">{{ $t('global.SendEmailToCustomerEvent') }}</md-checkbox>

      <md-field :class="getValidationClass('email_subject')" v-if="form.send_email_to_customer">
        <label>{{ $t('global.EmailSubject') }}</label>
        <md-input v-model="form.email_subject" type="text" required></md-input>
        <span class="md-error" v-if="!$v.form.email_subject.required">{{ $t('global.SubjectMust') }}</span>
      </md-field>

      <md-field :class="getValidationClass('email_body')" v-if="form.send_email_to_customer">
        <label>{{ $t('global.EmailText') }}</label>
        <md-textarea v-model="form.email_body" required></md-textarea>
        <span class="md-error" v-if="!$v.form.email_subject.required">{{ $t('global.EmailTextMust') }}</span>
      </md-field>
      <div v-if="form.send_email_to_customer">
        {{ $t('global.FollowingCodes') }}: [customer_first_name], [customer_last_name], [studio_name]
      </div>

      <div class="space8"></div>

      <md-button class="md-raised md-primary" @click="submit">{{ saveLabel }}</md-button>
      <md-button class="md-raised md-primary red" v-if="formType === 'edit' && !form.signups.length" @click="deleteEvent">
        {{ $t('global.Delete') }}
      </md-button>

      <div v-if="formType === 'edit'">
        <div class="space8"></div>
        <h3>{{ $t('global.Attendees') }} ({{ form.signups.length }}/{{ form.seats }})</h3>


        <md-button class="md-button md-raised md-theme-default" type="button" v-if="selectedSignups.length"
                   @click.prevent="showExportSignupEmailsDialog = true">{{ $t('global.ExportEmails') }}
        </md-button>

        <md-button class="md-button md-raised md-theme-default" type="button" v-if="selectedSignups.length"
                   @click.prevent="showExportSignupPhoneNumbersDialog = true">{{ $t('global.ExportPhoneNumbers') }}
        </md-button>

        <md-table
          v-if="form.signups.length"
          v-model="form.signups"
          md-sort="name" md-sort-order="asc"
          md-card
          class="participant-list"
          @md-selected="onSignupSelect"
        >
          <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="multiple" md-auto-select>
            <md-table-cell md-label="">
              <img
                class="circle profile-image"
                :src="profileImageSrc(item.user.image)"
              />
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Name')" md-sort-by="user.first_name">
              <a @click="$router.push({name:'CustomerInfo', params: { id: item.user.id }})">
                {{ item.user.first_name + ' ' + item.user.last_name }}
              </a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Email')" md-sort-by="user.email">
              <a :href="'mailto:'+item.user.email" @click.stop="">{{ item.user.email }}</a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Phone')">
              <a :href="'tel:'+item.user.phone" @click.stop="">{{ item.user.phone }}</a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.SignupCreated')">
              {{ item.createdAt | moment('D. MMM YYYY HH:mm:ss') }}
            </md-table-cell>
            <md-table-cell :md-label="$t('global.CustomerInfo')">
              <md-button @click="$router.push({name:'CustomerInfo', params: { id: item.user.id }})">
                {{ $t('global.SeeCustomer') }}
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>

      </div>

    </div>
    <div class="space8"></div>

    <md-dialog :md-active.sync="showExportSignupEmailsDialog">
      <md-dialog-title>{{ $t('global.ExportEmails') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.Emails') }}</label>
          <md-textarea v-model="exportSignupEmailsResult" id="export-signup-emails-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportEmailsDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showExportSignupEmailsDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showExportSignupPhoneNumbersDialog">
      <md-dialog-title>{{ $t('global.ExportPhoneNumbers') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.PhoneNumbers') }}</label>
          <md-textarea v-model="exportSignupPhoneNumbersResult" id="export-signup-phone-numbers-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportPhoneDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showExportSignupPhoneNumbersDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>
  import ParticipantList from './ParticipantList'
  import Imagefield from "./ImageField.vue"
  import moment from 'moment-timezone'
  import YogoApi from '@/gateways/YogoApi'
  import LoadingAnimation from "./LoadingAnimation.vue"
  import TooltipInfo from './TooltipInfo';
  import {mapGetters} from 'vuex'

  import AutoFormatTime from '../auto-formatters/time'

  import avatar from '@/graphics/avatar'
  import Imgix from '@/services/Imgix'

  const {required, minLength} = require('vuelidate/lib/validators')

  export default {
    name: 'eventform',
    components: {
      LoadingAnimation,
      Imagefield,
      participantlist: ParticipantList,
      TooltipInfo
    },
    mixins: [Imgix],
    props: ['formType'],
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
      ]),
      exportSignupEmailsResult() {
        const emails = _.map(this.selectedSignups, signup => signup.user.email)
        return emails.join(';')
      },
      exportSignupPhoneNumbersResult() {
        const phoneNumbers = _.compact(_.map(this.selectedSignups, signup => signup.user.phone))
        return phoneNumbers.join(',')
      },
    },
    data() {
      return {
        pageTitle: this.formType === 'edit' ? this.$t('global.EditEvent') : this.$t('global.CreateEvent'),
        saveLabel: this.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreateEvent'),
        deleteEventLabel: 'Slet event',
        currentSort: 'name',
        currentSortOrder: 'asc',

        form: {
          start_date: moment().format('DD-MM-YYYY'),
          event_group: 0,
          room: 0,
          use_time_slots: false,
          time_slots: [],
          show_in_calendar: true,
          signups: [],
          teachers: [],
          send_email_to_customer: false,
        },

        timeSlots: [],

        eventGroups: [],
        teachers: [],
        rooms: [],

        selectedTeachers: [],

        loading: true,

        showExportSignupEmailsDialog: false,
        showExportSignupPhoneNumbersDialog: false,
        selectedSignups: [],

        initialized: false,
      }
    },
    async created() {
      if (this.stateReady && !this.initialized) {
        this.init()
      }
    },

    watch: {
      stateReady(newReadyState) {
        if (!this.initialized) {
          this.init()
        }
      },
    },

    methods: {

      async init() {
        this.initialized = true
        await this.loadSubFields()
        if (this.formType === 'edit') {
          this.fetchEvent()
        } else {
          this.loading = false
        }
      },

      customSort (value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort

        if (this.currentSortOrder === 'asc') {
          return a[sortBy].localeCompare(b[sortBy])
        }

        return b[sortBy].localeCompare(a[sortBy])
      })
    },

      async loadSubFields() {
        [this.eventGroups, this.teachers, this.rooms] = await Promise.all([
          YogoApi.get('/event-groups?populate=image'),
          YogoApi.get('/users?teacher=1&populate=image'),
          YogoApi.get('/rooms?populate[]=branch'),
        ])

        this.teachers = _.sortBy(this.teachers, ['first_name', 'last_name'])
        this.rooms = _.sortBy(this.rooms, 'name');
      },

      async fetchEvent() {
        this.form = await YogoApi.get(
          '/events/' + this.$route.params.id +
          '?populate[]=time_slots' +
          '&populate[]=signups' +
          '&populate[]=signups.user' +
          '&populate[]=signups.user.image' +
          '&populate[]=teachers',
        )
        if (!this.form.room) this.form.room = 0
        if (!this.form.event_group) this.form.event_group = 0

        this.form.start_date = moment(this.form.start_date).format('DD-MM-YYYY')

        _.each(this.form.time_slots, timeSlot => {
          timeSlot.date = moment(timeSlot.date).format('DD-MM-YYYY')
        })

        this.form.teachers = _.map(this.form.teachers, 'id')

        this.timeSlots = this.form.time_slots

        this.$nextTick(
          () => {
            this.loading = false
          },
        )
      },

      AutoFormatTime: AutoFormatTime,

      onChangeUseTimeSlots() {
        if (this.form.use_time_slots && !this.timeSlots.length) {
          this.timeSlots = [
            {
              date: new Date(),
              start_time: '',
              end_time: '',
            },
          ]
        }
      },

      addTimeSlot: function () {
        this.timeSlots.push({date: "", start_time: "", end_time: ""})
      },

      removeTimeSlot: function (idx) {
        this.timeSlots.splice(idx, 1)
      },

      async submit() {
        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        let eventData = _.pick(this.form, [
          'name',
          'image',
          'event_group',
          'teachers',
          'room',
          'seats',
          'price',
          'description',
          'use_time_slots',
          'show_in_calendar',
          'send_email_to_customer',
          'email_subject',
          'email_body',
        ])

        if (this.form.use_time_slots) {
          eventData.time_slots = _.map(this.timeSlots, timeSlot => {
            timeSlot = _.pick(timeSlot, ['date', 'start_time', 'end_time'])
            timeSlot.date = moment(timeSlot.date, 'DD-MM-YYYY').format('YYYY-MM-DD')
            return timeSlot
          })
        } else {
          eventData.start_date = moment(this.form.start_date, 'DD-MM-YYYY').format('YYYY-MM-DD')
          eventData.time_freetext = this.form.time_freetext
        }

        if (this.formType === 'edit') {
          await YogoApi.put('/events/' + this.$route.params.id, eventData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.hasBeenUpdated'),
          })
        }

        if (this.formType === 'add') {

          await YogoApi.post('/events', eventData)

          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: this.form.name + this.$t('global.isCreated'),
          })

        }

        this.$router.push({
          name: 'Events',
        })

      },

      getValidationClass(fieldName) {

        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      getTimeSlotValidationClass(idx, fieldName) {

        const field = this.$v.timeSlots.$each[idx][fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      async deleteEvent() {

        if (!confirm(this.$t('global.DoYouWantToDelete') + this.form.name + '?')) {
          return
        }

        this.loading = true
        await YogoApi.delete('/events/' + this.$route.params.id)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.form.name + this.$t('global.isDeleted'),
        })

        this.$router.push({
          name: 'Events',
        })

      },
      avatar() {
        return avatar
      },
      onSignupSelect(items) {
        this.selectedSignups = items
      },
    },

    validations() {
      let v = {
        form: {
          name: {
            required,
          },
          seats: {
            required,
          },
          price: {
            required,
          },
        },
      }
      if (this.form.use_time_slots) {
        v.timeSlots = {
          required,
          minLength: minLength(1),
          $each: {
            date: {
              required,
            },
            start_time: {
              required,
            },
            end_time: {
              required,
            },
          },

        }

      } else {
        v.form.start_date = {
          required,
        }
      }

      if (this.form.send_email_to_customer) {
        v.form.email_subject = {
          required,
        }
        v.form.email_body = {
          required,
        }
      }

      return v
    },
  }

</script>
