<template>
  <div>
    <md-table v-model="combinedSignups">

      <md-table-empty-state
          :md-label="$t('global.NotSignedUpForAnyClasses')"
          md-description="">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }"
                    :class="{'class-cancelled' :item.class.cancelled, 'signup-cancelled': item.cancelled_at}">
        <md-table-cell :md-label="$t('global.Class')">
          {{ item.class.class_type.name }}
          <span v-if="item.class.cancelled">{{ $t('global.CANCELLED') }}</span>
          <md-icon v-if="item.signupType === 'livestream'">live_tv</md-icon>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Date')">{{ dbDateToHumanShortWeekdayDate(item.class.date) }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.TimeAsPointInTime')">{{ item.class.start_time }}-{{ item.class.end_time }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Teacher')">{{
            item.class.teachers.map(teacher =>
                teacher.first_name)
                .join(', ') || '--'
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Branch')" v-if="client.branches.length > 1">{{
            item.class.room && item.class.room.branch
                ?
                item.class.room.branch.name : '--'
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Room')">{{ item.class.room ? item.class.room.name : '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.SignedUp_Time')">{{
            timeStampToHumanShortWeekdayDateTime(item.createdAt)
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.CheckedIn')">{{
            item.checked_in ?
                timeStampToHumanShortWeekdayDateTime(item.checked_in) : '--'
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.SignupCancelled')">{{
            item.cancelled_at ?
                timeStampToHumanShortWeekdayDateTime(item.cancelled_at) : '--'
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.PassSlashMembership')">{{ getAccessTypeText(item) }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import dateTimeFunctions from '../mixins/dateTimeFunctions';

export default {
  name: 'CustomerHistoryClasses',
  mixins: [dateTimeFunctions],
  props: ['classSignups', 'classLivestreamSignups'],
  computed: {
    ...mapGetters([
      'client',
    ]),
    combinedSignups() {
      const taggedClassSignups = _.map(
          this.classSignups,
          cs => ({
            ...cs,
            signupType: 'attendance',
          }),
      );
      const taggedLivestreamSignups = _.map(
          this.classLivestreamSignups,
          cls => ({
            ...cls,
            signupType: 'livestream',
          }),
      );
      return _.chain(taggedClassSignups)
          .concat(taggedLivestreamSignups)
          .sortBy(cs => `${cs.class.date} ${cs.class.start_time} ${!cs.cancelled_at} ${_.padStart(cs.cancelled_at, 15, '0' )}`)
          .reverse()
          .value();
    },
  },
  methods: {
    getAccessTypeText(item) {
      if (item.used_class_pass) {
        return item.used_class_pass.class_pass_type.name + ' (ID ' + item.used_class_pass_id + ')';
      }
      if (item.used_membership) {
        return item.used_membership.membership_type.name + ' (ID ' + item.used_membership_id + ')';
      }
      return '--';
    },
  },
};
</script>

<style lang="scss" scoped>

tr.class-cancelled,
tr.signup-cancelled.class-cancelled {
  background: #E57373
}

tr.signup-cancelled {
  background: pink
}

td {
  white-space: nowrap;
}

</style>
