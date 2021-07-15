<template>
  <div>
    <md-table v-model="classes" md-sort="name" md-sort-order="asc" md-card>

      <md-table-empty-state
        :md-label="$t('global.NoClassesRegistered')"
        md-description="">
      </md-table-empty-state>

      <md-table-row
        slot="md-table-row"
        slot-scope="{ item }"
        :class="{ livestream: item.user_is_signed_up_for_livestream, cancelled: item.cancelled }"
        :key="'class_' + item.id"
      >
        <md-table-cell :md-label="$t('global.Class')">
          {{ item.class_type.name }}
          <span v-if="item.user_is_signed_up_for_waiting_list"><br>{{ $t('global.Number') }} {{ item.user_number_on_waiting_list }} {{ $t('global.onTheWaitlist') }}</span>
          <span v-if="item.user_is_signed_up_for_livestream"><br>-LIVESTREAM-</span>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.SubtitleLabel')">{{ item.subtitle ? item.subtitle : '--' }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Date')" md-sort-by="date">{{ formatDate(item.date) }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Time')" md-sort-by="time">{{ item.start_time + '-' + item.end_time }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Teacher')">{{ getTeacherNames(item) }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Room')" md-sort-by="room">{{ item.room ? item.room.name : '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Registration')">
          <md-button @click="signOffFromClass(item)" v-if="item.admin_can_sign_user_off_from_class || item.admin_can_sign_user_off_from_livestream">
            {{ $t('global.SignOff') }}
          </md-button>
          <md-button @click="signOffFromWaitingList(item)" v-if="item.admin_can_sign_user_off_from_waiting_list">
            {{ $t('global.CancelWaitlist') }}
          </md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>


  </div>
</template>

<script>
  import LoadingAnimation from "./LoadingAnimation.vue"
  import moment from 'moment'
  import YogoApi from '../gateways/YogoApi'
  import dateTimeFunctions from '@/mixins/dateTimeFunctions';

  export default {
    name: 'CustomerClasses',
    components: {
      LoadingAnimation,
    },
    mixins: [dateTimeFunctions],
    props: ['classes'],
    methods: {

      getTeacherNames(classItem) {
        const teacherNames = _.map(
            classItem.teachers,
            teacher => `${teacher.first_name} ${teacher.last_name}`.trim()
        )

        return teacherNames.join(', ')
      },

      async signOffFromClass(classItem) {

        if (!confirm(this.$t('global.CancelWarning') + classItem.class_type.name + '?')) return

        if (classItem.user_is_signed_up_for_livestream) {
          await YogoApi.delete('/class-livestream-signups/' + classItem.user_livestream_signup_id)
        } else {
          await YogoApi.delete('/class-signups/' + classItem.user_signup_id)
        }

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.CustomerIsNoLongerSignedUpFor') + classItem.class_type.name,
        })
        this.$emit('didDeleteSignup')

      },

      async signOffFromWaitingList(classItem) {

        if (!confirm(this.$t('global.WaitListCancelWarning') + classItem.class_type.name + '?')) return

          await YogoApi.delete('/class-waiting-list-signups/' + classItem.user_waiting_list_signup_id)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.CustomerHasBeenRemovedFromWaitlist') + classItem.class_type.name,
        })
        this.$emit('didDeleteSignup')

      },
    },
  }
</script>

<style lang="scss" scoped>

  .livestream {
    background: aliceblue;
  }

  .cancelled {
    background: #E57373;
  }

</style>

