<template>
  <div>
    <div class="space8"></div>
    <h2>Emails</h2>
    <div>
      <div class="flex--25">
        <label>
          Salg, dvs aktive kunder (Reports->Sales->Sales Report)
        </label>
        <input type="file" @change="salesReportChanged">
      </div>


      <md-button class="md-raised md-primary" @click="sendWelcomeSetPasswordEmailsToCustomers">
        Send emails til kunder
        med link til at sætte adgangskode
      </md-button>
      <md-checkbox v-model="sendOnlyToActiveCustomers">Send kun til aktive kunder</md-checkbox>
      <md-checkbox v-model="sendOnlyToActiveMboClientIds"
                   v-if="activeMboClientIds.length && !sendOnlyToActiveCustomers">Send kun til kunder med
        specificeret MBO ID ({{ activeMboClientIds.length }})
      </md-checkbox>
      <div>
        <md-checkbox v-model="sendOnlyToSpecificEmails">Send kun til specifikke emails<span v-if="specificEmails.length && specificEmails[0] !== ''"> ({{ specificEmails.length }} emails)</span></md-checkbox>
        <md-textarea class="specific-emails" v-model="specificEmailsTextarea" v-if="sendOnlyToSpecificEmails"></md-textarea>
      </div>

    </div>

    <table v-if="resetPasswordCustomers.length">
      <tr>
        <th>Kunde</th>
        <th>Email</th>
        <th>Email sendt</th>
      </tr>
      <tr v-for="customer in resetPasswordCustomers">
        <td>{{ customer.first_name }} {{ customer.last_name }}</td>
        <td>{{ customer.email }}</td>
        <td>
          <md-icon v-if="customer.email_sent">done</md-icon>
          <md-icon v-else-if="customer.sending_email">email</md-icon>
          <span v-else>{{ customer.apiResponse }}</span>
        </td>
      </tr>
    </table>
  </div>

</template>

<script>

import YogoApi from '../../gateways/YogoApi';
import qs from 'qs';
import ImportMixins from '@/components/Import/ImportMixins';

export default {
  name: 'ImportWelcomeEmails',
  mixins: [ImportMixins],
  data() {
    return {
      resetPasswordCustomers: [],
      sendOnlyToActiveCustomers: false,
      sendOnlyToActiveMboClientIds: false,

      sendOnlyToSpecificEmails: false,
      specificEmailsTextarea: '',

      activeMboClientIds: [],
    };
  },
  computed: {
    specificEmails() {
      return this.specificEmailsTextarea.split('\n');
    }
  },
  methods: {
    async salesReportChanged(event) {

      this.activeMboClientIds = _.chain(await this.readExcelFile(event.target.files[0]))
          .map('Client ID')
          .uniq()
          .value();

    },
    async sendWelcomeSetPasswordEmailsToCustomers() {

      const confirmText = this.sendOnlyToActiveCustomers
          ? 'Er du sikker på at du vil nulstille adgangskoder for alle aktive kunder i systemet, dvs kunder med adgangskort, medlemskab og/eller tilmeldinger? Folk der allerede har en adgangskode, får ikke nogen mail.'
          : (
              this.sendOnlyToActiveMboClientIds
                  ? 'Er du sikker på at du vil nulstille adgangskoder for alle kunder på MBO Sales Report-listen? Folk der allerede har en adgangskode, får ikke nogen mail.'
                  : 'Er du sikker på at du vil nulstille adgangskoder for alle kunder i systemet? Folk der allerede har en adgangskode, får ikke nogen mail.'
          );

      if (!confirm(confirmText)) return;

      const queryParams = {
        customer: 1,
      };

      if (this.sendOnlyToActiveCustomers) {
        queryParams.populate = [
          'memberships',
          'class_passes',
          'class_signups',
          'event_signups',
          'class_waiting_list_signups',
          'class_livestream_signups',
        ];
      }

      const queryString = qs.stringify(queryParams);
      this.resetPasswordCustomers = (
          await YogoApi.get(`/users?${queryString}`)
      )
          .filter(customer => !customer.admin && !customer.import_welcome_set_password_email_sent);

      console.log('All customers: ' + this.resetPasswordCustomers.length);

      if (this.sendOnlyToActiveCustomers) {
        this.resetPasswordCustomers = _.filter(
            this.resetPasswordCustomers,
            c => c.memberships.length
                || c.class_passes.length
                || c.class_signups.length
                || c.class_waiting_list_signups.length
                || c.class_livestream_signups.length
                || c.event_signups.length,
        );
      }

      if (this.sendOnlyToActiveMboClientIds) {
        this.resetPasswordCustomers = _.filter(
            this.resetPasswordCustomers,
            c => _.includes(this.activeMboClientIds, c.id_in_previous_booking_system),
        );
      }

      if (this.sendOnlyToSpecificEmails) {
        this.resetPasswordCustomers = _.filter(
            this.resetPasswordCustomers,
            c => _.includes(this.specificEmails, c.email),
        );
      }

      console.log('Active customers: ' + this.resetPasswordCustomers.length);

      for (let i = 0; i < this.resetPasswordCustomers.length; i++) {
        const customer = this.resetPasswordCustomers[i];
        customer.sending_email = true;
        const response = await YogoApi.post(
            '/import/welcome-customer-reset-password',
            {
              id: customer.id,
            },
        );
        customer.sending_email = false;
        if (response.length) {
          customer.apiResponse = response;
        } else {
          customer.email_sent = true;
        }
        this.$forceUpdate();
      }

      alert(
          'Færdig med at nulstille adgangskoder og sende emails.\n' +
          this.resetPasswordCustomers.length + ' kunder behandlet.',
      );

    },
  },
};

</script>

<style lang="scss" scoped>

.specific-emails {
  width:350px;
  height:300px;
}

table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid black;
  padding: 1px 4px;
  text-align: left;
}

</style>
