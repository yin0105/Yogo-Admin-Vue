<template>

  <div>

    <LoadingAnimation v-if="loading"></LoadingAnimation>

    <div v-else>
      <div class="flex--100">
        <h2>{{ formType === 'edit' ? $t('global.Edit') : $t('global.Create') }} {{ $t('global.classTypeEmail') }}</h2>
      </div>

      <div class="flex--row">

        <div class="flex--50">

          <md-field>
            <label>{{ $t('global.Send') }}</label>
            <md-select v-model="form.send_at">
              <md-option value="signup">{{ $t('global.AtSignup') }}</md-option>
              <md-option value="cancel_booking">{{ $t('global.AtCancelBooking') }}</md-option>
              <md-option value="minutes_before_class">{{ $t('global.AtNumberOfMinutesBeforeClass') }}</md-option>
            </md-select>
          </md-field>

          <div class="flex--row" v-if="form.send_at === 'minutes_before_class'">
            <div class="flex--50">
              <label>{{ $t('global.TimeBeforeClass') }}</label>
              <HoursMinutesInput v-bind:minutes.sync="form.minutes_before_class"></HoursMinutesInput>
            </div>

            <div>
              <md-checkbox v-model="form.send_to_subsequent_signups">
                {{ $t('global.SendAutomaticallyToCustomersWhoSignUpLater') }}
              </md-checkbox>
            </div>

          </div>

          <div class="space4"></div>

          <div>
            <label>{{ $t('global.SendEmailTo') }}</label>
            <div>
              <md-checkbox v-model="form.send_to_signups">
                {{ client.settings.livestream_enabled ? $t('global.AttendeesStudio') : $t('global.Attendees') }}
              </md-checkbox>
              <md-checkbox v-model="form.send_to_livestream_signups" v-if="client.settings.livestream_enabled">
                {{ $t('global.AttendeesLivestream') }}
              </md-checkbox>
              <md-checkbox v-model="form.send_to_waiting_list" v-if="waitingListEnabled">{{
                  $t('global.Waitlist')
                }}
              </md-checkbox>
            </div>
            <span class="error" v-if="!$v.form.send_to_signups.sendToSomeone">{{
                $t('global.EmailMustBeSentToSomeone')
              }}</span>
          </div>

          <div class="space4"></div>


          <label>{{ $t('global.AppliesToClassTypes') }}</label>
          <!--<Treeselect
              v-model="form.class_types"
              :multiple="true"
              :options="treeSelectClassTypesOptions"
              :clearable="false"
              :defaultExpandLevel="1"
              value-consists-of="LEAF_PRIORITY"
          />-->
          <YogoTreeselectClassTypes v-model="form.class_types"></YogoTreeselectClassTypes>

          <div class="space4"></div>

          <md-field :class="getValidationClass('subject')">
            <label>{{ $t('global.Subject') }}</label>
            <md-input required v-model="form.subject"></md-input>
            <span class="md-error" v-if="!$v.form.subject.required">{{ $t('global.SubjectIsRequired') }}</span>
          </md-field>

          <md-field :class="getValidationClass('body')">
            <label>{{ $t('global.Message') }}</label>
            <md-textarea required v-model="form.body"></md-textarea>
            <span class="md-error" v-if="!$v.form.body.required">{{ $t('global.MessageIsRequired') }}</span>
          </md-field>
          {{ $t('global.FollowingCodes') }}: [first_name], [last_name], [customer_email], [customer_phone],
          [class_type], [class_date], [class_start_time], [studio_name], [studio_phone], [studio_email],
          [studio_website], [customer_profile_link]<span
            v-if="form.send_to_livestream_signups">, [livestream_link]</span>.

          <div class="space8"></div>


          <div class="space8"></div>

          <md-button class="md-raised md-primary" @click="submit">
            {{ $t('global.Save') }}
          </md-button>
          <md-button class="md-raised md-primary red" @click="deleteEmail"
                     v-if="formType === 'edit'">
            {{ $t('global.DeleteEmail') }}
          </md-button>
          <md-button class="md-raised"
                     @click="$router.push({name: 'SettingsEmail', params: {scrollTo: 'classTypeEmails'}})">
            {{ $t('global.Dismiss') }}
          </md-button>

        </div>

      </div>
    </div>

  </div>

</template>

<script>

import LoadingAnimation from './LoadingAnimation';
import YogoApi from '../gateways/YogoApi';
import dateTimeFunctions from '../mixins/dateTimeFunctions';
import Imgix from '../services/Imgix';
import { mapGetters } from 'vuex';
import HoursMinutesInput from '@/components/form/HoursMinutesInput';
import YogoTreeselectClassTypes from '@/components/ui/YogoTreeselectClassTypes';

const { required } = require('vuelidate/lib/validators');

export default {
  name: 'ClassEmailForm',
  components: {
    YogoTreeselectClassTypes,
    HoursMinutesInput,
    LoadingAnimation,
  },
  mixins: [dateTimeFunctions, Imgix],
  data() {
    return {
      loading: true,

      form: {
        subject: '',
        body: '',
        send_at: 'signup',
        minutes_before_class: 60,
        send_to_signups: true,
        send_to_livestream_signups: false,
        send_to_waiting_list: false,
        send_to_subsequent_signups: true,
      },

    };
  },

  computed: {
    ...mapGetters([
      'client',
    ]),

    formType() {
      return this.$route.params.id ? 'edit' : 'add';
    },

    waitingListEnabled() {
      return this.client.settings.private_class_waiting_list_enabled
          || this.client.settings.class_waiting_list_enabled;

    },

  },

  created() {
    this.fetchInfo();
  },

  methods: {

    async fetchInfo() {

      let email;
      if (this.formType === 'edit') {
        email = await YogoApi.get('/class-type-emails/' + this.$route.params.id + '?populate[]=class_types');

        this.form = _.pick(email, [
          'subject',
          'body',
          'send_at',
          'send_to_signups',
          'send_to_livestream_signups',
          'send_to_waiting_list',
          'minutes_before_class',
          'send_to_subsequent_signups',
        ]);

        this.form.class_types = _.map(email.class_types, 'id');

      }

      this.loading = false;
    },

    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const submitData = _.pick(
          this.form,
          [
            'class_types',
            'subject',
            'body',
            'send_at',
            'send_to_signups',
            'send_to_livestream_signups',
            'send_to_waiting_list',
            'minutes_before_class',
            'send_to_subsequent_signups',
          ],
      );

      this.loading = true;

      if (this.formType === 'edit') {
        await YogoApi.put('/class-type-emails/' + this.$route.params.id, submitData);
      } else {
        await YogoApi.post('/class-type-emails', submitData);
      }

      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.formType === 'edit' ? this.$t('global.TheEmailHasBeenUpdated') : this.$t('global.TheEmailHasBeenCreated'),
      });

      this.$router.push({
        name: 'SettingsEmail',
        params: { scrollTo: 'classTypeEmails' },
      });

    },

    async deleteEmail() {
      if (confirm('Vil du slette denne email?')) {
        const response = await YogoApi.delete('/class-type-emails/' + this.$route.params.id);

        if (response === 'E_COULD_NOT_DELETE_CLASS_TYPE_EMAIL') {
          alert('Emailen kunne ikke slettes.');
        } else {
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: 'Emailen blev slettet',
          });
        }

        this.$router.push({
          name: 'SettingsEmail',
          params: { scrollTo: 'classTypeEmails' },
        });
      }
    },

    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
      return {};
    },

  },
  validations: {
    form: {
      subject: {
        required,
      },
      body: {
        required,
      },
      send_to_signups: {
        sendToSomeone: function (value, vm) {
          return value || this.form.send_to_waiting_list.valueOf() || this.form.send_to_livestream_signups.valueOf();
        },
      },
    },
  },
};

</script>

<style lang="scss" scoped>

textarea {
  min-height: 200px;
}

.error {
  color: red;
}

</style>
