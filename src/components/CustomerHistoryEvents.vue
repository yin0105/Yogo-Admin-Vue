<template>
  <div>
    <md-table v-model="eventSignups">

      <md-table-empty-state
        md-label="Ingen tilmeldte kurser"
        md-description="">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell :md-label="$t('global.Event')">{{ item.event.name }} <span v-if="item.event.event_group">({{ item.event.event_group.name}})</span></md-table-cell>
        <md-table-cell :md-label="$t('global.Date')">{{ dbDateToHumanDate(item.event.start_date)
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Teacher')">{{ item.event.teachers.map(teacher =>
          teacher.first_name).join(', ') || '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Branch')" v-if="client.branches.length > 1">{{
          item.event.room ?
          item.event.room.branch.name : '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Room')">{{ item.event.room ? item.event.room.name : '--'
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.SignedUp_Time')">{{
          timeStampToHumanShortWeekdayDateTime(item.createdAt) }}
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex'
  import dateTimeFunctions from '../mixins/dateTimeFunctions'

  export default {
    name: 'CustomerHistoryEvents',
    props: ['eventSignups'],
    mixins: [dateTimeFunctions],
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
  }
</script>

<style lang="scss">

  td {
    white-space: nowrap;
  }

</style>
