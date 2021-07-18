<template>
  <div style="min-height: 450px">
    <ReportsSubmenu></ReportsSubmenu>

    <div class="wrapper__submenu--content">
      <h2>{{ $t('global.Salary') }}</h2>

      <ReportPeriodWithTeacherList v-bind.sync="selectedPeriod"></ReportPeriodWithTeacherList>

      <loading-animation v-if="loading"></loading-animation>

      <div v-else>


        <!-- <div v-if="showDateLimitationMessage">
          {{ $t('global.LivestreamReportsAreAvailableFromDate', { date: reportsAvailabilityDate }) }}
        </div> -->

        <div v-for="(teacher, idx) in this.selectedPeriod.teachers.teachers" class="w-100 overflow-scroll">
          <h3>{{ teacher.name }}</h3>
          <table class="classes">
            <tr>
              <th>{{ $t('global.ID') }}</th>

              <th>{{ $t('global.Date') }}</th>
              <th>{{ $t('global.Time') }}</th>
              <th>{{ $t('global.Class') }}</th>

              <th>{{ $t('global.Duration') }}</th>
              <th>{{ $t('global.SignUps') }}</th>
              <th>{{ $t('global.CheckedIn') }}</th>
              <th>{{ $t('global.LivestreamSignups') }}</th>
              <th>{{ $t('global.Room') }}</th>

              <!-- <th>{{ $t('global.ParticipantsInclTeacher') }}</th>
              <th>{{ $t('global.StreamTimeTotal') }}</th> -->
            </tr>
            <tr v-for="classItem in teacher.classes">
              <td>
                {{ classItem.id }}
              </td>
              <td>
                {{ dbDateToHumanDate(classItem.date) }}
              </td>
              <td>
                {{ classItem.start_time.substr(0, 5) }}-{{ classItem.end_time.substr(0, 5) }}
              </td>
              <td>
                {{ classItem.class_type.name }}
              </td>
              <td>
                {{ getDuration(classItem.start_time, classItem.end_time) }}
              </td>
              <td>{{ classItem.signup_count }}</td>
              <td>{{ classItem.checkedin_count }}</td>
              <td>{{ classItem.livestream_signup_count }}</td>
              <td>{{ classItem.room.name }}</td>
            </tr>
            <tr v-if="!classes.length">
              <td colspan="5">{{ $t('global.NoClassesForTheSelectedTimePeriod') }}</td>
            </tr>

            <tr>
              <th colspan="3">
                {{ $t('global.Total') }}:
              </th>
              <th>
                {{ totalParticipantSessions }}
              </th>
              <th>
                {{ durationString(totalLivestreamSeconds) }}
              </th>
            </tr>
          </table>
        </div>
      </div>

    </div>

    <div class="space8"></div>
    <div class="space8"></div>
    <div class="space8"></div>
    <div class="space8"></div>
    <div class="space8"></div>

    <md-dialog :md-active.sync="showParticipantsDialog" v-if="classParticipantsDialogClass">
      <md-dialog-title>{{ classParticipantsDialogClass.class_type.name }},
        {{ dbDateToHumanDate(classParticipantsDialogClass.date) }},
        {{ classParticipantsDialogClass.start_time.substr(0, 5) }} -
        {{ classParticipantsDialogClass.end_time.substr(0, 5) }}
      </md-dialog-title>
      <md-dialog-content>
        <table class="participants">
          <tr>
            <th>{{ $t('global.Name') }}</th>
            <th>{{ $t('global.StartEndDuration') }}</th>
            <th>System</th>
          </tr>
          <tr v-for="(user, idx) in classLivestreamUsers" :class="{teacher: user.sessions[0].role === 'teacher'}">
            <td>{{ user.first_name }} {{ user.last_name }}</td>
            <td :class="{'no-padding': true}">

              <table class="sessions">
                <tr v-for="session in user.sessions">
                  <td>{{ session.start }}</td>
                  <td>{{ session.end }}</td>
                  <td>{{ durationString(session.livestream_seconds) }}</td>
                </tr>
              </table>

            </td>
            <td>
              <span v-if="user.parsedUserAgent">
                <span v-if="user.parsedUserAgent.device.model">
                  {{ user.parsedUserAgent.device.vendor }}
                  {{ user.parsedUserAgent.device.model }}
                  <br>
                </span>
                <span v-if="user.parsedUserAgent.browser.name === 'WebKit'">
                  YOGO App
                </span>
                <span v-else>
                  {{ user.parsedUserAgent.browser.name }}
                  {{ user.parsedUserAgent.browser.major }}
                </span>
                <br>
                {{ user.parsedUserAgent.os.name }}
                {{ user.parsedUserAgent.os.version }}

              </span>
            </td>
          </tr>
        </table>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showParticipantsDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>


</template>

<script>

import ReportPeriodWithTeacherList from './ReportPeriodWithTeacherList';

import LoadingAnimation from './LoadingAnimation';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';

import moment from 'moment-timezone';

import ReportsSubmenu from './ReportsSubMenu';

import dateTimeFunctions from '../mixins/dateTimeFunctions';

const REPORT_AVAILABLILITY_DATE = '2021-02-12';

export default {
  name: 'ReportSalary',
  mixins: [dateTimeFunctions],
  components: {
    ReportsSubmenu,
    LoadingAnimation,
    ReportPeriodWithTeacherList,
  },
  data() {
    return {
      selectedPeriod: {
        // periodType: 'day',
        // year: moment.tz('Europe/Copenhagen')
        //     .year(),
        // month: moment.tz('Europe/Copenhagen')
        //     .month(),
        fromDate: moment.tz('Europe/Copenhagen')
            .toDate(),
        endDate: moment.tz('Europe/Copenhagen')
            .toDate(),
        teachers: [],
      },

      classes: [],

      loading: true,

      classParticipantsDialogClass: null,
      classLivestreamUsers: [],
      showParticipantsDialog: false,
    };
  },
  computed: {
    ...mapGetters([
      'client',
      'stateReady',
      'apiRoot',
    ]),
    // requestStartDate() {
    //   switch (this.selectedPeriod.periodType) {
    //     case 'year':
    //       return this.selectedPeriod.year + '-01-01';
    //     case 'month':
    //       return this.selectedPeriod.year + '-' + _.padStart(this.selectedPeriod.month + 1, 2, '0') + '-01';
    //     case 'day':
    //       return moment(this.selectedPeriod.date)
    //           .format('YYYY-MM-DD');
    //     case 'custom':
    //       return moment(this.selectedPeriod.date)
    //           .format('YYYY-MM-DD');
    //   }
    // },
    // requestEndDate() {
    //   switch (this.selectedPeriod.periodType) {
    //     case 'year':
    //       return this.selectedPeriod.year + '-12-31';
    //     case 'month':
    //       const numberOfDaysInMonth = moment({
    //         y: this.selectedPeriod.year,
    //         M: this.selectedPeriod.month,
    //       })
    //           .daysInMonth();
    //       return this.selectedPeriod.year + '-' + _.padStart(this.selectedPeriod.month + 1, 2, '0') + '-' + numberOfDaysInMonth;
    //     case 'day':
    //       return moment(this.selectedPeriod.date)
    //           .format('YYYY-MM-DD');
    //     case 'custom':
    //       return moment(this.selectedPeriod.endDate)
    //           .format('YYYY-MM-DD');
    //   }
    // },
    // showDateLimitationMessage() {
    //   return this.requestStartDate < REPORT_AVAILABLILITY_DATE;
    // },
    // reportsAvailabilityDate() {
    //   return this.formatDate(REPORT_AVAILABLILITY_DATE);
    // },
    totalLivestreamSeconds() {
      return _.sum(
          _.map(this.classes, 'totalSeconds'),
      );
    },
    totalParticipantSessions() {
      return _.sum(
          _.map(this.classes, 'numberOfParticipants'),
      );
    },
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchData();
    },
    selectedPeriod: {
      handler: function (newPeriod) {
        this.fetchData();
      },
      deep: true,
    },
  },
  mounted() {
    if (this.stateReady) this.fetchData();
  },

  methods: {

    // async fetchData() {

    //   this.loading = true;
    //   console.log("fetchData :: ", this.selectedPeriod);

    //   // const query = {
    //   //   startDate: this.requestStartDate,
    //   //   endDate: this.requestEndDate,
    //   // };

    //   // const url = '/reports/livestream';
    //   // this.classes = await YogoApi.post(url, query);

    //   this.loading = false;

    // },
    async fetchData() {
        this.loading = true
        // const startDate = moment(this.selectedDate)
        // const endDate = (this.viewType === 'week' ? moment(startDate).add(6, 'days') : moment(startDate))
        console.log('/classes' +
          '?startDate=' + moment(this.selectedPeriod.fromDate).format('YYYY-MM-DD') +
          '&endDate=' + moment(this.selectedPeriod.endDate).format('YYYY-MM-DD') +
          '&populate[]=class_type' +
          '&populate[]=teachers' +
          '&populate[]=room' +
          '&populate[]=room.branch' +
          '&populate[]=signup_count' +
          '&populate[]=waiting_list_count' +
          '&populate[]=waiting_list_max' +
          '&populate[]=livestream_signup_count' +
          '&sort[]=' + encodeURIComponent('date ASC') +
          '&sort[]=' + encodeURIComponent('start_time ASC') );
          
        if (this.selectedPeriod.fromDate <= this.selectedPeriod.endDate) {
          let allClasses = await YogoApi.get('/classes' +
            '?startDate=' + moment(this.selectedPeriod.fromDate).format('YYYY-MM-DD') +
            '&endDate=' + moment(this.selectedPeriod.endDate).format('YYYY-MM-DD') +
            '&populate[]=class_type' +
            '&populate[]=teachers' +
            '&populate[]=room' +
            '&populate[]=room.branch' +
            '&populate[]=signup_count' +
            '&populate[]=waiting_list_count' +
            '&populate[]=waiting_list_max' +
            '&populate[]=livestream_signup_count' +
            '&sort[]=' + encodeURIComponent('date ASC') +
            '&sort[]=' + encodeURIComponent('start_time ASC') ,
            // (this.filterByBranch ? '&branch='+this.filterByBranch : ''),
          )
          console.log("classes :: ", allClasses);
          this.classes = allClasses.classes
          this.classes = _.sortBy(this.classes, ['date', 'start_time'])
        } else {
          this.classes = [];
        }
        for (const i in this.selectedPeriod.teachers.teachers) {
          this.selectedPeriod.teachers.teachers[i].classes = [];
          for (const j in this.classes) {
            for (const k in this.classes[j].teachers) {
              if (this.selectedPeriod.teachers.teachers[i].id == this.classes[j].teachers[k].id) {
                this.selectedPeriod.teachers.teachers[i].classes.push(this.classes[j]);
                break;
              }
            }
          }

        }
        // this.days = [];
        // for (let i = 0; i <= (this.viewType === 'week' ? 6 : 0) ; i++) {
        //   this.days[i] = {}
        //   this.days[i].date = this.getDateByIndex(i)
        //   let formattedDate = this.days[i].date.format('YYYY-MM-DD')
        //   this.days[i].classes = _.takeWhile(allClasses, cls => {
        //     return moment(cls.date)
        //       .format('YYYY-MM-DD') === formattedDate
        //   })
        //   allClasses.splice(0, this.days[i].classes.length)

        // }
        this.loading = false
      },

    durationString(seconds) {
      return _.padStart(Math.floor(seconds / 3600), 2, '0') +
          this.$t('global.hours') +
          _.padStart(Math.floor((seconds % 3600) / 60), 2, '0') +
          this.$t('global.minutes') +
          _.padStart(seconds % 60, 2, '0') +
          this.$t('global.seconds');
    },

    getDuration(start_time, end_time) {
      let start_timer = parseInt(start_time.split(":")[0]) * 60 + parseInt(start_time.split(":")[1])
      let end_timer = parseInt(end_time.split(":")[0]) * 60 + parseInt(end_time.split(":")[1])
      let seconds = end_timer - start_timer

      return _.padStart(Math.floor(seconds / 60), 2, '0') +
          this.$t('global.hours') +
          _.padStart(Math.floor(seconds % 60), 2, '0') +
          this.$t('global.minutes');
    },

    async showClassUsers(classItem) {
      this.classParticipantsDialogClass = classItem;
      const classLivestreamSessions = await YogoApi.get('/reports/livestream/class/' + classItem.id);
      this.classLivestreamUsers = _.chain(classLivestreamSessions)
          .groupBy('user.id')
          .map((userSessions) => {
            const user = userSessions[0].user;
            user.sessions = userSessions;
            user.sortByTeacher = user.sessions[0].role !== 'teacher';
            user.parsedUserAgent = user.sessions[0].parsedUserAgent;
            return user;
          })
          .toArray()
          .sortBy('sortByTeacher', 'first_name', 'last_name')
          .value();
      this.showParticipantsDialog = true;
    },

    moment: moment,
  },
};
</script>


<style lang="scss" scoped>

@import '../assets/scss/variables.scss';

table.classes, table.participants {
  border-collapse: collapse;
  width: 100%;
  background: #fff;
  border: 1px solid #ddd;;

  th, td {
    text-align: left;
    line-height: 1.4;
    font-weight: normal;
    border: 1px solid #ddd;
    padding: 12px 15px;
  }

  td.no-padding {
    padding: 0;
  }

  th {
    font-weight: bold;
    background: #01a7c2;
    color: #fff;
  }

  &.participants tr.teacher {
    td {
      font-weight: bold;
      background: #f5f5f5;

      a {
        font-weight: bold;
      }
    }
  }

}

table.sessions {
  border-collapse: collapse;
  width: 100%;
  background: #fff;

  th, td {
    text-align: left;
    line-height: 1.2;
    font-weight: normal;
    border: none;
    padding: 6px 8px;
    color: rgba(0, 0, 0, 0.87);
  }

  th {
    background: #ccc;
  }

  td {

  }
}


</style>
