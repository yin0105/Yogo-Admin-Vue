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
            <tr v-if="!teacher.folded" v-for="classItem in teacher.classes">
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
            <tr v-if="!teacher.classes.length">
              <td colspan="5">{{ $t('global.NoClassesForTheSelectedTimePeriod') }}</td>
            </tr>

            <tr>
              <th colspan="3">
                <md-button v-if="teacher.classes.length" @click="toggleFolded(idx)" v-bind:style="{margin: '0px', fontWeight: 'bold', color: 'white'}">
                  {{ $t('global.Total') }}: {{teacher.classes.length}} classes
                  <md-icon v-if="teacher.folded" v-bind:style="{color: 'white'}">expand_more</md-icon>
                  <md-icon v-else v-bind:style="{color: 'white'}">expand_less</md-icon>
                </md-button>
                <span v-else>{{ $t('global.Total') }}:</span>
              </th>              

              <th>
                <!-- {{ totalParticipantSessions }} -->
              </th>

              <th v-if="teacher.classes.length">
                {{ durationStringWithoutSecond(teacher.totalMins) }}
              </th>
              <th v-else></th>
              
              <th v-if="teacher.classes.length">{{ teacher.totalSignups }}</th>
              <th v-else></th>

              <th v-if="teacher.classes.length">{{ teacher.totalCheckedIn }}</th>
              <th v-else></th>
              
              <th v-if="teacher.classes.length">{{ teacher.totalLivestreamSignups }}</th>
              <th v-else></th>
              
              <th></th>
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
        fromDate: moment.tz('Europe/Copenhagen')
            .toDate(),
        endDate: moment.tz('Europe/Copenhagen')
            .toDate(),
        dateUpdated: false,
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
      handler: function (newPeriod, oldPeriod) {
        if (newPeriod == oldPeriod) console.log("OK");
        console.log(newPeriod.fromDate, oldPeriod.fromDate);
        console.log("dateUpdated: ", newPeriod.dateUpdated);
        if ( newPeriod.dateUpdated || newPeriod.teachers.teachers[0].totalMins == undefined) {
          this.fetchData();
        }
        
      },
      deep: true,
    },
  },
  mounted() {
    if (this.stateReady) this.fetchData();
  },

  methods: {
    async fetchData() {
        this.loading = true
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
          let totalMins = 0, totalCheckedIn = 0, totalSignups = 0, totalLivestreamSignups = 0;
          this.selectedPeriod.teachers.teachers[i].classes = [];
          for (const j in this.classes) {
            for (const k in this.classes[j].teachers) {
              if (this.selectedPeriod.teachers.teachers[i].id == this.classes[j].teachers[k].id) {
                this.selectedPeriod.teachers.teachers[i].classes.push(this.classes[j]);
                let start_timer = parseInt(this.classes[j].start_time.split(":")[0]) * 60 + parseInt(this.classes[j].start_time.split(":")[1])
                let end_timer = parseInt(this.classes[j].end_time.split(":")[0]) * 60 + parseInt(this.classes[j].end_time.split(":")[1])
                totalMins += end_timer - start_timer
                totalCheckedIn += this.classes[j].checkedin_count;
                totalSignups += this.classes[j].signup_count;
                totalLivestreamSignups += this.classes[j].livestream_signup_count;
                break;
              }
            }
          }
          this.selectedPeriod.teachers.teachers[i].totalMins = totalMins
          this.selectedPeriod.teachers.teachers[i].totalCheckedIn = totalCheckedIn
          this.selectedPeriod.teachers.teachers[i].totalSignups = totalSignups
          this.selectedPeriod.teachers.teachers[i].totalLivestreamSignups = totalLivestreamSignups          
          // Vue.set(this.selectedPeriod.teachers.teachers[i], "folded", true);
        }
        this.selectedPeriod.dateUpdated = false;

        this.loading = false
      },

    durationString(seconds) {
      return [_.padStart(Math.floor(seconds / 3600), 2, '0') +
          this.$t('time.hours') ,
          _.padStart(Math.floor((seconds % 3600) / 60), 2, '0') +
          this.$t('time.minutes') ,
          _.padStart(seconds % 60, 2, '0') +
          this.$t('time.seconds')].join(" ");;
    },
    durationStringWithoutSecond(mins) {
      const hh = Math.floor(mins / 60);
      const mm = Math.floor(mins % 60);

      let val =_.padStart(hh, 2, '0') + (hh > 1 ? this.$t('time.hours') : this.$t('time.hour'));
      if (mm > 0) {
        val += " " + _.padStart(mm, 2, '0') + (mm > 1 ? this.$t('time.minutes') : this.$t('time.minute'));
      }
      return val;
    },

    getDuration(start_time, end_time) {
      let start_timer = parseInt(start_time.split(":")[0]) * 60 + parseInt(start_time.split(":")[1]);
      let end_timer = parseInt(end_time.split(":")[0]) * 60 + parseInt(end_time.split(":")[1]);
      let mins = end_timer - start_timer;
      const hh = Math.floor(mins / 60);
      const mm = Math.floor(mins % 60);

      let val =_.padStart(hh, 2, '0') + (hh > 1 ? this.$t('time.hours') : this.$t('time.hour'));
      if (mm > 0) {
        val += " " + _.padStart(mm, 2, '0') + (mm > 1 ? this.$t('time.minutes') : this.$t('time.minute'));
      }
      return val;
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

    toggleFolded(idx) {
      console.log("toggled");
      this.selectedPeriod.teachers.teachers[idx].folded = !this.selectedPeriod.teachers.teachers[idx].folded;
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
