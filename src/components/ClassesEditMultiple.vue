<template>
  <div>
    <h2>{{ $t('global.EditMultipleClasses') }}</h2>

    <div class="flex--row">
      <div class="flex--50">
        <h4>{{ $t('global.FindClasses') }}</h4>

        <label>
          {{ $t('global.FromDate') }}
        </label>
        <Datepicker v-model="selectedStartDate" :mondayFirst="true"></Datepicker>

        <md-field>
          <label>
            {{ $t('global.Weekday') }}
          </label>
          <md-select v-model="selectedWeekday">
            <md-option value="">-- {{ $t('global.NotSelected') }} --</md-option>
            <md-option value="0">{{ $t('global.Monday') }}</md-option>
            <md-option value="1">{{ $t('global.Tuesday') }}</md-option>
            <md-option value="2">{{ $t('global.Wednesday') }}</md-option>
            <md-option value="3">{{ $t('global.Thursday') }}</md-option>
            <md-option value="4">{{ $t('global.Friday') }}</md-option>
            <md-option value="5">{{ $t('global.Saturday') }}</md-option>
            <md-option value="6">{{ $t('global.Sunday') }}</md-option>
          </md-select>
        </md-field>

        <md-field>
          <label>{{ $t('global.ClassType') }}</label>
          <md-select v-model="selectedClassType">
            <md-option value="">-- {{ $t('global.NotSelected') }} --</md-option>
            <md-option v-for="classType in classTypes" :value="classType.id">
              {{ classType.name }}
            </md-option>
          </md-select>
        </md-field>

        <md-field>
          <label>{{ $t('global.Teacher') }}</label>
          <md-select v-model="selectedTeacher">
            <md-option value="">-- {{ $t('global.NotSelected') }} --</md-option>
            <md-option v-for="teacher in teachers" :value="teacher.id">{{ teacher.first_name }} {{
                teacher.last_name
              }}
            </md-option>
          </md-select>
        </md-field>

        <md-field>
          <label>
            {{ $t('global.StartTime') }}
          </label>
          <md-input type="text" v-model="selectedStartTime"
                    @blur="selectedStartTime = AutoFormatTime(selectedStartTime)"></md-input>
        </md-field>

        <md-field>
          <label>
            {{ $t('global.NumberOfAttendees') }}
          </label>
          <md-input type="text" v-model="selectedSeats"></md-input>
        </md-field>

        <md-button class="md-primary md-raised" :disabled="!showGetClassesButton" @click.prevent="fetchClasses"
                   style="margin-left:0;">
          <span v-if="!loading">{{ $t('global.FindClasses') }}</span>
          <span v-if="loading">{{ $t('global.GettingClasses') }}</span>
        </md-button>

        <md-button disabled class="md-primary" v-if="filteredClasses && !filteredClasses.length && !loading"
                   style="color:black;">
          {{ $t('global.NoClassesFound') }}
        </md-button>

      </div>

      <div
          class="flex--50"
      >
        <h4 class="mb-33px">{{ $t('global.Actions') }}</h4>
        <md-field>
          <label>{{ $t('global.NEWClassType') }}</label>
          <md-select v-model="newClassType">
            <md-option value=""></md-option>
            <md-option v-for="classType in classTypes" :value="classType.id">
              {{ classType.name }}
            </md-option>
          </md-select>
        </md-field>

        <div class="flex--row">
          <md-field class="flex--50">
            <label>
              {{ $t('global.NEWSubtitle') }}
            </label>
            <md-input type="text" v-model="newSubtitle" :disabled="clearSubtitle"></md-input>
          </md-field>
          <md-checkbox class="flex--50" v-model="clearSubtitle">{{ $t('global.CLEARSubtitle') }}</md-checkbox>
        </div>

        <md-field>
          <label>{{ $t('global.NEWTeachers') }}</label>
          <md-select v-model="newTeachers" multiple>
            <md-option v-for="teacher in teachers" :value="teacher.id">
              {{ teacher.first_name }} {{ teacher.last_name }}
            </md-option>
          </md-select>
        </md-field>

        <md-field v-if="client.settings.livestream_enabled">
          <label>{{ $t('global.NEWStudioAttendanceLivestreamType') }}</label>
          <md-select v-model="newStudioAttendanceLivestreamType">
            <md-option value=""></md-option>
            <md-option value="attendanceOnly">{{ $t('global.AttendanceOnly') }}</md-option>
            <md-option value="attendanceAndLivestream">{{ $t('global.AttendanceClassPlusLivestream') }}</md-option>
            <md-option value="livestreamOnly">{{ $t('global.LivestreamOnly') }}</md-option>
          </md-select>
        </md-field>

        <md-field>
          <label>
            {{ $t('global.NEWStartTime') }}
          </label>
          <md-input type="text" v-model="newStartTime" @blur="newStartTime = AutoFormatTime(newStartTime)"></md-input>
        </md-field>

        <md-field>
          <label>
            {{ $t('global.NEWEndTime') }}
          </label>
          <md-input type="text" v-model="newEndTime" @blur="newEndTime = AutoFormatTime(newEndTime)"></md-input>
        </md-field>

        <md-field>
          <label>
            {{ $t('global.NEWNumberOfSeats') }}
          </label>
          <md-input type="text" v-model="newSeats"></md-input>
        </md-field>

        <md-field>
          <label>{{ $t('global.NEWRoom') }}</label>
          <md-select v-model="newRoom">
            <md-option value=""></md-option>
            <md-option v-for="room in rooms" :value="room.id">
              {{ room.name + (room.branch ? ', ' + room.branch.name : '') }}
            </md-option>
          </md-select>
        </md-field>

        <md-button class="md-primary md-raised" @click="confirmAndExecuteChanges" :disabled="!showChangeClassesButton"
                   style="margin-left: 0;">
          {{ $t('global.ApplyChanges') }}
        </md-button>

        <md-button :class="{ 'red': showCancelButton }" class="md-primary md-raised" @click="cancelClasses"
                   :disabled="!showCancelButton">
          {{ $t('global.CancelClass_SingleOrMultiple') }}
        </md-button>

        <md-button :class="{ 'red': showDeleteButton }" class="md-primary md-raised" @click="deleteClasses"
                   :disabled="!showDeleteButton">
          {{ $t('global.DeleteClass_SingleOrMultiple') }}
        </md-button>
      </div>
    </div>


    <md-table v-if="filteredClasses" v-model="filteredClasses" @md-selected="onFilteredClassesSelect" md-card>
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="multiple"
                    md-auto-select>
        <md-table-cell :md-label="$t('global.Date')">
          {{ item.date | moment('dddd [d.] D. MMMM YYYY') }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Time')">
          {{ item.start_time.substr(0, 5) + '-' + item.end_time.substr(0, 5) }}
        </md-table-cell>

        <md-table-cell :md-label="$t('global.Class')">
          {{ item.class_type.name + (item.cancelled ? ' (AFLYST)' : '') }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Subtitle')">{{
            item.subtitle ||
            '--'
          }}
        </md-table-cell>

        <md-table-cell :md-label="$t('global.Type')" v-if="client.settings.livestream_enabled">
          <md-icon v-if="item.studio_attendance_enabled">home</md-icon>

          <span v-if="item.livestream_enabled">
            <md-icon>tv</md-icon>
          </span>
        </md-table-cell>

        <md-table-cell :md-label="$t('global.Teacher')">{{
            getTeacherNames(item)
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Room')">{{
            item.room ? item.room.name :
                '--'
          }} <span
              v-if="client.branches && client.branches.length > 1 && item.room && item.room.branch">({{
              item.room.branch.name
            }})</span>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Attendees')">{{
            item.signup_count +
            '/' + item.seats
          }}
        </md-table-cell>
        <md-table-cell
            v-if="client.settings.class_waiting_list_enabled || client.settings.private_class_waiting_list_enabled"
            :md-label="$t('global.Waitlist')"
            md-sort-by="waiting_list_signups">
          {{ item.waiting_list_count }}/{{ item.waiting_list_max }}
        </md-table-cell>
        <md-table-cell
            v-if="client.settings.livestream_enabled"
            :md-label="$t('global.AttendeesLivestream')"
            md-sort-by="livestream_signup_count">
          {{ item.livestream_enabled ? item.livestream_signup_count || 0 : '--' }}
        </md-table-cell>
      </md-table-row>
    </md-table>

    <md-dialog :md-active.sync="showChangeProgressDialog">
      <md-dialog-title>{{ changeDialogTitle }}</md-dialog-title>
      <md-dialog-content>
        <md-progress-bar md-mode="determinate" :md-value="changeClassesProgress"></md-progress-bar>
        <p>
          {{ processedClasses.length }}/{{ selectedClasses.length }}
        </p>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>

<script>

import Datepicker from 'vuejs-datepicker';
import YogoApi from '@/gateways/YogoApi';
import moment from 'moment-timezone';
import qs from 'qs';
import { mapGetters } from 'vuex';

import AutoFormatTime from '../auto-formatters/time';

export default {
  name: 'ClassesEditMultiple',
  components: { Datepicker },
  data() {
    return {
      loading: false,

      teachers: [],
      classTypes: [],
      rooms: [],

      selectedStartDate: moment.tz('Europe/Copenhagen')
          .toDate(),
      selectedWeekday: '',
      selectedClassType: null,
      selectedTeacher: null,
      selectedStartTime: null,
      selectedSeats: '',

      filteredClasses: null,
      selectedClasses: [],

      newTeachers: [],
      newStartTime: '',
      newEndTime: '',
      newClassType: '',
      newSubtitle: '',
      clearSubtitle: false,
      newSeats: '',
      newRoom: '',
      newStudioAttendanceLivestreamType: '',

      showChangeProgressDialog: false,
      changeDialogTitle: '',
      processedClasses: [],
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
    showGetClassesButton() {
      return !!(
          this.selectedWeekday !== ''
          || this.selectedTeacher
          || this.selectedClassType
          || this.selectedStartTime
          || this.selectedSeats !== ''
      ) & !this.loading;
    },
    showActionsForm() {
      return !!this.selectedClasses.length;
    },
    showChangeClassesButton() {
      return this.selectedClasses && this.selectedClasses.length
          && (
              this.newClassType
              || this.newSubtitle
              || this.clearSubtitle
              || (this.newTeachers && this.newTeachers.length)
              || this.newStartTime
              || this.newEndTime
              || this.newSeats !== ''
              || this.newStudioAttendanceLivestreamType
              || this.newRoom
          );
    },
    showCancelButton() {
      return this.selectedClasses && this.selectedClasses.length;
    },
    showDeleteButton() {
      return this.selectedClasses && this.selectedClasses.length;
    },
    changeClassesProgress() {
      return this.selectedClasses.length
          ? this.processedClasses.length / this.selectedClasses.length * 100
          : 0;
    },

  },
  watch: {
    clearSubtitle(clearSubtitle) {
      if (clearSubtitle) {
        this.newSubtitle = '';
      }
    },
  },
  async created() {
    [this.teachers, this.classTypes, this.rooms] = await Promise.all([
      YogoApi.get('/users?teacher=1'),
      YogoApi.get('/class-types'),
      YogoApi.get('/rooms?populate[]=branch'),
    ]);
    this.teachers = _.sortBy(this.teachers, ['first_name', 'last_name']);
    this.classTypes = _.sortBy(this.classTypes, 'name');
    this.rooms = _.sortBy(this.rooms, ['branch.sort', 'name']);
  },
  methods: {
    async fetchClasses() {
      const queryParams = {
        weekday: this.selectedWeekday !== '' ? this.selectedWeekday : undefined,
        teacher: this.selectedTeacher || undefined,
        class_type: this.selectedClassType || undefined,
        startTime: this.selectedStartTime || undefined,
        seats: this.selectedSeats !== '' ? this.selectedSeats : undefined,
        populate: [
          'class_type',
          'room.branch',
          'signup_count',
          'waiting_list_count',
          'waiting_list_max',
          'livestream_signup_count',
          'teachers',
        ],
      };
      if (this.selectedStartDate) {
        queryParams.startDate = moment(this.selectedStartDate)
            .tz('Europe/Copenhagen')
            .format('YYYY-MM-DD'); // Check this
        queryParams.endDate = moment(this.selectedStartDate)
            .tz('Europe/Copenhagen')
            .add(1, 'year')
            .subtract(1, 'day')
            .format('YYYY-MM-DD'); // (and this)
      } else {
        queryParams.startDate = moment.tz('Europe/Copenhagen')
            .format('YYYY-MM-DD'); // Check this
        queryParams.endDate = moment.tz('Europe/Copenhagen')
            .add(1, 'year')
            .subtract(1, 'day')
            .format('YYYY-MM-DD'); // (and this)
      }
      this.filteredClasses = [];
      this.$forceUpdate();
      this.loading = true;
      const queryString = qs.stringify(queryParams);
      ({ classes: this.filteredClasses } = await YogoApi.get(`/classes?${queryString}`));
      this.filteredClasses = _.sortBy(this.filteredClasses, ['date', 'start_time']);
      this.loading = false;
    },
    getTeacherNames(classItem) {
      if (!classItem.teachers) return '--';
      return _.map(classItem.teachers, teacher => {
        return (teacher.first_name + ' ' + teacher.last_name).trim();
      })
          .join(', ');
    },
    onFilteredClassesSelect(items) {
      this.selectedClasses = items;
    },
    async confirmAndExecuteChanges() {
      let confirmText = this.$t('global.DoYouWantToChange') + ' ' + this.selectedClasses.length + ' ' + this.$t('global.classes?') + '\n\n';
      confirmText += this.newStartTime ? this.$t('global.NewStartTime:') + this.newStartTime + '\n' : '';
      confirmText += this.newEndTime ? this.$t('global.NewEndTime:') + this.newEndTime + '\n' : '';
      confirmText += this.newSeats ? this.$t('global.NewAttendees:') + this.newSeats + '\n' : '';
      confirmText += (this.newTeachers && this.newTeachers.length)
          ? this.$t('global.NewTeachers:') + _.map(_.filter(this.teachers, t => _.includes(this.newTeachers, t.id)), 'first_name')
          .join(', ') + '\n'
          : ''; // Skal forbedres til kundebrug. Hvad hvis man vil fjerne lærere helt?
      confirmText += this.newClassType ? this.$t('global.NewClassType:') + _.find(this.classTypes, { id: this.newClassType }).name + '\n' : '';
      if (this.clearSubtitle) {
        confirmText += this.$t('global.CLEARSubtitle') + '\n';
      } else {
        confirmText += this.newSubtitle ? this.$t('global.NewSubtitle:') + this.newSubtitle + '\n' : '';
      }
      if (this.newRoom) {
        const room = _.find(this.rooms, { id: this.newRoom });
        const roomName = room.name + (room.branch ? (', ' + room.branch.name) : '');
        confirmText += this.$t('global.NewRoom') + ': ' + roomName + '\n';
      }
      if (this.newStudioAttendanceLivestreamType) {
        const newTypeTranslationKey = {
          livestreamOnly: 'global.LivestreamOnly',
          attendanceOnly: 'global.AttendanceOnly',
          attendanceAndLivestream: 'global.AttendanceClassPlusLivestream',
        }[this.newStudioAttendanceLivestreamType];
        confirmText += this.$t('global.NewType') + ': ' + this.$t(newTypeTranslationKey) + '\n';
      }

      if (!confirm(confirmText)) return;

      const newStartTime = this.newStartTime ? (this.newStartTime.length === 5 ? this.newStartTime + ':00' : this.newStartTime) : undefined;
      const newEndTime = this.newEndTime ? (this.newEndTime.length === 5 ? this.newEndTime + ':00' : this.newEndTime) : undefined;

      for (let i = 0; i < this.selectedClasses.length; i++) {
        if (
            this.selectedClasses[i].signup_count
            && this.newStudioAttendanceLivestreamType === 'livestreamOnly'
        ) {
          alert(this.$t('global.OneOrMoreClassesHasSignupsYouCanNotChangeToLivestreamOnly'));
          return;
        }
        if (
            this.selectedClasses[i].livestream_signup_count
            && this.newStudioAttendanceLivestreamType === 'attendanceOnly'
        ) {
          alert(this.$t('global.OneOrMoreClassesHasLivestreamSignupsYouCanNotChangeToStudioAttendanceOnly'));
          return;
        }
      }

      const changeData = {
        start_time: newStartTime,
        end_time: newEndTime,
        teachers: this.newTeachers && this.newTeachers.length ? this.newTeachers : undefined,
        class_type: this.newClassType || undefined,
        seats: this.newSeats !== '' ? this.newSeats : undefined,
        room: this.newRoom || undefined,
      };

      if (this.clearSubtitle) {
        changeData.subtitle = '';
      } else if (this.newSubtitle) {
        changeData.subtitle = this.newSubtitle;
      }

      switch (this.newStudioAttendanceLivestreamType) {
        case 'attendanceOnly':
          changeData.studio_attendance_enabled = true;
          changeData.livestream_enabled = false;
          break;
        case 'livestreamOnly':
          changeData.studio_attendance_enabled = false;
          changeData.livestream_enabled = true;
          break;
        case 'attendanceAndLivestream':
          changeData.studio_attendance_enabled = true;
          changeData.livestream_enabled = true;
          break;
        default:
          break;
      }

      this.processedClasses = [];
      this.changeDialogTitle = this.$t('global.ChangingClasses');
      this.showChangeProgressDialog = true;

      for (let i = 0; i < this.selectedClasses.length; i++) {
        const classObj = this.selectedClasses[i];
        const updatedClass = await YogoApi.put('/classes/' + classObj.id, changeData);
        this.processedClasses.push(updatedClass);
      }

      setTimeout(
          () => {
            alert(this.$t('global.Done:') + this.processedClasses.length + ' ' + this.$t('global.classesChanged!'));
            this.showChangeProgressDialog = false;
            this.fetchClasses();
          },
          250,
      );


    },

    async cancelClasses() {
      const confirmText = this.$t('global.DoYouWantToCancel') + ' ' + +this.selectedClasses.length + ' ' + this.$t('global.classes?');
      if (!confirm(confirmText)) return;

      this.processedClasses = [];
      this.changeDialogTitle = this.$t('global.CancellingClasses');
      this.showChangeProgressDialog = true;

      for (let i = 0; i < this.selectedClasses.length; i++) {
        const classObj = this.selectedClasses[i];
        if (classObj.cancelled) {
          this.processedClasses.push(classObj);
        } else {
          const cancelledClass = await YogoApi.put('/classes/' + classObj.id + '/cancel');
          this.processedClasses.push(cancelledClass);
        }
      }

      setTimeout(
          () => {
            alert(this.$t('global.Done:') + this.processedClasses.length + ' ' + this.$t('global.classesCancelled!'));
            this.showChangeProgressDialog = false;
            this.fetchClasses();
          },
          250,
      );

    },

    async deleteClasses() {
      const confirmText = this.$t('global.DoYouWantToDelete') + this.selectedClasses.length + ' ' + this.$t('global.classes?') + '\n\n'
          + this.$t('global.IfClassesHaveAttendeesTheyWillBeRefunded');
      if (!confirm(confirmText)) return;

      this.processedClasses = [];
      this.changeDialogTitle = this.$t('global.DeletingClasses');
      this.showChangeProgressDialog = true;

      for (let i = 0; i < this.selectedClasses.length; i++) {
        const classObj = this.selectedClasses[i];
        if ((classObj.signup_count || classObj.livestream_signup_count) && !classObj.cancelled) {
          await YogoApi.put('/classes/' + classObj.id + '/cancel');
        }
        const deletedClass = await YogoApi.delete('/classes/' + classObj.id);
        this.processedClasses.push(deletedClass);
      }

      setTimeout(
          () => {
            alert(this.$t('global.Done:') + this.processedClasses.length + ' ' + this.$t('global.classesDeleted!'));
            this.showChangeProgressDialog = false;
            this.fetchClasses();
          },
          250,
      );

    },
    AutoFormatTime: AutoFormatTime,
  },
};

</script>
