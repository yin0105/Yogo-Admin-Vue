<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Import fra Conventus</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--row">
          <div class="flex--20">
            <label>Kunder (Adressebog->Rapport, tilføj id og by og Eksporter)</label>
            <input type="file" @change="customersFileChanged">
          </div>

          <div class="flex--20">
            <label>Kreditkort-transaktioner (Finans->Betalingskort)</label>
            <input type="file" @change="creditCardFileChanged">
          </div>

        </div>

        <table v-if="showMembershipMapping" class="mapping-table flex--50">
          <tr colspan="2">Adgangstyper</tr>
          <tr>
            <th>Conventus</th>
            <th>Yogo</th>
          </tr>
          <tr v-for="row in membershipMapping"
              :class="{'awaiting-selection': !row.yogoId}">
            <td>{{ row.conventusMembershipTypeName }}</td>
            <td>
              <select v-model="row.yogoId">
                <option :value="null">-- ikke angivet --</option>
                <optgroup label="Medlemskaber">
                  <option v-for="yogoMembershipType in yogoMembershipTypes"
                          :value="'membership_type_'+ yogoMembershipType.id">
                    {{ yogoMembershipType.name }}
                  </option>
                  <option value="membership_type_x">Kundens medlemskab, uanset type</option>
                </optgroup>
                <optgroup label="Adgangskort">
                  <option v-for="yogoClassPassType in yogoClassPassTypes"
                          :value="'class_pass_type_' + yogoClassPassType.id">
                    {{ yogoClassPassType.name }}
                  </option>
                </optgroup>
                <optgroup label="Events">
                  <option v-for="yogoEvent in yogoEvents" :value="'event_' + yogoEvent.id">
                    {{ yogoEvent.name }}
                  </option>
                </optgroup>
              </select>
            </td>
          </tr>
        </table>

        <button v-if="showMembershipMapping" type="button" @click="saveMembershipMapping">Save pricing
          options
        </button>
        <button v-if="showMembershipMapping" type="button" @click="loadMembershipMapping">Load pricing
          options
        </button>

        <div class="space4"></div>

        <ImportCustomerList
            :customer-list="customerList"
            :email-duplicates="emailDuplicates"
            :selected-customers="selectedCustomers"
            @deselectCustomersWithoutEmail="deselectCustomersWithoutEmail"
            @saveCustomerSelection="saveCustomerSelection"
            @loadCustomerSelection="loadCustomerSelection"
            @resolveDuplicateEmails="resolveDuplicateEmails"
            @selectAll="selectAll"
            @calculateCustomerList="calculateCustomerList"
            @toggleRowSelection="toggleRowSelection"
        ></ImportCustomerList>

      </div>

      <hr>

      <ImportReset></ImportReset>

      <hr>

      <ImportWelcomeEmails></ImportWelcomeEmails>

    </div>

  </div>

</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';

import moment from 'moment';
import ImportWelcomeEmails from './Import/ImportWelcomeEmails';
import ImportReset from './Import/ImportReset';
import ImportCustomerList from './Import/ImportCustomerList';
import ImportMixins from './Import/ImportMixins';

export default {
  components: {
    ImportCustomerList,
    ImportReset,
    ImportWelcomeEmails,
    LoadingAnimation,
    SettingsSubMenu,
  },
  mixins: [ImportMixins],
  data() {
    return {
      customerList: [],

      conventusCustomersCSV: [],
      conventusCreditCardTransactionCSV: [],
      conventusCreditCardTransactions: [],

      membershipMapping: [],
    };
  },


  computed: {
    showMembershipMapping() {
      return !!this.membershipMapping.length;
    },
  },

  methods: {

    calculateCustomerList() {
      this.customerList = _.map(this.conventusCustomersCSV, (conventusCustomer, idx) => {
        const nameParts = conventusCustomer.Navn.split(' ');
        const lastName = nameParts.pop();
        const firstName = nameParts.join(' ');
        const customer = {
          id_in_previous_booking_system: conventusCustomer.Id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: moment(conventusCustomer['Fødselsdato'], 'DD-MM-YYYY')
              .format('YYYY-MM-DD'),
          phone: conventusCustomer.Mobil,
          address_1: conventusCustomer['Adresse 1'],
          address_2: conventusCustomer['Adresse 2'],
          city: conventusCustomer['By'],
          zip_code: conventusCustomer['Postnr.'],
          email: conventusCustomer['E-mail'],


          memberships: [],
          class_passes: [],
          class_signups: [],
          event_signups: [],
        };

        return customer;
      });

      if (this.conventusCreditCardTransactions.length) {

        let
            invalidRowCount = 0,
            unmappedRowCount = 0,
            notPaymentRowCount = 0,
            importedMembershipCount = 0;

        _.each(this.conventusCreditCardTransactions,
            tx => {

              const conventusMembershipTypeName = tx.gruppe;

              if (!conventusMembershipTypeName) {
                console.log('tx:', tx);
                console.log('Could not import tx with "gruppe" = ', conventusMembershipTypeName);
                invalidRowCount++;
                return;
              }

              const mappingRow = _.find(this.membershipMapping, { conventusMembershipTypeName: conventusMembershipTypeName });
              const yogoId = mappingRow.yogoId;

              if (!yogoId) {
                console.log(conventusMembershipTypeName + ' is not mapped to a YOGO membership type');
                unmappedRowCount++;
                return;
              }

              if (tx.abonnement !== 'Betal') {
                console.log(tx, 'Ikke en betalings-transaktion')
                notPaymentRowCount++;
                return;
              }

              const conventusCustomerId = tx['medlem-id'];

              importedMembershipCount++;

              const yogoMembershipTypeId = yogoId.substr(16);

              const yogoMembershipType = _.find(this.yogoMembershipTypes, ['id', parseInt(yogoMembershipTypeId)]);

              const membershipToCreate = {
                membership_type: yogoMembershipType.id,
                membershipTypeName: yogoMembershipType.name,
                paid_until: moment.tz(tx.dato, 'DD.MM.YYYY HH:mm', 'Europe/Copenhagen')
                    .add(1, 'month')
                    .subtract(1, 'day')
                    .format('YYYY-MM-DD'),
                start_date: moment.tz('Europe/Copenhagen')
                    .format('YYYY-MM-DD'),
              };

              _.find(this.customerList, ['id_in_previous_booking_system', conventusCustomerId])
                  .memberships
                  .push(membershipToCreate);

            },
        );

        console.log('TX count: ', this.conventusCreditCardTransactions.length);
        console.log('Invalid row count: ', invalidRowCount);
        console.log('Unmapped rows: ', unmappedRowCount);
        console.log('Not payment rows: ', notPaymentRowCount);
        console.log('Imported rows: ', importedMembershipCount);
        console.log(
            'Total number of memberships processed: ',
            invalidRowCount +
            unmappedRowCount +
            importedMembershipCount,
        );
      }

      this.customerList = _.sortBy(this.customerList, customer => customer.email + customer.id_in_previous_booking_system);

      _.each(this.customerList, (customer, idx) => {
        customer.idx = idx;
      });
      this.selectAll();


      this.emailDuplicates = Array(this.customerList.length);
      this.calculateEmailDuplicates();

    },

    async customersFileChanged(event) {
      console.log('customersFileChanged');
      this.conventusCustomersCSV = await this.readAndParseCsvFile(
          event.target.files[0],
          { delimiter: ';' },
          {
            readAsText: true,
            charset: 'iso-8859-1',
          },
      );
    },

    async creditCardFileChanged(event) {
      console.log('creditCardFileChanged');
      this.conventusCreditCardTransactionCSV = await this.readAndParseCsvFile(
          event.target.files[0],
          { delimiter: ';' },
          {
            readAsText: true,
            charset: 'iso-8859-1',
          },
      );
      const creditCardTransactionDeadline = moment.tz('Europe/Copenhagen')
          .subtract(1, 'month')
          .add(1, 'day');
      this.conventusCreditCardTransactions = _.filter(
          this.conventusCreditCardTransactionCSV,
          row => {
            const txDate = moment.tz(row.dato, 'DD-MM-YY HH:mm', 'Europe/Copenhagen');
            return txDate.isSameOrAfter(creditCardTransactionDeadline, 'day');
          },
      );
      this.membershipMapping = _.chain(this.conventusCreditCardTransactions)
          .map('gruppe')
          .uniq()
          .map(
              conventusMembershipTypeName => ({
                conventusMembershipTypeName: conventusMembershipTypeName,
                yogoId: null,
              }),
          )
          .value();
    },

    saveMembershipMapping() {
      window.localStorage.setItem('importMembershipMapping', JSON.stringify(this.membershipMapping));
      alert('Membership mapping saved');
    },

    loadMembershipMapping() {
      this.membershipMapping = JSON.parse(window.localStorage.getItem('importMembershipMapping'));
      alert('Membership mapping loaded');
    },

  },

};

</script>

<style scoped lang="scss">

table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid black;
  padding: 1px 4px;
  text-align: left;
}

.mapping-table {
  margin-bottom: 20px;
}

.awaiting-selection {
  background: red;
}

</style>
