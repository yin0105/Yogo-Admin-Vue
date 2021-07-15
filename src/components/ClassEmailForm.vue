<template>

  <div>

    <LoadingAnimation v-if="loading"></LoadingAnimation>

    <div v-else>
      <div class="flex--100">
        <h2>{{ $route.params.emailId ? $t('global.Edit') : $t('global.Send') }} {{ $t('global.email') }}</h2>
        <h3>{{ $t('global.toTheAttendeesOn') }} {{ classItem.class_type.name }}, {{
          formatDate(classItem.date + ' ' + classItem.start_time, {weekday: true, time: true}) }}-{{
          classItem.end_time.substr(0,5) }}</h3>

      </div>

      <div class="flex--row">

        <div class="flex--50">

          <md-field :class="getValidationClass('subject')">
            <label>{{ $t('global.Subject')}}</label>
            <md-input required v-model="form.subject"></md-input>
            <span class="md-error" v-if="!$v.form.subject.required">{{ $t('global.SubjectIsRequired')}}</span>
          </md-field>

          <md-field :class="getValidationClass('body')">
            <label>{{ $t('global.Message')}}</label>
            <md-textarea required v-model="form.body"></md-textarea>
            <span class="md-error" v-if="!$v.form.body.required">{{ $t('global.MessageIsRequired')}}</span>
          </md-field>
          {{ $t('global.FollowingCodes')}}: [first_name], [last_name], [email].

          <div class="space8"></div>
          <md-field v-if="!form.email_sent">
            <label>{{ $t('global.Send') }}</label>
            <md-select v-model="form.sendWhen">
              <md-option value="now">{{ $t('global.Now') }}</md-option>
              <md-option value="datetime">{{ $t('global.AtASpecificTime') }}</md-option>
            </md-select>
          </md-field>
          <p v-else>{{ $t('global.TheEmailWasSent') }} {{ dbDateTimeToHumanShortWeekdayDateTime(form.send_at_datetime) }}</p>

          <div class="flex--row" v-if="form.sendWhen === 'datetime' && !form.email_sent">
            <div class="flex--50">
              <label>{{ $t('global.Date') }}</label>
              <Datepicker v-model="form.sendDate" :monday-first="true" :disabled-dates="upToYesterday"></Datepicker>
            </div>

            <md-field class="flex--50 flex--row">
              <label>{{ $t('global.TimeAsPointInTime') }}</label>
              <md-input v-model="form.sendTime" type="text" @blur="form.sendTime = AutoFormatTime(form.sendTime)"/>
            </md-field>

          </div>

          <div>
            <md-checkbox v-model="form.send_to_subsequent_signups">
              {{ $t('global.SendAutomaticallyToCustomersWhoSignUpLater') }}
            </md-checkbox>
          </div>

          <div class="space8"></div>

          <div>
            <label>{{ $t('global.SendEmailTo') }}</label>
            <div>
              <md-checkbox v-model="form.send_to_signups">{{ client.settings.livestream_enabled ? $t('global.AttendeesStudio') : $t('global.Attendees') }}</md-checkbox>
              <md-checkbox v-model="form.send_to_livestream_signups" v-if="client.settings.livestream_enabled">{{ $t('global.AttendeesLivestream') }}</md-checkbox>
              <md-checkbox v-model="form.send_to_waiting_list" v-if="waitingListEnabled">{{ $t('global.Waitlist') }}</md-checkbox>
            </div>
            <span class="error" v-if="!$v.form.sendToSomeone">{{ $t('global.EmailMustBeSentToSomeone') }}</span>
          </div>

          <div class="space8"></div>

          <md-button class="md-raised md-primary" @click="submit" v-if="showSendButton">
            {{ sendButtonText }}
          </md-button>
          <p v-else>{{ $t('global.ClassHasStartedAndTheEmailHasBeenSent') }}</p>
          <md-button class="md-raised md-primary red" @click="deleteEmail"
                     v-if="$route.params.emailId && !form.email_sent">
            {{ $t('global.DeleteEmail')}}
          </md-button>
          <md-button class="md-raised" @click="$router.push({name: 'ClassEdit', params: {id: classItem.id}})">
            {{ $t('global.Dismiss') }}
          </md-button>

        </div>

      </div>
    </div>

  </div>

</template>

<script>

  import LoadingAnimation from './LoadingAnimation'
  import YogoApi from '../gateways/YogoApi'
  import dateTimeFunctions from '../mixins/dateTimeFunctions'
  import Imgix from '../services/Imgix'
  import moment from 'moment-timezone'
  import Datepicker from 'vuejs-datepicker'
  import { mapGetters } from 'vuex'
  import AutoFormatTime from '../auto-formatters/time'

  import _pick from 'lodash/pick'
  import _assign from 'lodash/assign'

  const { required } = require('vuelidate/lib/validators')

  export default {
    name: 'ClassEmailForm',
    components: {
      LoadingAnimation,
      Datepicker,
    },
    mixins: [dateTimeFunctions, Imgix],
    data() {
      return {
        loading: true,

        form: {
          subject: '',
          body: '',
          sendWhen: 'now',
          sendDate: moment.tz('Europe/Copenhagen')
            .toDate(),
          sendTime: moment.tz('Europe/Copenhagen')
            .format('HH:mm'),
          send_to_signups: true,
          send_to_waiting_list: false,
          send_to_livestream_signups: true,
          send_to_subsequent_signups: true,
        },


        classItem: null,
      }
    },

    computed: {
      ...mapGetters([
        'client',
      ]),
      upToYesterday() {
        return {
          to: moment.tz('Europe/Copenhagen')
            .subtract(1, 'day')
            .toDate(),
        }
      },
      waitingListEnabled() {
        return this.classItem
          && (
            (parseInt(this.classItem.seats) === 1 && this.client.settings.private_class_waiting_list_enabled)
            || (this.classItem.seats > 1 && this.client.settings.class_waiting_list_enabled)
          )
      },
      showSendButton() {
        const classDateString = moment(this.classItem.date)
          .format('YYYY-MM-DD', 'Europe/Copenhagen')
        const classStart = moment.tz(classDateString + ' ' + this.classItem.start_time, 'Europe/Copenhagen')
        const now = moment.tz('Europe/Copenhagen')
        return this.$route.params.classId || now.isBefore(classStart) || !this.form.email_sent
      },
      sendButtonText() {
        return !this.form.email_sent && this.form.sendWhen === 'now' ? this.$t('global.Send') : this.$t('global.Save');
      },
    },

    created() {
      this.fetchInfo()
    },

    methods: {
      AutoFormatTime: AutoFormatTime,

      async fetchInfo() {

        let email
        if (this.$route.params.emailId) {
          email = await YogoApi.get('/class-emails/' + this.$route.params.emailId)

          this.form.subject = email.subject;
          this.form.body = email.body;
          this.form.send_at_datetime = email.send_at_datetime;
          this.form.email_sent = email.email_sent;

          this.form.send_to_signups = !!email.send_to_signups;
          this.form.send_to_waiting_list = !!email.send_to_waiting_list;
          this.form.send_to_livestream_signups = !!email.send_to_livestream_signups;
          this.form.send_to_subsequent_signups = !!email.send_to_subsequent_signups;

          this.form.sendDate = moment.tz(email.send_at_datetime.substr(0, 10), 'Europe/Copenhagen')
            .toDate()
          this.form.sendTime = email.send_at_datetime.substr(11, 5)
          this.form.sendWhen = 'datetime'
        }

        this.classItem = (
          await YogoApi.get('/classes?id=' + (this.$route.params.classId || email.class_id) + '&populate[]=class_type')
        ).classes[0]


        this.loading = false
      },

      async submit() {
        this.$v.$touch()

        if (this.$v.$invalid) {
          return
        }

        let sendDate,
          sendDateTime

        if (this.form.sendWhen === 'datetime') {
          sendDate = moment(this.form.sendDate)
            .format('YYYY-MM-DD')
          sendDateTime = moment.tz(sendDate + ' ' + this.form.sendTime, 'Europe/Copenhagen')

          if (!this.form.email_sent && sendDateTime.isBefore(moment())) {
            if (!confirm('Afsendelses-tidspunkt er passeret. Emailen vil blive sendt med det samme.')) return
            this.form.sendWhen = 'now'
          }
        }

        if (this.form.sendWhen === 'now') {
          sendDateTime = moment.tz('Europe/Copenhagen')
        }

        const classDate = moment(this.classItem.date)
          .format('YYYY-MM-DD')
        const classStart = moment.tz(classDate + ' ' + this.classItem.start_time, 'YYYY-MM-DD HH:mm', 'Europe/Copenhagen')

        if (sendDateTime.isAfter(classStart)) {
          if (!confirm(this.$t('global.AreYouSureYouWantToSendEmailToClassAfterClassStart'))) return
        }

        const submitData = _.pick(
          this.form,
          [
            'subject',
            'body',
            'send_to_signups',
            'send_to_waiting_list',
            'send_to_livestream_signups',
            'send_to_subsequent_signups',
          ],
        )

        let successMessage
        switch (this.form.sendWhen) {
          case 'now':
            submitData.send_at_datetime = moment.tz('Europe/Copenhagen')
              .format('YYYY-MM-DD HH:mm:ss')
            successMessage = 'Emailen er sendt'
            break
          case 'datetime':
            submitData.send_at_datetime = sendDateTime.format('YYYY-MM-DD HH:mm:ss')
            if (this.form.email_sent) {
              successMessage = 'Emailen er gemt'
            } else {
              successMessage = 'Emailen er lagt til afsendelse'
            }
            break
        }

        this.loading = true

        if (this.$route.params.emailId) {
          await YogoApi.put('/class-emails/' + this.$route.params.emailId, submitData)
        } else {
          submitData.class_id = this.classItem.id
          await YogoApi.post('/class-emails', submitData)
        }

        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: successMessage,
        })

        this.$router.push({
          name: 'ClassEdit',
          params: { id: this.classItem.id },
        })

      },

      async deleteEmail() {
        if (confirm('Vil du slette denne email?')) {
          const response = await YogoApi.delete('/class-emails/' + this.$route.params.emailId)

          if (response === 'E_COULD_NOT_DELETE_CLASS_EMAIL') {
            alert('Emailen kunne ikke slettes.')
          } else {
            this.$store.commit('postFlashMessage', {
              type: 'MESSAGE_TYPE_INFO',
              text: 'Emailen blev slettet',
            })
          }

          this.$router.push({
            name: 'ClassEdit',
            params: { id: this.classItem.id },
          })
        }
      },

      getValidationClass(fieldName) {

        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
        return {}
      },

    },
    validations: {
      form: {
        subject: {
          required,
        },
        body: {
          required,
        },
        sendToSomeone() {
          return this.form && (
              this.form.send_to_signups
              || this.form.send_to_livestream_signups
              || this.form.send_to_waiting_list
          );
        },
      },
    },
  }

</script>

<style lang="scss" scoped>

  textarea {
    min-height: 200px;
  }

  .error {
    color: red;
  }

</style>
