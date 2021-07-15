<template>
  <div>
    <h2>{{ $t('global.Events') }}</h2>
    <router-link :to="{ name: 'EventAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateEvent') }}</md-tooltip>
      </md-button>
    </router-link>
    <div class="space4"></div>
    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <h3 v-if="currentEvents.length">
        {{ $t('global.UpcomingEvents') }}
      </h3>

      <md-table
          v-model="currentEvents"
          :md-sort.sync="currentEventsTableSortField"
          :md-sort-order.sync="currentEventsTableSortOrder"
          :md-sort-fn="currentEventsTableSortFn"
          md-card
          @md-selected="onSelectEvent"
      >
        <md-table-row
            slot="md-table-row"
            slot-scope="{ item }"
            md-selectable="single"
        >
          <md-table-cell :md-label="eventIdLabel" md-sort-by="id">{{ item.id }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Title')" md-sort-by="name">{{ item.name }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Date')" md-sort-by="start_date"
                         v-html="getEventDate(item)"></md-table-cell>
          <md-table-cell :md-label="$t('global.Teachers')">{{ getTeacherNames(item) }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Room')" md-sort-by="roomName">
            {{ item.room ? item.room.name : '--' }}
            <span v-if="client.branches && client.branches.length > 1 && item.room && item.room.branch">({{
                item.room.branch.name
              }})</span>
          </md-table-cell>
          <md-table-cell :md-label="$t('global.EventGroup')" md-sort-by="eventGroup">{{
              item.event_group ?
                  item.event_group.name : '--'
            }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Attendees')" md-sort-by="signup_count">{{
              item.signup_count
              + '/' + item.seats
            }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Price')" md-numeric md-sort-by="price">{{
              item.price |
                  currency_dkk
            }} kr
          </md-table-cell>
        </md-table-row>
      </md-table>

      <div v-if="currentEvents.length" class="space4"></div>

      <md-card>
        <md-list>
          <md-list-item md-expand>
            <md-icon>event</md-icon>
            <span class="md-list-item-text">{{ $t('global.PastEvents') }}</span>
            <md-list slot="md-expand">
              <md-table
                  v-model="previousEvents"
                  :md-sort.sync="pastEventsTableSortField"
                  :md-sort-order.sync="pastEventsTableSortOrder"
                  :md-sort-fn="pastEventsTableSortFn"
                  class="shadow-none"
                  md-card
                  @md-selected="onSelectEvent"
              >
                <md-table-row
                    slot="md-table-row"
                    slot-scope="{ item }"
                    md-selectable="single"
                >
                  <md-table-cell :md-label="eventIdLabel" md-sort-by="id">{{ item.id }}</md-table-cell>
                  <md-table-cell :md-label="$t('global.Title')" md-sort-by="name">{{ item.name }}</md-table-cell>
                  <md-table-cell :md-label="$t('global.Date')" md-sort-by="start_date"
                                 v-html="getEventDate(item)"></md-table-cell>
                  <md-table-cell :md-label="$t('global.Teachers')">{{ getTeacherNames(item) }}</md-table-cell>
                  <md-table-cell :md-label="$t('global.Room')" md-sort-by="roomName">
                    {{ item.room ? item.room.name : '--' }}
                    <span v-if="client.branches && client.branches.length > 1 && item.room && item.room.branch">({{
                        item.room.branch.name
                      }})</span>
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.EventGroup')" md-sort-by="eventGroup">{{
                      item.event_group ?
                          item.event_group.name : '--'
                    }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Attendees')" md-sort-by="signup_count">{{
                      item.signup_count
                      + '/' + item.seats
                    }}
                  </md-table-cell>
                  <md-table-cell :md-label="$t('global.Price')" md-numeric md-sort-by="price">{{
                      item.price |
                          currency_dkk
                    }} kr
                  </md-table-cell>
                </md-table-row>
              </md-table>
            </md-list>
          </md-list-item>
        </md-list>
      </md-card>
    </div>
  </div>
</template>
<script>
import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import moment from 'moment-timezone';
import customTableSort from '../helpers/customTableSort';
import dateTimeFunctions from '@/mixins/dateTimeFunctions';

const sortMethods = {
  id: 'number',
  name: 'string',
  start_date: 'string',
  price: 'number',
  for_sale: 'boolean',
  image: 'boolean',
  eventGroup: 'string',
  signup_count: 'number',
  roomName: 'string',
};

export default {
  name: 'events',
  components: { LoadingAnimation },
  mixins: [dateTimeFunctions],
  data() {
    return {
      eventIdLabel: 'ID',
      events: [],
      loading: true,
      currentEventsTableSortField: 'start_date',
      currentEventsTableSortOrder: 'asc',
      pastEventsTableSortField: 'start_date',
      pastEventsTableSortOrder: 'desc',
      today: moment.tz('Europe/Copenhagen')
          .format('YYYY-MM-DD'),
    };
  },
  computed: {
    ...mapGetters([
      'user',
      'stateReady',
      'client',
    ]),

    currentEvents: {
      get: function () {
        return _.filter(this.events, event => this.getEventSortDate(event) >= this.today);
      },
      set: function () {
      },
    },
    previousEvents: {
      get: function () {
        return _.filter(this.events, event => this.getEventSortDate(event) < this.today);
      },
      set: function () {
      },
    },
  },
  created() {
    if (this.stateReady) this.fetchEvents();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchEvents();
    },
  },
  methods: {
    async fetchEvents() {
      this.events = await YogoApi.get('/events' +
          '?populate[]=signup_count' +
          '&populate[]=time_slots' +
          '&populate[]=event_group' +
          '&populate[]=room' +
          '&populate[]=room.branch' +
          '&populate[]=teachers',
      );
      this.loading = false;
      _.each(this.events, e => {
        e.roomName = e.room ? e.room.name : '--';
        e.eventGroup = e.event_group ? e.event_group.name : '--';
      });
    },
    getTeacherNames(event) {
      if (!event.teachers) return '--';
      return _.map(
          event.teachers,
          teacher => (teacher.first_name + ' ' + teacher.last_name).trim(),
      )
          .join(', ');
    },
    getEventDate(event) {
      if (event.use_time_slots) {
        if (!event.time_slots || !event.time_slots.length) return '';
        const timeSlots = _.sortBy(event.time_slots, 'date');
        let returnString = this.formatDate(timeSlots[0].date, { month: 'short' })
            .replace(/ /g, '&nbsp;');
        if (timeSlots.length > 1) {
          returnString += '&nbsp;- ' + this.formatDate(timeSlots[timeSlots.length - 1].date, { month: 'short' })
              .replace(/ /g, '&nbsp;');
        }
        return returnString;
      } else {
        return moment(event.start_date)
            .format('D. MMMM YYYY');
      }
    },
    onSelectEvent(event) {
      this.$router.push({
        name: 'EventEdit',
        params: { id: event.id },
      });
    },
    currentEventsTableSortFn(value) {
      return customTableSort(
          value,
          this.currentEventsTableSortField,
          this.currentEventsTableSortOrder,
          sortMethods[this.currentEventsTableSortField],
      );
    },
    pastEventsTableSortFn(value) {
      return customTableSort(
          value,
          this.pastEventsTableSortField,
          this.pastEventsTableSortOrder,
          sortMethods[this.pastEventsTableSortField],
      );
    },
    getEventSortDate(event) {
      if (event.use_time_slots) {
        if (!event.time_slots || !event.time_slots.length) return '';
        const timeSlots = _.sortBy(event.time_slots, 'date');
        return timeSlots[timeSlots.length - 1].date;
      } else {
        return moment(event.start_date)
            .format('YYYY-MM-DD');
      }
    },
  },
};
</script>
