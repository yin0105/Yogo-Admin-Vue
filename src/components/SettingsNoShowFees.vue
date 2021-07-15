<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.NoShowFees') }} <span @click.prevent.stop="showInfoDialog = true" style="cursor:pointer;"> <md-icon>info</md-icon></span>
      </h2>

      <loading-animation v-if="loading"/>

      <div v-else>

        <div>
          <md-checkbox v-model="form.no_show_fees_enabled">{{ $t('global.EnableNoShowFees') }}</md-checkbox>
        </div>

        <div v-if="form.no_show_fees_enabled">
          <md-field class="flex--50">
            <label>{{ $t('global.NoShowFeesNeedAdminApproval') }}</label>
            <md-select v-model="form.no_show_fees_apply_method">
              <md-option value="auto">{{ $t('global.Automatically') }}</md-option>
              <md-option value="manual">{{ $t('global.AfterAdminApproval') }}</md-option>
            </md-select>
          </md-field>

          <md-field class="flex--50">
            <label>{{ $t('global.NoShowFeesAndLateCancelFeesAre') }}</label>
            <md-select v-model="form.no_show_fees_and_late_cancel_fees_are_different">
              <md-option :value="0">{{ $t('global.TheSame_Plural') }}</md-option>
              <md-option :value="1">{{ $t('global.Different_Plural') }}</md-option>
            </md-select>
          </md-field>

          <div class="flex--row">

            <md-field class="flex--50"
                      :class="getValidationClass('form.no_show_membership_fee_amount')">
              <label v-if="form.no_show_fees_and_late_cancel_fees_are_different">
                {{ $t('global.FeeAmountMembershipsNoShow') }}
              </label>
              <label v-else>{{ $t('global.FeeAmountMemberships') }}</label>
              <md-input v-model="form.no_show_membership_fee_amount"
                        type="number" required></md-input>
              <span
                  class="md-error"
                  v-if="!$v.form.no_show_membership_fee_amount.required"
              >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
            </md-field>

            <md-field class="flex--50"
                      v-if="form.no_show_fees_and_late_cancel_fees_are_different"
                      :class="getValidationClass('form.late_cancel_membership_fee_amount')">
              <label>{{ $t('global.FeeAmountMembershipsLateCancel') }}</label>
              <md-input v-model="form.late_cancel_membership_fee_amount"
                        type="number" required></md-input>
              <span
                  class="md-error"
                  v-if="!$v.form.late_cancel_membership_fee_amount.required"
              >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
            </md-field>

          </div>


          <div class="flex--row">


            <md-field class="flex--50"
                      :class="getValidationClass('form.no_show_time_based_class_pass_deduct_number_of_days')">
              <label v-if="form.no_show_fees_and_late_cancel_fees_are_different">
                {{ $t('global.DeductNumberOfDaysFromTimeBasedClassPassNoShow') }}
              </label>
              <label v-else>{{ $t('global.DeductNumberOfDaysFromTimeBasedClassPass') }}</label>
              <md-input type="number" v-model="form.no_show_time_based_class_pass_deduct_number_of_days"
                        required></md-input>
              <span
                  class="md-error"
                  v-if="!$v.form.no_show_time_based_class_pass_deduct_number_of_days.required"
              >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
            </md-field>

            <md-field class="flex--50"
                      v-if="form.no_show_fees_and_late_cancel_fees_are_different"
                      :class="getValidationClass('form.late_cancel_time_based_class_pass_deduct_number_of_days')">
              <label>{{ $t('global.DeductNumberOfDaysFromTimeBasedClassPassLateCancel') }}</label>
              <md-input type="number" v-model="form.late_cancel_time_based_class_pass_deduct_number_of_days"
                        required></md-input>
              <span
                  class="md-error"
                  v-if="!$v.form.late_cancel_time_based_class_pass_deduct_number_of_days.required"
              >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
            </md-field>

          </div>

          <div class="flex--25"
               :class="getValidationClass('form.class_signoff_deadline')">
            <label>{{ $t('global.CancellationDeadlineForClasses') }}*</label>
            <HoursMinutesInput :minutes.sync="form.class_signoff_deadline"></HoursMinutesInput>
            <span
                class="md-error"
                v-if="!$v.form.class_signoff_deadline.required"
            >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
          </div>

          <div class="flex--25"
               :class="getValidationClass('form.private_class_signoff_deadline')">
            <label>{{ $t('global.CancellationDeadlineForPrivateClasses') }}*</label>
            <HoursMinutesInput :minutes.sync="form.private_class_signoff_deadline"></HoursMinutesInput>
            <span
                class="md-error"
                v-if="!$v.form.private_class_signoff_deadline.required"
            >
              {{ $t('global.ThisFieldIsRequired') }}
            </span>
          </div>

          <div>
            <md-checkbox v-model="form.no_show_fees_send_emails_on_apply_and_cancel">
              {{ $t('global.SendEmailToCustomerOnFeeApplyOrCancel') }}
            </md-checkbox>
          </div>

          <div v-if="form.no_show_fees_send_emails_on_apply_and_cancel"
               :class="{'flex--50': !form.no_show_fees_and_late_cancel_fees_are_different}"
          >
            <CardDropdownWithIconAndText
                v-for="(titleKey, partialSettingsKey) in {
                  fee_applied_membership: 'FeeAppliedToMembership',
                  fee_cancelled_membership: 'FeeCancelledForMembership',
                  fee_applied_time_based_class_pass: 'FeeAppliedToTimeBasedClassPass',
                  fee_cancelled_time_based_class_pass: 'FeeCancelledForTimeBasedClassPass',
                  fee_applied_fixed_count_class_pass: 'FeeAppliedToFixedCountClassPass',
                  fee_cancelled_fixed_count_class_pass: 'FeeCancelledForFixedCountClassPass',
                }">
              <template v-slot:icon-and-title>
                <md-icon>email</md-icon>
                {{ $t('global.' + titleKey) }}
              </template>

              <div class="flex--row">
                <div :class="{
                  'flex--50': form.no_show_fees_and_late_cancel_fees_are_different,
                'w-full': !form.no_show_fees_and_late_cancel_fees_are_different
                }">
                  <md-field :class="getValidationClass('form.email_no_show_' + partialSettingsKey + '_subject')">
                    <label>{{ $t(form.no_show_fees_and_late_cancel_fees_are_different ? 'global.SubjectNoShow' : 'global.Subject') }}</label>
                    <md-input type="text" v-model="form['email_no_show_' + partialSettingsKey + '_subject']"
                              required></md-input>
                    <span
                        class="md-error"
                        v-if="!$v.form['email_no_show_' + partialSettingsKey+ '_subject'].required"
                    >
                      {{ $t('global.SubjectIsRequired') }}
                    </span>
                  </md-field>

                  <md-field :class="getValidationClass('form.email_no_show_' + partialSettingsKey + '_body')">
                    <label>{{ $t(form.no_show_fees_and_late_cancel_fees_are_different ? 'global.MessageNoShow' : 'global.Message') }}</label>
                    <md-textarea v-model="form['email_no_show_' + partialSettingsKey + '_body']" required></md-textarea>
                    <span
                        class="md-error"
                        v-if="!$v.form['email_no_show_' + partialSettingsKey + '_body'].required"
                    >
                      {{ $t('global.MessageIsRequired') }}
                    </span>
                  </md-field>
                </div>
                <div
                    class="flex--50" v-if="form.no_show_fees_and_late_cancel_fees_are_different">
                  <md-field :class="getValidationClass(`form.email_late_cancel_${partialSettingsKey}_subject`)">
                    <label>{{ $t('global.SubjectLateCancel') }}</label>
                    <md-input type="text" v-model="form[`email_late_cancel_${partialSettingsKey}_subject`]"
                              required></md-input>
                    <span
                        class="md-error"
                        v-if="!$v.form['email_late_cancel_' + partialSettingsKey+ '_subject'].required"
                    >
                      {{ $t('global.SubjectIsRequired') }}
                    </span>
                  </md-field>

                  <md-field :class="getValidationClass('form.email_late_cancel_' + partialSettingsKey + '_body')">
                    <label>{{ $t('global.MessageLateCancel') }}</label>
                    <md-textarea v-model="form['email_late_cancel_' + partialSettingsKey + '_body']"
                                 required></md-textarea>
                    <span
                        class="md-error"
                        v-if="!$v.form['email_late_cancel_' + partialSettingsKey + '_body'].required"
                    >
                      {{ $t('global.MessageIsRequired') }}
                    </span>
                  </md-field>


                </div>
              </div>

            </CardDropdownWithIconAndText>

            <!--<CardDropdownWithIconAndText>
              <template v-slot:icon-and-title>
                <md-icon>email</md-icon>
                {{ $t('global.FeeCancelledForMembership') }}
              </template>

              <md-field :class="getValidationClass('form.email_no_show_fee_cancelled_membership_subject')">
                <label>{{ $t('global.Subject') }}</label>
                <md-input type="text" v-model="form.email_no_show_fee_cancelled_membership_subject" required></md-input>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_cancelled_membership_subject.required"
                >
              {{ $t('global.SubjectIsRequired') }}
            </span>
              </md-field>

              <md-field :class="getValidationClass('form.email_no_show_fee_cancelled_membership_body')">
                <label>{{ $t('global.Message') }}</label>
                <md-textarea v-model="form.email_no_show_fee_cancelled_membership_body" required></md-textarea>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_cancelled_membership_body.required"
                >
              {{ $t('global.MessageIsRequired') }}
            </span>
              </md-field>
            </CardDropdownWithIconAndText>

            <CardDropdownWithIconAndText>
              <template v-slot:icon-and-title>
                <md-icon>email</md-icon>
                {{ $t('global.FeeAppliedToTimeBasedClassPass') }}
              </template>

              <md-field :class="getValidationClass('form.email_no_show_fee_applied_time_based_class_pass_subject')">
                <label>{{ $t('global.Subject') }}</label>
                <md-input type="text" v-model="form.email_no_show_fee_applied_time_based_class_pass_subject"
                          required></md-input>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_applied_time_based_class_pass_subject.required"
                >
              {{ $t('global.SubjectIsRequired') }}
            </span>
              </md-field>

              <md-field :class="getValidationClass('form.email_no_show_fee_applied_time_based_class_pass_body')">
                <label>{{ $t('global.Message') }}</label>
                <md-textarea v-model="form.email_no_show_fee_applied_time_based_class_pass_body" required></md-textarea>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_applied_time_based_class_pass_body.required"
                >
              {{ $t('global.MessageIsRequired') }}
            </span>
              </md-field>
            </CardDropdownWithIconAndText>

            <CardDropdownWithIconAndText>
              <template v-slot:icon-and-title>
                <md-icon>email</md-icon>
                {{ $t('global.FeeCancelledForTimeBasedClassPass') }}
              </template>

              <md-field :class="getValidationClass('form.email_no_show_fee_cancelled_time_based_class_pass_subject')">
                <label>{{ $t('global.Subject') }}</label>
                <md-input type="text" v-model="form.email_no_show_fee_cancelled_time_based_class_pass_subject"
                          required></md-input>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_cancelled_time_based_class_pass_subject.required"
                >
              {{ $t('global.SubjectIsRequired') }}
            </span>
              </md-field>

              <md-field :class="getValidationClass('form.email_no_show_fee_cancelled_time_based_class_pass_body')">
                <label>{{ $t('global.Message') }}</label>
                <md-textarea v-model="form.email_no_show_fee_cancelled_time_based_class_pass_body"
                             required></md-textarea>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_cancelled_time_based_class_pass_body.required"
                >
              {{ $t('global.MessageIsRequired') }}
            </span>
              </md-field>
            </CardDropdownWithIconAndText>


            <CardDropdownWithIconAndText>
              <template v-slot:icon-and-title>
                <md-icon>email</md-icon>
                {{ $t('global.FeeAppliedToFixedCountClassPass') }}
              </template>

              <md-field :class="getValidationClass('form.email_no_show_fee_applied_fixed_count_class_pass_subject')">
                <label>{{ $t('global.Subject') }}</label>
                <md-input type="text" v-model="form.email_no_show_fee_applied_fixed_count_class_pass_subject"
                          required></md-input>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_applied_fixed_count_class_pass_subject.required"
                >
              {{ $t('global.SubjectIsRequired') }}
            </span>
              </md-field>

              <md-field :class="getValidationClass('form.email_no_show_fee_applied_fixed_count_class_pass_body')">
                <label>{{ $t('global.Message') }}</label>
                <md-textarea v-model="form.email_no_show_fee_applied_fixed_count_class_pass_body"
                             required></md-textarea>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_applied_fixed_count_class_pass_body.required"
                >
              {{ $t('global.MessageIsRequired') }}
            </span>
              </md-field>
            </CardDropdownWithIconAndText>

            <CardDropdownWithIconAndText>
              <template v-slot:icon-and-title>
                <md-icon>email</md-icon>
                {{ $t('global.FeeCancelledForFixedCountClassPass') }}
              </template>

              <md-field :class="getValidationClass('form.email_no_show_fee_cancelled_fixed_count_class_pass_subject')">
                <label>{{ $t('global.Subject') }}</label>
                <md-input type="text" v-model="form.email_no_show_fee_cancelled_fixed_count_class_pass_subject"
                          required></md-input>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_cancelled_fixed_count_class_pass_subject.required"
                >
              {{ $t('global.SubjectIsRequired') }}
            </span>
              </md-field>

              <md-field :class="getValidationClass('form.email_no_show_fee_cancelled_fixed_count_class_pass_body')">
                <label>{{ $t('global.Message') }}</label>
                <md-textarea v-model="form.email_no_show_fee_cancelled_fixed_count_class_pass_body"
                             required></md-textarea>
                <span
                    class="md-error"
                    v-if="!$v.form.email_no_show_fee_cancelled_fixed_count_class_pass_body.required"
                >
              {{ $t('global.MessageIsRequired') }}
            </span>
              </md-field>
            </CardDropdownWithIconAndText>-->
          </div>

        </div>
        <md-button class="md-raised md-primary" @click="submitButtonClick">{{ $t('global.Save') }}</md-button>

      </div>

    </div>

    <md-dialog :md-active.sync="showInfoDialog">
      <md-dialog-title>{{ $t('global.NoShowFees') }}</md-dialog-title>
      <md-dialog-content>
        <p>
          {{ $t('global.NoShowFeesExplanation1') }}
        </p>
        <p>
          {{ $t('global.NoShowFeesExplanation2') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-raised" @click="showInfoDialog = false">
          {{ $t('global.Ok') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showWarningDialog">
      <md-dialog-title>{{ $t('global.NoShowFeesActivationWarningTitle') }}</md-dialog-title>
      <md-dialog-content>
        <p>
          {{ $t('global.NoShowFeesActivationWarningBody') }}
        </p>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-raised" @click="showWarningDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button class="md-raised md-primary" @click="submit">
          {{ $t('global.EnableNoShowFees') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>

</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';
import HoursMinutesInput from '@/components/form/HoursMinutesInput';

import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import qs from 'qs';
import CustomerHistoryItem from '@/components/CardDropdownWithIconAndText';
import CardDropdownWithIconAndText from '@/components/CardDropdownWithIconAndText';

const { required } = require('vuelidate/lib/validators');
const settingsKeys = [
  'no_show_fees_enabled',
  'no_show_fees_apply_method',
  'no_show_fees_and_late_cancel_fees_are_different',
  'no_show_membership_fee_amount',
  'late_cancel_membership_fee_amount',
  'no_show_time_based_class_pass_deduct_number_of_days',
  'late_cancel_time_based_class_pass_deduct_number_of_days',
  'class_signoff_deadline',
  'private_class_signoff_deadline',
  'no_show_fees_send_emails_on_apply_and_cancel',
  'email_no_show_fee_applied_membership_subject',
  'email_no_show_fee_applied_membership_body',
  'email_no_show_fee_cancelled_membership_subject',
  'email_no_show_fee_cancelled_membership_body',
  'email_no_show_fee_applied_time_based_class_pass_subject',
  'email_no_show_fee_applied_time_based_class_pass_body',
  'email_no_show_fee_cancelled_time_based_class_pass_subject',
  'email_no_show_fee_cancelled_time_based_class_pass_body',
  'email_no_show_fee_applied_fixed_count_class_pass_subject',
  'email_no_show_fee_applied_fixed_count_class_pass_body',
  'email_no_show_fee_cancelled_fixed_count_class_pass_subject',
  'email_no_show_fee_cancelled_fixed_count_class_pass_body',
  'email_late_cancel_fee_applied_membership_subject',
  'email_late_cancel_fee_applied_membership_body',
  'email_late_cancel_fee_cancelled_membership_subject',
  'email_late_cancel_fee_cancelled_membership_body',
  'email_late_cancel_fee_applied_time_based_class_pass_subject',
  'email_late_cancel_fee_applied_time_based_class_pass_body',
  'email_late_cancel_fee_cancelled_time_based_class_pass_subject',
  'email_late_cancel_fee_cancelled_time_based_class_pass_body',
  'email_late_cancel_fee_applied_fixed_count_class_pass_subject',
  'email_late_cancel_fee_applied_fixed_count_class_pass_body',
  'email_late_cancel_fee_cancelled_fixed_count_class_pass_subject',
  'email_late_cancel_fee_cancelled_fixed_count_class_pass_body',
];

export default {
  name: 'SettingsNoShowFees',
  components: {
    CardDropdownWithIconAndText,
    CustomerHistoryItem,
    LoadingAnimation,
    SettingsSubMenu,
    HoursMinutesInput,
  },
  data() {
    return {
      loading: true,
      form: {
        no_show_fees_enabled: false,
      },
      feesEnabledOriginalSetting: false,

      showInfoDialog: false,
      showWarningDialog: false,

    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  async created() {
    await this.getSettings();
    this.loading = false;
  },
  methods: {

    async getSettings() {
      const queryParams = {
        keys: settingsKeys,
      };
      const queryString = qs.stringify(queryParams, { arrayFormat: 'brackets' });
      this.form = await YogoApi.get(
          `/clients/${this.client.id}/settings?${queryString}`,
      );
      this.feesEnabledOriginalSetting = this.form.no_show_fees_enabled;
      this.form.no_show_fees_and_late_cancel_fees_are_different =
          this.form.no_show_fees_and_late_cancel_fees_are_different ? 1 : 0;
    },

    async submitButtonClick() {
      if (this.form.no_show_fees_enabled && !this.feesEnabledOriginalSetting) {
        this.showWarningDialog = true;
        return;
      }
      this.submit();
    },

    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      this.loading = true;
      const submitData = _.pick(
          this.form,
          settingsKeys,
      );
      submitData.no_show_fees_and_late_cancel_fees_are_different = !!submitData.no_show_fees_and_late_cancel_fees_are_different;
      await YogoApi.put(`/clients/${this.client.id}/settings`, submitData);

      this.loading = false;

      this.showWarningDialog = false;
      this.feesEnabledOriginalSetting = this.form.no_show_fees_enabled;

      submitData.no_show_fees_and_late_cancel_fees_are_different =
          !!submitData.no_show_fees_and_late_cancel_fees_are_different;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.SettingsHasBeenUpdated'),
      });

    },
    getValidationClass(fieldPath) {

      const field = _.get(this.$v, fieldPath);

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },
  },

  validations() {
    const v = {
      form: {
        no_show_membership_fee_amount: { required },
        no_show_time_based_class_pass_deduct_number_of_days: { required },
        class_signoff_deadline: { required },
        private_class_signoff_deadline: { required },
        email_no_show_fee_applied_membership_subject: { required },
        email_no_show_fee_applied_membership_body: { required },
        email_no_show_fee_cancelled_membership_subject: { required },
        email_no_show_fee_cancelled_membership_body: { required },
        email_no_show_fee_applied_time_based_class_pass_subject: { required },
        email_no_show_fee_applied_time_based_class_pass_body: { required },
        email_no_show_fee_cancelled_time_based_class_pass_subject: { required },
        email_no_show_fee_cancelled_time_based_class_pass_body: { required },
        email_no_show_fee_applied_fixed_count_class_pass_subject: { required },
        email_no_show_fee_applied_fixed_count_class_pass_body: { required },
        email_no_show_fee_cancelled_fixed_count_class_pass_subject: { required },
        email_no_show_fee_cancelled_fixed_count_class_pass_body: { required },
      },
    };
    if (this.form.no_show_fees_and_late_cancel_fees_are_different) {
      v.form = {
        ...v.form,
        late_cancel_membership_fee_amount: { required },
        late_cancel_time_based_class_pass_deduct_number_of_days: { required },
        email_late_cancel_fee_applied_membership_subject: { required },
        email_late_cancel_fee_applied_membership_body: { required },
        email_late_cancel_fee_cancelled_membership_subject: { required },
        email_late_cancel_fee_cancelled_membership_body: { required },
        email_late_cancel_fee_applied_time_based_class_pass_subject: { required },
        email_late_cancel_fee_applied_time_based_class_pass_body: { required },
        email_late_cancel_fee_cancelled_time_based_class_pass_subject: { required },
        email_late_cancel_fee_cancelled_time_based_class_pass_body: { required },
        email_late_cancel_fee_applied_fixed_count_class_pass_subject: { required },
        email_late_cancel_fee_applied_fixed_count_class_pass_body: { required },
        email_late_cancel_fee_cancelled_fixed_count_class_pass_subject: { required },
        email_late_cancel_fee_cancelled_fixed_count_class_pass_body: { required },
      };

    }
    return v;
  },
};

</script>
