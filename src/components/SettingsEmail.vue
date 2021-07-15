<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Email') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else class="flex--50">

        <div class="flex flex--50 items-center justify-between">
          <h4>{{ $t('global.CopyOfEmails') }}</h4>
          <TooltipInfo :tooltipText="$t('global.CopyOfEmailsText')"></TooltipInfo>
        </div>

        <md-field class="flex--50" :class="getValidationClass('email_bcc_to_client_send_to')" md-clearable>
          <label>{{ $t('global.SendCopyTo') }}</label>
          <md-input type="email" v-model="form.email_bcc_to_client_send_to"></md-input>
          <span class="md-error" v-if="!$v.form.email_bcc_to_client_send_to.email">{{
              $t('global.MustBeAValidEmail')
            }}</span>
        </md-field>
        <p>{{ $t('global.SendCopyOf') }}</p>
        <div>
          <md-checkbox v-model="form.email_bcc_to_client_on_receipt">

            {{ $t('global.ReceiptForPurchase') }}
          </md-checkbox>
        </div>
        <div>
          <md-checkbox v-model="form.email_bcc_to_client_on_customer_cancel_or_resume_membership">
            {{ $t('global.CancellationResumptionTerminationOfMembership') }}
          </md-checkbox>
        </div>
        <div>
          <md-checkbox v-model="form.email_bcc_to_client_on_membership_renewal_failed">
            {{ $t('global.PaymentForMembershipFailed') }}
          </md-checkbox>
        </div>
        <div>
          <md-checkbox v-model="form.email_bcc_to_client_on_class_cancelled">
            {{ $t('global.CancellationOfClass') }}
          </md-checkbox>
        </div>
        <div>
          <md-checkbox v-model="form.email_bcc_to_client_on_customer_moved_from_waiting_list_to_class">
            {{ $t('global.CustomerOnWaitlistMovedToClass') }}
          </md-checkbox>
        </div>
        <div>
          <md-checkbox v-model="form.email_bcc_to_client_on_class_waiting_list_cancelled">
            {{ $t('global.WaitlistCancelledBecauseClassStartsSoon') }}
          </md-checkbox>
        </div>

      </div>

      <div class="mt2">
        <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
      </div>

      <div class="space8"></div>

      <hr>
      <div class="space4"></div>
      <h4>{{ $t('global.SystemEmails') }}</h4>
      <md-table v-model="emails" md-card>
        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell :md-label="$t('global.EmailType')">{{ item.header }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Subject')">{{ form[item.field + '_subject'] }}</md-table-cell>
          <md-table-cell>
            <md-button @click.prevent.stop="openEditDialog(item)">
              {{ $t('global.Edit') }}
            </md-button>
          </md-table-cell>
        </md-table-row>
      </md-table>

      <div class="space8"></div>

      <hr>

      <div id="classTypeEmails" class="space4"></div>
      <SettingsClassTypeEmails></SettingsClassTypeEmails>

    </div>

    <md-dialog :md-active.sync="showEditSystemEmailDialog" v-if="editSystemEmailDialogEmail"
               class="edit-system-email-dialog">
      <md-dialog-title>{{ $t('global.EditSystemEmail') }}</md-dialog-title>
      <md-dialog-content>
        <h4>{{ editSystemEmailDialogEmail.header }}</h4>
        <md-field>
          <label>Emne</label>
          <md-input v-model="form[editSystemEmailDialogEmail.field + '_subject']"></md-input>
        </md-field>
        <md-field>
          <label>Tekst</label>
          <md-textarea v-model="form[editSystemEmailDialogEmail.field + '_body']"></md-textarea>
        </md-field>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-raised" @click.prevent="showEditSystemEmailDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button class="md-raised md-primary" @click.prevent="saveEmail(editSystemEmailDialogEmail.field)">
          {{ $t('global.Save') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import _pick from 'lodash/pick';

import qs from 'qs';
import dateTimeFunctions from '@/mixins/dateTimeFunctions';
import TableCellMultiLine from '@/components/TableCellMultiLine';
import SettingsClassTypeEmails from '@/components/SettingsEmail/SettingsClassTypeEmails';
import TooltipInfo from './TooltipInfo';

const { required, email } = require('vuelidate/lib/validators');


export default {

  components: {
    SettingsClassTypeEmails,
    TableCellMultiLine,
    SettingsSubMenu,
    LoadingAnimation,
    TooltipInfo
  },

  mixins: [dateTimeFunctions],

  data() {
    return {
      loading: true,
      form: {},
      emails: [
        {
          header: this.$t('global.WelcomeToNewCustomer'),
          field: 'email_welcome',
        },
        {
          header: this.$t('global.ForgotPassword'),
          field: 'email_customer_reset_password',
        },
        {
          header: this.$t('global.ReceiptForPurchase'),
          field: 'email_receipt',
        },
        {
          header: this.$t('global.ClassCancelled'),
          field: 'email_customer_your_class_has_been_cancelled',
        },
        {
          header: this.$t('global.ClassCancelledEmailForPeopleOnWaitlist'),
          field: 'email_your_waiting_list_class_has_been_cancelled',
        },
        {
          header: this.$t('global.CustomerOnWaitlistMovedToClass'),
          field: 'email_class_waiting_list_customer_moved_from_waiting_list_to_signup',
        },
        {
          header: this.$t('global.WaitlistCancelledBecauseClassStartsSoon'),
          field: 'email_class_waiting_list_purged_customer_did_not_get_seat',
        },
      ],
      dataFieldNames: [
        'email_bcc_to_client_send_to',
        'email_bcc_to_client_on_receipt',
        'email_bcc_to_client_on_class_cancelled',
        'email_bcc_to_client_on_customer_cancel_or_resume_membership',
        'email_bcc_to_client_on_customer_moved_from_waiting_list_to_class',
        'email_bcc_to_client_on_class_waiting_list_cancelled',
        'email_bcc_to_client_on_membership_renewal_failed',
      ],
      editSystemEmailDialogEmail: null,
      showEditSystemEmailDialog: false,
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  async created() {
    const settingKeys = _.concat(
        this.dataFieldNames,
        _.chain(this.emails)
            .map('field')
            .map(field => [field + '_subject', field + '_body'])
            .flatten()
            .value(),
    );
    this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings?' + qs.stringify({ keys: settingKeys }),
    );

    this.loading = false;
    if (this.$route.params && this.$route.params.scrollTo) {
      setTimeout(() => {
        document.querySelector('#' + this.$route.params.scrollTo)
            .scrollIntoView({
              block: 'start',
              inline: 'start',
            });
      }, 100);
    }
  },
  methods: {
    async submit() {

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      this.loading = true;
      const submitData = _pick(
          this.form,
          this.dataFieldNames,
      );
      await YogoApi.put('/clients/' + this.client.id + '/settings', submitData);
      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.SettingsHasBeenUpdated'),
      });

    },
    getValidationClass(fieldName) {

      const field = this.$v.form[fieldName];

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },
    openEditDialog(email) {
      this.editSystemEmailDialogEmail = email;
      this.showEditSystemEmailDialog = true;
    },
    async saveEmail(field) {
      const submitData = {};
      submitData[field + '_subject'] = this.form[field + '_subject'];
      submitData[field + '_body'] = this.form[field + '_body'];

      await YogoApi.put('/clients/' + this.client.id + '/settings', submitData);
      this.loading = false;

      this.showEditSystemEmailDialog = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.TheEmailHasBeenUpdated'),
      });

    },


  },

  validations: {
    form: {
      email_bcc_to_client_send_to: {
        email,
      },
    },

  },

};

</script>

<style lang="scss" scoped>

.md-field textarea.md-textarea {
  height: 250px;
  max-height: none;
}

@media screen and (min-width: 1024px) {

  .edit-system-email-dialog {
    min-width: 768px;
  }

}

</style>
