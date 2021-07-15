<template>
  <div>
    <md-table v-model="eventSignups" md-sort="start_date" md-sort-order="asc" md-card>
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell :md-label="$t('global.Event')" md-sort-by="name">{{ item.event.name }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Date')" md-sort-by="date" v-html="getEventDate(item.event)"></md-table-cell>
        <md-table-cell :md-label="$t('global.EventGroup')" md-sort-by="eventGroup">{{ item.event.event_group ?
          item.event.event_group.name : '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Teachers')" md-sort-by="teachers">{{ getTeacherNames(item.event) }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Room')" md-sort-by="room">{{ item.event.room ? item.event.room.name : '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Registration')">
          <md-button @click="signOffFromEvent(item)">{{ $t('global.SignOff') }}</md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

  import moment from 'moment'
  import YogoApi from '../gateways/YogoApi'

  export default {
    name: 'CustomerEvents',
    props: ['eventSignups'],
    methods: {
      getTeacherNames(event) {
        if (!event.teachers) return '--'
        return _.map(event.teachers, teacher => {
          return teacher.first_name + ' ' + teacher.last_name
        }).join(', ')
      },
      getEventDate(event) {
        if (event.use_time_slots) {
          if (!event.time_slots || !event.time_slots.length) return ''

          const timeSlots = _.sortBy(event.time_slots, 'date')
          let returnString = moment(timeSlots[0].date).format('D. MMMM YYYY').replace(/ /g, '&nbsp;')
          if (timeSlots.length > 1) {
            returnString += '&nbsp;- ' + moment(timeSlots[timeSlots.length - 1].date).format('D. MMMM YYYY').replace(/ /g, '&nbsp;')
          }
          return returnString
        } else {
          return moment(event.start_date).format('D. MMMM YYYY')
        }
      },
      async signOffFromEvent(eventSignup) {

        if (!confirm(this.$t('global.CancelWarning') + eventSignup.event.name + '?\n\n' + this.$t('global.eventCancelDesc'))) return


        await YogoApi.delete('/event-signups/' + eventSignup.id)

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.CustomerIsNoLongerSignedUpFor') + eventSignup.event.name,
        })
        this.$emit('refreshCustomer')

      },

    },
  }
</script>
