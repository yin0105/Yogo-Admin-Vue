<template>
  <div>
    <h2>
      {{ $t('global.Schedule') }}
    </h2>

    <md-button class="md-dense md-primary md-raised" style="margin-left: 0;margin-bottom: 20px; margin-top:-10px;" :to="{ name: 'ClassesEditMultiple' }">
      {{ $t('global.EditMultipleClasses') }}
    </md-button>

    <router-link :to="{ name: 'ClassAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right z-10">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateClass') }}</md-tooltip>
      </md-button>
    </router-link>

      <div class="w-full" style="position:relative">

        <div class="flex flex-col">
          <div class="relative flex items-center w-full justify-between flex-wrap">

            <md-datepicker md-immediately v-model="selectedDate" class="not-clearable flex-1 relative"></md-datepicker>

            <div class="flex-1">
              <div class="flex--100 flex justify-center">
                <md-field class="flex--75" v-if="client.branches && client.branches.length > 1">
                  <label>{{ $t('global.Branch') }}</label>
                  <md-select v-model="filterByBranch">
                    <md-option value="0">- - {{ $t('global.branchesAll') }} - -</md-option>
                    <md-option v-for="branch in client.branches" :value="branch.id" :key="'branch_' + branch.id">
                      {{ branch.name }}
                    </md-option>
                  </md-select>
                </md-field>
              </div>
            </div>

            <div class="flex items-center">
            <div class="pointer flex" @click="goToPreviousWeek">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevrons-left"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
            </div>
            <div class="pointer flex" @click="goToPreviousDay">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </div>

            <md-button class="md-dense" @click="goToToday">
              {{ $t('global.Today') }}
            </md-button>

            <md-button class="md-dense" @click="goToThisWeek">
              {{ $t('global.ThisWeek') }}
            </md-button>

            <div class="pointer flex" @click="goToNextDay">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            <div class="pointer flex" @click="goToNextWeek">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevrons-right"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
            </div>
          </div>
          </div>

        </div>
      </div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-for="day in days" v-else>
      <div class="space4"></div>
      <h3>
        {{ formatDate(day.date, {weekday: true, capitalize: true}) }}  {{ dateIsToday(day.date) ? ' ( ' + $t('global.Today') + ' ) ' : '' }}
      </h3>
      <md-table
        v-model="day.classes"
        md-card
        v-if="day.classes.length "
        @md-selected="onSelectClass"

      >
        <md-table-row
          slot="md-table-row"
          slot-scope="{ item }" md-selectable="single"
          :class="{'class-cancelled' : item.cancelled, livestream: client.settings.livestream_enabled && item.livestream_enabled}"
        >
          <md-table-cell :md-label="$t('global.ClassType')" md-sort-by="class_type">
            {{ item.class_type.name + (item.cancelled ? ' ( ' + $t('global.CANCELLED') + ' ) ' : '') }}
            <span v-if="client.settings.livestream_enabled && item.livestream_enabled">
              ( <span v-if="!item.studio_attendance_enabled">{{ $t('global.ONLY') }} </span>
              <md-icon v-if="item.livestream_enabled">live_tv</md-icon> )
            </span>
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Subtitle')" md-sort-by="class_subtitle">{{ item.subtitle ||
            '--' }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Time')" md-sort-by="time">
            {{ item.start_time.substr(0, 5) + '-' + item.end_time.substr(0, 5) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Teachers')" md-sort-by="teachers">{{ getTeacherNames(item)
            }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Room')" md-sort-by="room">
            {{ item.room ? item.room.name :
            '--' }}<span
              v-if="client.branches && client.branches.length > 1 && item.room && item.room.branch">, {{ item.room.branch.name }}</span>
          </md-table-cell>
          <md-table-cell :md-label="$t('global.SignedUp')" md-sort-by="signups">{{ item.signup_count +
            '/' + item.seats }}
          </md-table-cell>
          <md-table-cell
            v-if="client.settings.class_waiting_list_enabled || client.settings.private_class_waiting_list_enabled"
            :md-label="$t('global.Waitlist')"
            md-sort-by="waiting_list_signups">
            {{ item.waiting_list_count }}/{{ item.waiting_list_max}}
          </md-table-cell>
          <md-table-cell
            v-if="client.settings.livestream_enabled"
            :md-label="$t('global.Livestream')"
            md-sort-by="livestream_signup_count">
            {{ item.livestream_enabled ? item.livestream_signup_count || 0 : '--' }}
          </md-table-cell>
          <md-table-cell class="copy-button-cell">
            <md-button @click.prevent.stop="copyClassToNewClass(item)"
                       class="md-icon-button md-dense">
              <img src="@/assets/img/file_copy_outline.svg">
              <md-tooltip>
                {{ $t('global.Copy') }}
              </md-tooltip>
            </md-button>
          </md-table-cell>
        </md-table-row>
      </md-table>
      <p v-else>
        {{ $t('global.NoClasses') }}
      </p>
    </div>

    <div class="space8"></div>
  </div>

</template>

<script>

  import LoadingAnimation from './LoadingAnimation'
  import moment from 'moment'
  import YogoApi from '../gateways/YogoApi'
  import { mapGetters } from 'vuex'
  import dateTimeFunctions from '@/mixins/dateTimeFunctions';

  export default {
    name: 'scheme',
    components: {
      LoadingAnimation,
    },
    mixins: [dateTimeFunctions],
    data() {
      return {
        loading: true,
        filterByBranch: 0,
        selectedDate: (
          this.$route.params.date
            ? moment(this.$route.params.date, 'YYYY-MM-DD')
            : moment()
          ).toDate(),
        viewType: 'week',
        days: [],
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
      ]),
    },
    methods: {
      moment: moment,

      getDateByIndex(idx) {
        return moment(this.selectedDate)
          .startOf('isoDay')
          .add(idx, 'days')
      },

      async fetchClassesForDate() {
        this.loading = true
        const startDate = moment(this.selectedDate)
        const endDate = (this.viewType === 'week' ? moment(startDate).add(6, 'days') : moment(startDate))
        let allClasses = await YogoApi.get('/classes' +
          '?startDate=' + startDate.format('YYYY-MM-DD') +
          '&endDate=' + endDate.format('YYYY-MM-DD') +
          '&populate[]=class_type' +
          '&populate[]=teachers' +
          '&populate[]=room' +
          '&populate[]=room.branch' +
          '&populate[]=signup_count' +
          '&populate[]=waiting_list_count' +
          '&populate[]=waiting_list_max' +
          '&populate[]=livestream_signup_count' +
          '&sort[]=' + encodeURIComponent('date ASC') +
          '&sort[]=' + encodeURIComponent('start_time ASC') +
          (this.filterByBranch ? '&branch='+this.filterByBranch : ''),
        )
        allClasses = allClasses.classes
        allClasses = _.sortBy(allClasses, ['date', 'start_time'])
        this.days = [];
        for (let i = 0; i <= (this.viewType === 'week' ? 6 : 0) ; i++) {
          this.days[i] = {}
          this.days[i].date = this.getDateByIndex(i)
          let formattedDate = this.days[i].date.format('YYYY-MM-DD')
          this.days[i].classes = _.takeWhile(allClasses, cls => {
            return moment(cls.date)
              .format('YYYY-MM-DD') === formattedDate
          })
          allClasses.splice(0, this.days[i].classes.length)

        }
        this.loading = false
      },
      getTeacherNames(classItem) {
        if (!classItem.teachers) return '--'
        return _.map(classItem.teachers, teacher => {
          return (teacher.first_name + ' ' + teacher.last_name).trim()
        })
          .join(', ')
      },
      onSelectClass(classItem) {
        this.$router.push({
          name: 'ClassEdit',
          params: { id: classItem.id },
        })
      },
      goToPreviousDay() {
        this.viewType = 'day'
        this.selectedDate = moment(this.selectedDate).subtract(1, 'day').toDate()
      },
      goToToday() {
        this.viewType = 'day'
        this.selectedDate = moment().toDate()
      },
      goToNextDay() {
        this.viewType = 'day'
        this.selectedDate = moment(this.selectedDate).add(1, 'day').toDate()
      },
      goToPreviousWeek() {
        this.viewType = 'week'
        this.selectedDate = moment(this.selectedDate).subtract(1, 'week').startOf('isoWeek').toDate()
      },
      goToThisWeek() {
        this.viewType = 'week'
        this.selectedDate = moment().startOf('isoWeek').toDate()
      },
      goToNextWeek() {
        this.viewType = 'week'
        this.selectedDate = moment(this.selectedDate).add(1, 'week').startOf('isoWeek').toDate()
      },
      dateIsToday(date) {
        return moment(date).isSame(moment(), 'day')
      },
      copyClassToNewClass(classItem) {
        this.$router.push({
          name: 'ClassAdd',
          query: { fromClass: classItem.id },
        })
      },
      waitingListText(classItem) {
        if (!classItem.seats) {
          return '-'
        }
        if (parseInt(classItem.seats) === 1) {
          return classItem.waiting_list_count + '/' + this.client.settings.private_class_waiting_list_max_customers_on_waiting_list
        }
        return classItem.waiting_list_count + '/' + this.client.settings.class_waiting_list_max_customers_on_waiting_list
      },
    },

    created: function () {
      this.fetchClassesForDate.bind(this)()
    },

    watch: {
      selectedDate(newDate, oldDate) {
         if (moment(newDate).format('YYYY-MM-DD') === moment(oldDate).format('YYYY-MM-DD')) {
           return
         }
        this.fetchClassesForDate.bind(this)()
      },

      filterByBranch() {
        this.fetchClassesForDate()
      }
    },
  }
</script>

<style lang="scss" scoped>

  .button--last-week {
    position: absolute;
    right: 125px;
    top: 0;
    color: #697b8c;
    margin-right: 12px;
  }

  .button--today {
    position: absolute;
    right: 35px;
    top: 0;
    color: #697b8c;
    margin-left: 8px !important;
  }

  .button--next-week {
    position: absolute;
    right: 0;
    top: 0;
    color: #697b8c;
    margin-left: 0;
  }

  .livestream {
    background: aliceblue;
  }

  .copy-button-cell {
    width: 0;

    .md-table-cell-container {
      padding-right: 0;
      padding-left: 0;
    }

  }

</style>
