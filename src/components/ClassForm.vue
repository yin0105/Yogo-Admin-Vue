<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <div class="flex__2-1--container">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div v-if="$route.query.fromClass && fromClass">
        {{ $t('global.CopyOf') }} {{ fromClass.class_type.name }},
        {{ fromClass.date | moment('dddd [d.] D. MMMM YYYY') }} kl. {{ fromClass.start_time }}
      </div>

      <div class="space4"></div>
      <md-button class="md-raised button-link" @click="goBack">
        {{ $t('global.Back') }}
      </md-button>
      <div class="space4"></div>

      <div class="flex--row">
        <div class="flex--50">
          <label>{{ $t('global.Date') }} *</label>
          <md-datepicker
              v-model="form.date"
              class="flex--50 not-clearable"
              :class="getValidationClass('date')"
              @input="dateDidChange"
              :md-immediately="true"
          >
          </md-datepicker>
        </div>
      </div>

      <div class="flex--row">
        <md-field class="flex--50" :class="getValidationClass('start_time')">
          <label>{{ $t('global.StartTime') }}</label>
          <md-input
              required
              v-model="form.start_time"
              @blur="form.start_time = AutoFormatTime(form.start_time)"
          >
          </md-input>
          <span class="md-error" v-if="!$v.form.start_time.required">{{ $t('global.StartTimeMust') }}</span>
        </md-field>

        <md-field class="flex--50" :class="getValidationClass('end_time')">
          <label>{{ $t('global.EndTime') }}</label>
          <md-input required v-model="form.end_time"
                    @blur="form.end_time = AutoFormatTime(form.end_time)"></md-input>
          <span class="md-error" v-if="!$v.form.end_time.required">{{ $t('global.EndTimeMust') }}</span>
        </md-field>
      </div>

      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('class_type_id')">
          <label>{{ $t('global.ClassType') }}</label>
          <md-select v-model="form.class_type_id" required>
            <md-option
              v-for="classType in classTypes"
              :value="classType.id"
              :key="'classType_' + classType.id"
            >
              {{ classType.name }}
            </md-option>
          </md-select>
          <span
            class="md-error"
            v-if="!$v.form.class_type_id.required"
          >
            {{ $t('global.ClassTypeMust') }}
          </span>
        </md-field>

        <md-field class="flex--50">
          <label>{{ $t('global.SubtitleDesc') }}</label>
          <md-input v-model="form.subtitle"></md-input>
        </md-field>

      </div>

      <div class="flex--row">

        <md-field class="flex--50" :class="getValidationClass('seats')">
          <label>{{ $t('global.MaxParticipants') }}</label>
          <md-input type="number" v-model="form.seats" required @blur="seatsBlur"></md-input>
          <span
            class="md-error"
            v-if="!$v.form.seats.required"
          >
            {{ $t('global.MaxParticipantsMust') }}
          </span>
        </md-field>

        <md-field class="flex--50 custom__field--height">
          <label>{{ $t('global.Room') }}</label>
          <md-select name="classType" v-model="form.room_id">
            <md-option value="">--</md-option>
            <md-option :value="room.id" v-for="room in rooms" :key="'room_' + room.id">
              {{ room.name }}
              <span v-if="room.branch">,&nbsp;{{ room.branch.name }}</span>
            </md-option>
          </md-select>
        </md-field>

      </div>

      <div class="flex--row">

        <md-field class="flex--50">
          <label>{{ $t('global.Teachers') }}</label>
          <md-select v-model="form.teachers" multiple>
            <md-option v-for="teacher in teachers" :value="teacher.id" :key="teacher.id">
              {{ teacher.first_name + ' ' + teacher.last_name }}
            </md-option>
          </md-select>
        </md-field>

        <md-field class="flex--50" v-if="client.settings.livestream_enabled">
          <label>{{ $t('global.Livestream') }}</label>
          <md-select v-model="form.livestream">
            <md-option value="attendanceOnly">{{ $t('global.AttendanceOnly') }}</md-option>
            <md-option value="attendanceAndLivestream">{{ $t('global.AttendanceClassPlusLivestream') }}</md-option>
            <md-option value="livestreamOnly">{{ $t('global.LivestreamOnly') }}</md-option>
          </md-select>
        </md-field>

      </div>

      <div class="space8"></div>

      <div class="flex--50">
        <md-checkbox v-model="repeatClass" v-if="formType === 'add' && form.date">
          {{ $t('global.CreateRepeatsOfTheClass') }}
        </md-checkbox>
        <div v-show="form.date && repeatClass">
          <md-field>
            <label>{{ $t('global.NumberOfRepeat') }}</label>
            <md-input required v-model="repeatClassCount"></md-input>
          </md-field>
          <div class="flex--row flex--50">
            <md-field class="flex--50">
              <label>{{ $t('global.Repeats') }}</label>
              <md-select v-model="repeatClassIntervalFactor">
                <md-option value="1">{{ $t('global.Every') }}</md-option>
                <md-option value="2">{{ $t('global.EveryOther') }}</md-option>
                <md-option value="3">{{ $t('global.EveryThird') }}</md-option>
                <md-option value="4">{{ $t('global.EveryFourth') }}</md-option>
              </md-select>
            </md-field>
            <md-field class="flex--50">
              <md-select v-model="repeatClassIntervalUnit">
                <md-option value="day">{{ $t('global.day') }}</md-option>
                <md-option value="week">{{ $t('global.week') }}</md-option>
                <md-option value="month">{{ $t('global.month') }}</md-option>
              </md-select>
            </md-field>

          </div>

          <div>
            <label class="label--datepicker">{{ $t('global.LastRepeat') }}</label>
            <md-datepicker
                v-model="repeatClassEndDate"
                :md-disabled-dates="repeatClassDateDisabledDates"
                class="not-clearable"
            >
            </md-datepicker>
          </div>

          <div class="space4"></div>
        </div>

      </div>

      <md-button class="md-raised md-primary" @click="submit">
        {{ saveLabel }}
      </md-button>

      <md-button
        class="md-raised md-primary red"
        @click="cancelClass"
        v-if="formType === 'edit' && classCanBeCancelled()"
      >
        {{ $t('global.CancelClass') }}
      </md-button>

      <md-button
        class="md-raised md-primary red"
        @click="deleteClass"
        v-if="formType === 'edit' && classCanBeDeleted()"
      >
        {{ $t('global.DeleteClass') }}
      </md-button>

      <div class="space8"></div>

      <ClassEmails
        v-if="formType === 'edit'"
        :class-emails="form.class_emails"
        @composeEmail="$router.push({name: 'CreateClassEmail', params: {classId: form.id}})"
      />

      <div class="space8"></div>

      <div v-if="formType === 'edit'">
        <h3>{{ $t('global.SignedUp') }} ({{ form.signups.length }})</h3>
        <md-button
          type="button"
          v-if="selectedSignups.length"
          class="md-raised"
          @click.prevent="showExportSignupEmailsDialog = true"
        >
          {{ $t('global.ExportEmails') }}
        </md-button>
        <md-button
          type="button"
          v-if="selectedSignups.length"
          class="md-raised"
          @click.prevent="showExportSignupPhoneNumbersDialog = true"
        >
          {{ $t('global.ExportPhoneNumbers') }}
        </md-button>

        <md-table
          v-model="form.signups"
          md-sort="name"
          md-sort-order="asc"
          md-card
          class="participant-list"
          v-if="formType === 'edit' && form.signups.length" @md-selected="onSignupSelect"
        >
          <md-table-row
            slot="md-table-row"
            slot-scope="{ item }"
            md-selectable="multiple"
            md-auto-select
          >
            <md-table-cell md-label="">
              <img class="circle profile-image" :src="getProfileImageSrc(item.user)"/>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Name')" md-sort-by="name">
              <a @click.stop="$router.push({name: 'CustomerInfo', params: {id: item.user.id}})">{{
                  item.user.first_name + ' ' + item.user.last_name
                }}</a>
            </md-table-cell>

            <md-table-cell :md-label="$t('global.Email')" md-sort-by="email">
              <a :href="'mailto:'+item.user.email" @click.stop="">
                {{ item.user.email }}
              </a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Phone')" md-sort-by="name"><a
                :href="'tel:'+item.user.phone"
                @click.stop="">{{ item.user.phone }}</a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.BookedWith')">
              <router-link :to="{name: 'Membership',params: {id: item.used_membership.id}}" v-if="item.used_membership">
                {{ item.used_membership.membership_type.name }}
              </router-link>
              <router-link :to="{name: 'ClassPassEdit',params: {id: item.used_class_pass.id}}"
                           v-if="item.used_class_pass">
                {{ item.used_class_pass.class_pass_type.name }}
              </router-link>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.CheckIn')">
              <span v-if="item.checked_in">
                {{ $t('global.Yes') }}
                <a href="#" @click.prevent="signupCancelCheckin(item)"
                   v-if="adminCanChangeCheckinStatus"
                >( {{
                    $t('global.CheckOut')
                  }} )</a></span>
              <span v-else>
                <span v-if="!item.no_show_fee_applied">--</span>
                <a href="#" v-if="adminCanChangeCheckinStatus"
                                 @click.prevent="signupCheckCustomerIn(item)">( {{ $t('global.CheckIn') }} )</a>

                <span v-if="item.no_show_fee_applied && item.used_membership">
                  <span :style="{'text-decoration': item.no_show_fee.cancelled_at ? 'line-through' : 'none'}">
                    {{ $t('global.NoShowFeeAdded') }}, {{ item.no_show_fee.amount }} kr
                  </span>
                  <a @click.stop="cancelNoShowFee(item.no_show_fee.id)" v-if="!item.no_show_fee.cancelled_at && !item.no_show_fee.paid_at">
                    {{ $t('global.CancelFee') }}
                  </a>
                  <a @click.stop="reactivateNoShowFee(item.no_show_fee.id)" v-if="item.no_show_fee.cancelled_at">
                    {{ $t('global.ReactivateFee') }}
                  </a>
                </span>

                <span v-if="item.no_show_fee_applied && item.used_class_pass && item.used_class_pass.class_pass_type.pass_type === 'unlimited'">
                  {{ $t('global.NoShowDayCharged') }}
                </span>
                <span v-if="item.no_show_fee_applied && item.used_class_pass && item.used_class_pass.class_pass_type.pass_type === 'fixed_count'">
                  {{ $t('global.NoShowClassNotRefunded') }}
                </span>
              </span>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </div>

      <div class="space8"></div>

      <div
          v-if="(client.settings.class_waiting_list_enabled || client.settings.private_class_waiting_list_enabled) && formType === 'edit'">
        <h3>
          {{ $t('global.Waitlist') }} ({{ form.waiting_list_signups.length }})
        </h3>
        <md-button
            type="button"
            v-if="selectedWaitingListSignups.length"
            class="md-raised"
            @click.prevent="showExportWaitingListSignupEmailsDialog = true"
        >
          {{ $t('global.ExportEmails') }}
        </md-button>
        <md-button
            type="button"
            v-if="selectedWaitingListSignups.length"
            class="md-raised"
            @click.prevent="showExportWaitingListSignupPhoneNumbersDialog = true"
        >
          {{ $t('global.ExportPhoneNumbers') }}
        </md-button>

        <md-table
            v-model="form.waiting_list_signups"
            md-card
            class="participant-list"
            v-if="formType === 'edit' && form.waiting_list_signups.length"
            @md-selected="onWaitingListSignupSelect"
        >
          <md-table-row
              slot="md-table-row"
              slot-scope="{ item }"
              md-selectable="multiple"
              md-auto-select
          >
            <md-table-cell :md-label="$t('global.Number')">
              {{ item.number_on_waiting_list }}
            </md-table-cell>
            <md-table-cell md-label="">
              <img class="circle profile-image" :src="getProfileImageSrc(item.user)"/>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Name')">
              {{ item.user.first_name + ' ' + item.user.last_name }}
            </md-table-cell>

            <md-table-cell :md-label="$t('global.Email')">
              <a :href="'mailto:'+item.user.email" @click.stop="">
                {{ item.user.email }}
              </a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Phone')">
              <a :href="'tel:'+item.user.phone" @click.stop="">
                {{ item.user.phone }}
              </a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.CustomerInfo')">
              <md-button @click="$router.push({name:'CustomerInfo', params: { id: item.user.id }})">
                {{ $t('global.SeeCustomer') }}
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>

      </div>

      <div
          v-if="form.livestream_enabled && formType === 'edit'">
        <h3>{{ $t('global.SignedUpForLivestream') }} ({{ form.livestream_signups.length }})</h3>
        <md-button
            type="button"
            v-if="selectedLivestreamSignups.length"
            class="md-raised"
            @click.prevent="showExportLivestreamSignupEmailsDialog = true"
        >
          {{ $t('global.ExportEmails') }}
        </md-button>
        <md-button
            type="button"
            v-if="selectedLivestreamSignups.length"
            class="md-raised"
            @click.prevent="showExportLivestreamSignupPhoneNumbersDialog = true"
        >
          {{ $t('global.ExportPhoneNumbers') }}
        </md-button>

        <md-table v-model="form.livestream_signups" md-card class="participant-list"
                  v-if="formType === 'edit' && form.livestream_signups.length"
                  @md-selected="onLivestreamSignupSelect">
          <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="multiple"
                        md-auto-select>
            <md-table-cell md-label="">
              <img class="circle profile-image" :src="getProfileImageSrc(item.user)"/>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Name')">
              {{ item.user.first_name + ' ' + item.user.last_name }}
            </md-table-cell>

            <md-table-cell :md-label="$t('global.Email')">
              <a :href="'mailto:'+item.user.email" @click.stop="">
                {{ item.user.email }}
              </a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Phone')">
              <a :href="'tel:'+item.user.phone" @click.stop="">
                {{ item.user.phone }}
              </a>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.CustomerInfo')">
              <md-button @click="$router.push({name:'CustomerInfo', params: { id: item.user.id }})">
                {{ $t('global.SeeCustomer') }}
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>

      </div>

      <div class="space4"></div>

    </div>

    <md-dialog :md-active.sync="showCreateClassesDialog" :md-close-on-esc="false"
               :md-click-outside-to-close="false">
      <md-dialog-title>{{ $t('global.CreatingClasses') }}</md-dialog-title>
      <md-dialog-content>
        <md-progress-bar md-mode="determinate" :md-value="createClassesProgress"></md-progress-bar>
      </md-dialog-content>
    </md-dialog>

    <md-dialog :md-active.sync="showCancelClassDialog" :md-close-on-esc="false"
               :md-click-outside-to-close="false">
      <md-dialog-title>{{ $t('global.CancellingClass') }}...</md-dialog-title>
      <md-dialog-content>
        <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      </md-dialog-content>
    </md-dialog>

    <md-dialog :md-active.sync="showExportSignupEmailsDialog">
      <md-dialog-title>{{ $t('global.ExportEmails') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.Emails') }}</label>
          <md-textarea
              v-model="exportSignupEmailsResult"
              id="export-signup-emails-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportEmailsDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showExportSignupEmailsDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>


    <md-dialog :md-active.sync="showExportSignupPhoneNumbersDialog">
      <md-dialog-title>{{ $t('global.ExportPhoneNumbers') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.PhoneNumbers') }}</label>
          <md-textarea v-model="exportSignupPhoneNumbersResult"
                       id="export-signup-phone-numbers-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportPhoneDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showExportSignupPhoneNumbersDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showExportWaitingListSignupEmailsDialog">
      <md-dialog-title>{{ $t('global.ExportEmailsFromWaitlist') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.Emails') }}</label>
          <md-textarea v-model="exportWaitingListSignupEmailsResult"
                       id="export-waiting-list-signup-emails-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportEmailsDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showExportWaitingListSignupEmailsDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showExportWaitingListSignupPhoneNumbersDialog">
      <md-dialog-title>{{ $t('global.ExportPhoneNumbersFromWaitlist') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.PhoneNumbers') }}</label>
          <md-textarea v-model="exportWaitingListSignupPhoneNumbersResult"
                       id="export-waiting-list-signup-phone-numbers-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportPhoneDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button"
                   @click.prevent="showExportWaitingListSignupPhoneNumbersDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showExportLivestreamSignupEmailsDialog">
      <md-dialog-title>{{ $t('global.ExportEmailsFromLivestream') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.Emails') }}</label>
          <md-textarea v-model="exportLivestreamSignupEmailsResult"
                       id="export-livestream-signup-emails-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportEmailsDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" @click.prevent="showExportLivestreamSignupEmailsDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showExportLivestreamSignupPhoneNumbersDialog">
      <md-dialog-title>{{ $t('global.ExportPhonesFromLivestream') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.PhoneNumbers') }}</label>
          <md-textarea v-model="exportLivestreamSignupPhoneNumbersResult"
                       id="export-livestream-signup-phone-numbers-result"></md-textarea>
        </md-field>
        <p>
          {{ $t('global.ExportPhoneDesc') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button"
                   @click.prevent="showExportLivestreamSignupPhoneNumbersDialog = false">
          {{ $t('global.Close') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import YogoApi from '@/gateways/YogoApi';

import moment from 'moment';

import avatar from '../graphics/avatar';

import AutoFormatTime from '../auto-formatters/time';
import AutoFormatNumeric from '../auto-formatters/numeric';
import LoadingAnimation from './LoadingAnimation.vue';
import ClassEmails from './ClassForm/ClassEmails';
import Imgix from '@/services/Imgix';

const { required, numeric } = require('vuelidate/lib/validators');


export default {
  components: {
    ClassEmails,
    LoadingAnimation,
  },
  mixins: [Imgix],
  name: 'ClassForm',
  props: ['formType'],
  data() {
    return {

      saveLabel: this.formType === 'edit' ? this.$t('global.Save') : this.$t('global.CreateClass'),

      repeatClass: false,
      repeatClassIntervalFactor: 1,
      repeatClassIntervalUnit: 'week',
      repeatClassCount: 1,
      repeatClassEndDate: new Date(),

      showCreateClassesDialog: false,
      createClassesProgress: 0,

      showCancelClassDialog: false,

      form: {
        teachers: [],
        signups: [],
        waiting_list_signups: [],
        livestream: 'attendanceOnly',
        class_type_id: '',
        room_id: '',
      },
      loading: this.formType === 'edit',

      classTypes: [],
      teachers: [],
      rooms: [],

      showExportSignupEmailsDialog: false,
      showExportSignupPhoneNumbersDialog: false,
      selectedSignups: [],

      showExportWaitingListSignupEmailsDialog: false,
      showExportWaitingListSignupPhoneNumbersDialog: false,
      selectedWaitingListSignups: [],

      showExportLivestreamSignupEmailsDialog: false,
      showExportLivestreamSignupPhoneNumbersDialog: false,
      selectedLivestreamSignups: [],

      fromClass: null,
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
    pageTitle() {
      if (this.form.cancelled) {
        return this.$t('global.CLASSISCANCELLED');
      }
      return this.formType === 'edit' ? this.$t('global.EditClass') : this.$t('global.CreateClass');
    },
    adminCanChangeCheckinStatus() {
      return moment.tz(this.form.date, 'Europe/Copenhagen')
          .isSameOrAfter(moment.tz('Europe/Copenhagen'), 'day');
    },
    exportSignupEmailsResult() {
      const emails = _.map(this.selectedSignups, signup => signup.user.email);
      return emails.join(';');
    },
    exportSignupPhoneNumbersResult() {
      const phoneNumbers = _.compact(_.map(this.selectedSignups, signup => signup.user.phone));
      return phoneNumbers.join(',');
    },
    exportWaitingListSignupEmailsResult() {
      const emails = _.map(this.selectedWaitingListSignups, signup => signup.user.email);
      return emails.join(';');
    },
    exportWaitingListSignupPhoneNumbersResult() {
      const phoneNumbers = _.compact(_.map(this.selectedWaitingListSignups, signup => signup.user.phone));
      return phoneNumbers.join(',');
    },
    exportLivestreamSignupEmailsResult() {
      const emails = _.map(this.selectedLivestreamSignups, signup => signup.user.email);
      return emails.join(';');
    },
    exportLivestreamSignupPhoneNumbersResult() {
      const phoneNumbers = _.compact(_.map(this.selectedLivestreamSignups, signup => signup.user.phone));
      return phoneNumbers.join(',');
    },
  },
  methods: {
    async fetchClass() {
      const classItem = (await YogoApi.get('/classes' +
          '?id=' + this.$route.params.id +
          '&populate[]=signups.user.image' +
          '&populate[]=signups.used_membership.membership_type' +
          '&populate[]=signups.used_class_pass.class_pass_type' +
          '&populate[]=signups.no_show_fee' +
          '&populate[]=waiting_list_signups.user.image' +
          '&populate[]=livestream_signups.user.image' +
          '&populate[]=teachers' +
          '&populate[]=signup_count' +
          '&populate[]=livestream_signup_count' +
          '&populate[]=class_type' +
          '&populate[]=room' +
          '&populate[]=class_emails.instances.recipient',
      )).classes[0];
      if (classItem.teachers.length) {
        classItem.teachers = _.map(classItem.teachers, 'id');
      }

      if (!classItem.class_type_id) {
        classItem.class_type_id = classItem.class_type.id;
      }
      delete classItem.class_type;

      if (!classItem.room_id) {
        classItem.room_id = classItem.room ? classItem.room.id : null;
      }
      if (classItem.room) {
        delete classItem.room;
      }

      classItem.date = moment(classItem.date)
          .toDate();

      classItem.waiting_list_signups = _(classItem.waiting_list_signups)
          .sortBy('createdAt')
          .map((signup, idx) => _.assign(signup, { number_on_waiting_list: idx + 1 }))
          .value();

      if (classItem.studio_attendance_enabled) {
        classItem.livestream = classItem.livestream_enabled ? 'attendanceAndLivestream' : 'attendanceOnly';
      } else {
        classItem.livestream = 'livestreamOnly';
      }

      this.form = classItem;
      this.loading = false;
    },
    async loadSubFields() {

      [this.classTypes, this.teachers, this.rooms] = await Promise.all([
        YogoApi.get('/class-types?populate=image'),
        YogoApi.get('/users?teacher=1&populate=image'),
        YogoApi.get('/rooms?populate[]=branch'),
      ]);

      this.teachers = _.sortBy(this.teachers, ['first_name', 'last_name']);
      this.classTypes = _.sortBy(this.classTypes, 'name');
      this.rooms = _.sortBy(this.rooms, 'name');

    },
    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }


      let classData = _.pick(this.form, [
        'start_time',
        'end_time',
        'subtitle',
        'teachers',
        'seats',
      ]);
      classData.date = moment(this.form.date)
          .format('YYYY-MM-DD');
      classData.room = this.form.room_id;
      classData.class_type = this.form.class_type_id;

      if (this.client.settings.livestream_enabled) {
        switch (this.form.livestream) {
          case 'attendanceOnly':
            classData.studio_attendance_enabled = true;
            classData.livestream_enabled = false;
            break;
          case 'attendanceAndLivestream':
            classData.studio_attendance_enabled = true;
            classData.livestream_enabled = true;
            break;
          case 'livestreamOnly':
            classData.studio_attendance_enabled = false;
            classData.livestream_enabled = true;
            break;
        }
      }

      if (this.formType === 'edit') {
        await YogoApi.put('/classes/' + this.$route.params.id, classData);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.TheClassWasUpdated'),
        });
      }

      if (this.formType === 'add') {
        this.showCreateClassesDialog = true;
        this.createClassesProgress = 0;

        await YogoApi.post('/classes', classData);

        if (this.repeatClass) {
          const originClassDate = classData.date;
          for (let i = 1; i <= this.repeatClassCount; i++) {
            this.createClassesProgress = 100 / (this.repeatClassCount + 1) * i;
            classData.date = moment(originClassDate)
                .add(i * this.repeatClassIntervalFactor, this.repeatClassIntervalUnit)
                .format('YYYY-MM-DD');
            await YogoApi.post('/classes', classData);
          }
        }

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.TheClassHasBeenCreated'),
        });

      }

      this.$router.push({
        name: 'Classes',
        params: {
          date: classData.date,
        },
      });

    },

    classCanBeCancelled() {
      return !this.form.cancelled && moment(this.form.date, 'YYYY-MM-DD')
          .isSameOrAfter(moment(), 'day');
    },

    async cancelClass() {
      if (!this.classCanBeCancelled()) {
        this.$forceUpdate();
        return;
      }
      if (!confirm('Vil du aflyse klassen?\n\nDer bliver sendt email og sms til de tilmeldte kunder.\n\nHvis kunden har brugt klippekort til tilmeldingen, får de deres klip tilbage.')) return;
      this.showCancelClassDialog = true;
      await YogoApi.put('/classes/' + this.$route.params.id + '/cancel');

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: 'Klassen er aflyst',
      });

      this.$router.push({
        name: 'Classes',
        params: {
          date: moment(this.form.date)
              .startOf('isoWeek')
              .format('YYYY-MM-DD'),
        },
      });

    },

    classCanBeDeleted() {
      return this.form.cancelled || (!this.form.signup_count && !this.form.livestream_signup_count);
    },

    async deleteClass() {
      if (!confirm('Vil du slette denne klasse?')) return;

      try {

        await YogoApi.delete('/classes/' + this.$route.params.id);

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: 'Klassen er slettet',
        });

        this.$router.push({
          name: 'Classes',
          params: {
            date: moment(this.form.date)
                .startOf('isoWeek')
                .format('YYYY-MM-DD'),
          },
        });

      } catch (err) {
        if (err.response.data === 'E_CLASS_HAS_SIGNUPS') {
          alert('Klassen kan ikke slettes da der er kunder tilmeldt.');
          return;
        }
        if (err.response.data === 'E_CLASS_DOES_NOT_EXIST') {
          alert('Kunne ikke finde klassen.');
          return;
        }
        if (err.response.data === 'E_CLASS_HAS_BEEN_DELETED') {
          alert('Klassen er allerede slettet.');
          return;
        }
        console.log(err);
      }
    },

    async cancelNoShowFee(noShowFeeId) {
      if (!confirm(this.$t('global.AreYouSureYouWantToCancelNoShowFee'))) return;

      await YogoApi.post(`/no-show-fees/${noShowFeeId}/cancel`);
      this.fetchClass();
    },

    async reactivateNoShowFee(noShowFeeId) {
      if (!confirm(this.$t('global.AreYouSureYouWantToReactivateNoShowFee'))) return;

      await YogoApi.post(`/no-show-fees/${noShowFeeId}/reactivate`);
      this.fetchClass();
    },

    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },

    AutoFormatTime: AutoFormatTime,
    seatsBlur() {
      if (this.form.seats) {
        this.form.seats = AutoFormatNumeric(this.form.seats);
      }
    },
    dateDidChange() {
      if (!this.repeatClassCount) {
        return;
      }
      this.repeatClassEndDate = moment(this.form.date)
          .add(this.repeatClassCount * this.repeatClassIntervalFactor, this.repeatClassIntervalUnit)
          .toDate();
    },
    repeatClassDateDisabledDates(date) {
      if (!this.form.date) return true;
      date = moment(date);
      const formDate = moment(this.form.date);
      if (date.isSameOrBefore(formDate, 'day')) {
        return true;
      }
      switch (this.repeatClassIntervalUnit) {
        case 'day':
          return date.diff(formDate, 'day') % this.repeatClassIntervalFactor !== 0;
        case 'week':
          return date.diff(formDate, 'day') % (this.repeatClassIntervalFactor * 7) !== 0;
        case 'month':
          return (date.date() !== formDate.date() && date.date() < date.daysInMonth()) ||
              date.date() === date.daysInMonth() && date.date() > formDate.date() ||
              moment(date)
                  .startOf('month')
                  .diff(moment(formDate)
                      .startOf('month'), 'months') % this.repeatClassIntervalFactor !== 0;
      }
    },
    updateRepeatClassEndDate() {
      if (!this.form.date) {
        return;
      }
      this.repeatClassEndDate = moment(this.form.date)
          .add(this.repeatClassCount * this.repeatClassIntervalFactor, this.repeatClassIntervalUnit)
          .toDate();
    },
    updateRepeatClassCount() {
      if (!this.form.date || !this.repeatClassEndDate) {
        return;
      }
      switch (this.repeatClassIntervalUnit) {
        case 'day':
          this.repeatClassCount = moment(this.repeatClassEndDate)
              .diff(moment(this.form.date), 'day') / this.repeatClassIntervalFactor;
          break;
        case 'week':
          this.repeatClassCount = moment(this.repeatClassEndDate)
              .diff(moment(this.form.date), 'weeks') / this.repeatClassIntervalFactor;
          break;
        case 'month':
          this.repeatClassCount = moment(this.repeatClassEndDate)
              .startOf('month')
              .diff(moment(this.form.date)
                  .startOf('month'), 'months') / this.repeatClassIntervalFactor;
          break;
      }
    },
    getProfileImageSrc(user) {
      return user.image ? this.Imgix(user.image.filename, {
        w: 80,
        h: 80,
        fit: 'crop',
      }) : avatar;
    },
    async signupCheckCustomerIn(signup) {

      const signupTime = (new Date()).getTime();
      await YogoApi.put('/class-signups/' + signup.id, {
        checked_in: signupTime,
      });
      signup.checked_in = signupTime;
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: signup.user.first_name + ' ' + signup.user.last_name + ' er checked ind',
      });

    },
    async signupCancelCheckin(signup) {

      await YogoApi.put('/class-signups/' + signup.id, {
        checked_in: 0,
      });
      signup.checked_in = 0;
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: signup.user.first_name + ' ' + signup.user.last_name + ' er checked ud',
      });

    },
    onSignupSelect(items) {
      this.selectedSignups = items;
    },
    onWaitingListSignupSelect(items) {
      this.selectedWaitingListSignups = items;
    },
    onLivestreamSignupSelect(items) {
      this.selectedLivestreamSignups = items;
    },
    goBack() {
      this.$router.push({
        name: 'Classes',
        params: {
          date: moment(this.form.date)
              .format('YYYY-MM-DD'),
        },
      });
    },
  },
  async created() {
    await this.loadSubFields();
    if (this.formType === 'edit') this.fetchClass();
    if (this.$route.query.fromClass) {
      this.fromClass = await YogoApi.get('/classes/' + this.$route.query.fromClass +
          '?populate[]=class_type' +
          '&populate[]=teachers' +
          '&populate[]=room',
      );
      _.each([
        'subtitle',
        'start_time',
        'end_time',
        'seats',
        'studio_attendance_enabled',
        'livestream_enabled',
      ], property => {
        this.$set(this.form, property, this.fromClass[property]);
      });
      this.$set(this.form, 'date', moment(this.fromClass.date)
          .add(7, 'days')
          .toDate());
      if (this.fromClass.room) {
        this.$set(this.form, 'room_id', this.fromClass.room.id);
      }
      this.$set(this.form, 'class_type_id', this.fromClass.class_type.id);
      if (this.fromClass.teachers.length) {
        this.$set(this.form, 'teachers', _.map(this.fromClass.teachers, 'id'));
      }
      if (this.form.studio_attendance_enabled) {
        this.form.livestream = this.form.livestream_enabled ? 'attendanceAndLivestream' : 'attendanceOnly';
      } else {
        this.form.livestream = 'livestreamOnly';
      }
    }
  },
  watch: {
    repeatClassCount(newRepeatClassCount, oldRepeatClassCount) {
      if (newRepeatClassCount !== oldRepeatClassCount) {
        this.updateRepeatClassEndDate();
      }
    },
    repeatClassIntervalFactor(newRepeatClassIntervalFactor, oldRepeatClassIntervalFactor) {
      if (newRepeatClassIntervalFactor !== oldRepeatClassIntervalFactor) {
        this.updateRepeatClassEndDate();
      }
    },
    repeatClassIntervalUnit(newRepeatClassIntervalUnit, oldRepeatClassIntervalUnit) {
      if (newRepeatClassIntervalUnit !== oldRepeatClassIntervalUnit) {
        this.updateRepeatClassEndDate();
      }
    },
    repeatClassEndDate(newRepeatClassEndDate, oldRepeatClassEndDate) {
      if (newRepeatClassEndDate !== oldRepeatClassEndDate) {
        this.updateRepeatClassCount();
      }
    },

  },
  mounted() {
  },
  validations() {
    let v = {
      form: {
        date: {
          required,
        },
        start_time: {
          required,
        },
        end_time: {
          required,
        },
        class_type_id: {
          required,
        },
        seats: {
          required,
          numeric,
        },
      },
    };
    if (this.repeatClass) {
      v.repeatClassCount = {
        required,
        numeric,
      };
      v.repeatClassEndDate = {
        required,
      };
    }
    return v;

  },

};

</script>

<style lang="stylus" scoped>

.message-class-is-cancelled
  color $red

</style>

