<template>
  <div>
    <md-card>
      <md-list>
        <md-list-item md-expand>
          <md-icon>event</md-icon>
          <span class="md-list-item-text">{{ $t('global.RegisterEvents') }}</span>

          <md-list slot="md-expand">

            <div class="padding1">

              <div class="space4"></div>

              <md-table v-model="events">

                <md-table-empty-state
                    md-label=""
                    md-description="">
                  {{ $t('global.NoEvents') }}
                </md-table-empty-state>

                <md-table-row slot="md-table-row" slot-scope="{ item }">
                  <md-table-cell :md-label="$t('global.Event')" md-sort-by="name">{{ item.name }}</md-table-cell>
                  <md-table-cell :md-label="$t('global.Date')" md-sort-by="date" v-html="getEventDate(item)"></md-table-cell>
                  <md-table-cell :md-label="$t('global.EventGroup')" md-sort-by="event_group">{{ item.event_group ? item.event_group.name : '--' }}</md-table-cell>
                  <md-table-cell :md-label="$t('global.Teachers')" md-sort-by="teacher">
                    {{ getTeacherNames(item) }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Room')" md-sort-by="room">{{ item.room ? item.room.name : '--' }}</md-table-cell>

                  <md-table-cell :md-label="$t('global.Registration')">
                    <span v-if="isCustomerSignedUpForEvent(item)">{{ $t('global.UserSignedUp') }}</span>
                    <md-button
                      v-else-if="canSignCustomerUpForEvent(item)"
                      @click="signUpForEvent(item)"
                    >
                      {{ $t('global.SignUp') }}
                    </md-button>
                  </md-table-cell>
                </md-table-row>
              </md-table>
            </div>
          </md-list>
        </md-list-item>
      </md-list>
    </md-card>
  </div>
</template>

<script>

    import YogoApi from '../gateways/YogoApi'
    import moment from 'moment'

    export default {
        name: 'customeraddoptionsevent',
        data() {
            return {
                events: []
            }
        },
        props: ['eventSignups'],
        created() {
            this.fetchEvents()
        },
        methods: {
            async fetchEvents() {
                try {
                    this.events = await YogoApi.get(
                        '/events' +
                        '?populate[]=teachers' +
                        '&populate[]=signup_count' +
                        '&populate[]=time_slots' +
                        '&populate[]=event_group' +
                        '&populate[]=room' +
                        '&endOnOrAfterDate=' + moment().format('YYYY-MM-DD')
                    )
                } catch (err) {
                    console.log(err)
                }

            },
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
                        returnString += '&nbsp;- ' +  moment(timeSlots[timeSlots.length - 1].date).format('D. MMMM YYYY').replace(/ /g, '&nbsp;')
                    }
                    return returnString
                } else {
                    return moment(event.start_date).format('D. MMMM YYYY')
                }
            },
            isCustomerSignedUpForEvent(event) {
                return !!_.find(this.eventSignups, eventSignup => eventSignup.event.id === event.id)
            },
            canSignCustomerUpForEvent(event) {
                return event.signup_count < event.seats
            },
            async signUpForEvent(event) {
                await YogoApi.post('/event-signups', {
                    user: this.$route.params.id,
                    event: event.id
                })

                this.$store.commit('postFlashMessage', {
                    type: 'MESSAGE_TYPE_INFO',
                    text: this.$t('global.CustomerIsNowSignedUp') + event.name
                })
                this.$emit('refreshCustomer')
            }
        }
    }
</script>
