<template>
  <div>
    <md-card>
      <md-list>
        <md-list-item md-expand>
          <md-icon>class</md-icon>
          <span class="md-list-item-text">{{ $t('global.RegisterClasses') }}</span>

          <md-list slot="md-expand">

            <div class="padding1">
              <md-datepicker md-immediately v-model="selectedDate" class="not-clearable"/>

              <div class="space4"></div>

              <loading-animation v-if="loading"></loading-animation>

              <md-table v-model="classes" v-else>

                <md-table-empty-state
                  md-label=""
                  md-description=""
                >
                {{ $t('global.NoClassesOnThisDate') }}
                </md-table-empty-state>

                <md-table-row
                  slot="md-table-row"
                  slot-scope="{ item }"
                  :class="{'class-cancelled':item.cancelled}"
                >
                  <md-table-cell :md-label="$t('global.Class')">
                    {{ item.class_type.name }} {{ item.cancelled ? '(AFLYST)' : '' }}
                    <span class="md-icon" v-if="item.livestream_enabled">live_tv</span>
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.SubtitleLabel')">
                    {{ item.subtitle ? item.subtitle : '--' }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Date')">
                    {{ formatDate(item.date) }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Time')">
                    {{ item.start_time + '-' + item.end_time }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Teacher')">
                    {{ getTeacherNames(item) }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Room')">
                    {{ item.room ? item.room.name : '--' }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.SignedUp')">
                    <span v-if="item.studio_attendance_enabled">{{ item.signup_count }}/{{ item.seats }}</span>
                    <span v-else>--</span>
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Waitlist')">
                    <span v-if="item.studio_attendance_enabled">{{ item.waiting_list_count }}/{{ item.waiting_list_max }}</span>
                    <span v-else>--</span>
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Livestream')"
                                 v-if="client.settings.livestream_enabled">
                    {{ item.livestream_signup_count }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Registration')">

                    <span v-if="item.user_is_signed_up_for_class">{{ $t('global.UserSignedUp') }}</span>
                    <span v-if="item.user_is_signed_up_for_waiting_list">{{ $t('global.Number') }} {{ item.user_number_on_waiting_list }} {{ $t('global.onTheWaitlist') }} </span>
                    <span v-if="item.user_is_signed_up_for_livestream">Tilmeldt livestream</span>

                    <span v-if="item.cancelled">-- {{ $t('global.Cancelled') }} --</span>
                    <span
                        v-else-if="item.class_has_started">-- {{ $t('global.ClassHasStarted') }} --</span>
                    <span
                        v-else-if="!item.user_has_access_to_class && !item.user_is_signed_up_for_class && !item.user_has_access_to_livestream && !item.user_is_signed_up_for_livestream">
                      -- {{ $t('global.MissingAccessCard') }} --
                    </span>

                    <md-button
                        v-if="item.admin_can_sign_user_up_for_class"
                        @click="signUpForClass(item)">
                      <span v-if="item.livestream_enabled">{{ $t('global.SignUpForStudioClass') }}</span>
                      <span v-else>{{ $t('global.SignUp') }}</span>
                    </md-button>
                    <md-button
                        v-if="item.admin_can_sign_user_up_for_waiting_list"
                        @click="signUpForWaitingList(item)">
                      {{ $t('global.AddToWaitlist') }}
                    </md-button>
                    <md-button
                        v-if="item.admin_can_sign_user_up_for_livestream"
                        @click="signUpForLivestream(item)">
                      {{ $t('global.SignUpForLivestream') }}
                    </md-button>

                  </md-table-cell>
                </md-table-row>
              </md-table>
            </div>
          </md-list>
        </md-list-item>
      </md-list>
    </md-card>

    <md-dialog :md-active.sync="showShouldCustomerBeCheckedInDialog">
      <md-dialog-title>{{ $t('global.CheckInCustomer') }}</md-dialog-title>
      <md-dialog-content>{{ $t('global.DoYouWantToCheckIn') }} {{ customer.first_name + ' ' +
        customer.last_name }} {{ $t('global.atTheSameTime') }}
      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="showShouldCustomerBeCheckedInDialog = false">{{ $t('global.Dismiss') }}</md-button>
        <md-button
            @click="signUpForClass(shouldCustomerBeCheckedInDialogData.classItem, false)">
          {{ $t('global.No') }}
        </md-button>
        <md-button
            @click="signUpForClass(shouldCustomerBeCheckedInDialogData.classItem, true)">
          {{ $t('global.Yes') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>
  import LoadingAnimation from './LoadingAnimation.vue'
  import moment from 'moment-timezone'
  import _ from 'lodash'
  import YogoApi from '../gateways/YogoApi'
  import { mapGetters } from 'vuex'

  import qs from 'qs'
  import dateTimeFunctions from '@/mixins/dateTimeFunctions';
  //import avatar from '../graphics/avatar'

  export default {
    components: { LoadingAnimation },
    mixins: [dateTimeFunctions],
    name: 'CustomerAddOptionsClass',
    props: ['customer', 'signedUpForClasses', 'customerClassPasses', 'customerMemberships'],
    data() {
      return {

        selectedDate: new Date(),
        loading: true,
        classes: [],


        showShouldCustomerBeCheckedInDialog: false,
        shouldCustomerBeCheckedInDialogData: {
          classItem: null,
        },
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
      ]),
    },
    created() {
      this.fetchClasses()
    },
    methods: {
      async fetchClasses() {

        const dateString = moment(this.selectedDate)
          .format('YYYY-MM-DD')

        const queryParams = {
          startDate: dateString,
          endDate: dateString,
          userToCalculateAccessFor: this.customer.id,
          populate: [
            'class_type',
            'teachers',
            'location',
            'room',
            'signup_count',
            'user_has_access_to_class',
            'user_is_signed_up_for_class',
            'waiting_list_count',
            'waiting_list_max',
            'user_number_on_waiting_list',
            'livestream_signup_count',
            'user_has_access_to_livestream',
            'user_is_signed_up_for_livestream',
            'admin_can_sign_user_up_for_class',
            'admin_can_sign_user_up_for_waiting_list',
            'admin_can_sign_user_up_for_livestream',
          ],
        }

        const response = await YogoApi.get('/classes?' + qs.stringify(queryParams))
        this.classes = _.sortBy(response.classes, ['start_time', 'room.id'])

        this.loading = false

      },
      getTeacherNames(classItem) {
        if (!classItem.teachers || !classItem.teachers.length) return ''
        const teacherNames = _.map(
            classItem.teachers,
            teacher => `${teacher.first_name} ${teacher.last_name}`.trim()
        )
        return teacherNames.join(', ')
      },

      classHasStarted(classItem) {
        return moment(
          moment(classItem.date)
            .format('YYYY-MM-DD') + ' ' + classItem.start_time,
          'YYYY-MM-DD HH:mm:ss',
        )
          .isBefore(moment())
      },
      classWasYesterdayOrEarlier(classItem) {
        return moment.tz(classItem.date, 'Europe/Copenhagen')
          .isBefore(moment()
            .tz('Europe/Copenhagen'), 'day')
      },

      async signUpForClass(classItem, checkCustomerIn) {

        if (classItem.signup_count >= classItem.seats && typeof checkCustomerIn === 'undefined') {
          if (!confirm(this.$t('global.fullyBookedDesc'))) {
            return
          }
        }

        const currentDate = moment()
          .tz('Europe/Copenhagen')
          .format('YYYY-MM-DD')

        if (currentDate === classItem.date && typeof checkCustomerIn === 'undefined') {
          this.shouldCustomerBeCheckedInDialogData = {
            classItem: classItem,
          }
          this.showShouldCustomerBeCheckedInDialog = true
          return
        }

        let signupRecord
        try {

          signupRecord = await YogoApi.post('/class-signups', {
            user: this.$route.params.id,
            'class': classItem.id,
            checked_in: !!checkCustomerIn,
          })

        } catch (err) {

          this.showShouldCustomerBeCheckedInDialog = false

          this.fetchClasses()

          if (err.response && err.response.data === 'E_ALREADY_SIGNED_UP') {
            alert(this.$t('global.customerAlreadySignedUp'))
            return
          }
          console.log(err)
          alert(this.$t('global.errorUnableToSignUp'), err)
        }

        this.showShouldCustomerBeCheckedInDialog = false

        this.fetchClasses()

        this.$emit('newCustomerSignup', signupRecord)
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.CustomerIsNowSignedUp') + classItem.class_type.name,
        })

      },

      async signUpForLivestream(classItem) {

        try {

          await YogoApi.post('/class-livestream-signups', {
            user: this.$route.params.id,
            'class': classItem.id,
          })

        } catch (err) {
          this.fetchClasses()

          alert(this.$t('global.errorUnableToSignUpLivestream'), err)
          return
        }

        this.fetchClasses()

        this.$emit('newCustomerSignup')
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.CustomerIsNowSignedUpLivestream') + classItem.class_type.name,
        })

      },
      async signUpForWaitingList(classItem) {

        try {

          await YogoApi.post('/class-waiting-list-signups', {
            user: this.$route.params.id,
            'class': classItem.id,
          })

        } catch (err) {
          alert(this.$t('global.errorUnableToSignUpWaitlist'), err)
          return
        }

        this.fetchClasses()

        this.$emit('newCustomerSignup')
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.CustomerIsNowSignedUpFor') + classItem.class_type.name,
        })

      },
      /*avatar() {
        return avatar
      },*/
    },
    watch: {
      signedUpForClasses() {
        this.fetchClasses()
      },
      customerClassPasses() {
        this.fetchClasses()
      },
      customerMemberships() {
        this.fetchClasses()
      },
      selectedDate(newDate) {
        this.fetchClasses()
      },
    },
  }
</script>
