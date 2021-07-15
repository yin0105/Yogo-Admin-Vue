<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Import fra Senses</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--row">
          <div class="flex--20">
            <label>Kunder inkl medlemskaber (eksport_yogo.xls)</label>
            <input type="file" @change="customersFileChanged">
          </div>

        </div>

        <ImportCustomerList
            :customer-list="customerList"
            :email-duplicates="emailDuplicates"
            :selected-customers="selectedCustomers"
            @deselectCustomersWithoutEmail="deselectCustomersWithoutEmail"
            @deselectInactiveCustomers="deselectInactiveCustomers"
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

import csvParser from 'csv-parse';
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

      ssCustomersCSV: '',

    };
  },


  computed: {

  },

  methods: {

    calculateCustomerList() {
      this.customerList = _.map(this.ssCustomersCSV, (ssCustomer, idx) => {
        const customer = {
          id_in_previous_booking_system: ssCustomer.Medlemsnummer,
          first_name: [ssCustomer.Fornavn, ssCustomer.Mellemnavn].join(' '),
          last_name: ssCustomer.Efternavn,
          date_of_birth: null,
          phone: '',
          address_1: '',
          zip_code: '',
          email: ssCustomer['E-mail'],

          memberships: [],
          class_passes: [
            {
              class_pass_type: 300,
              classPassTypeName: 'Livestream',
              classPassTypePassType: 'unlimited',
              classes_left: 0,
              valid_until: '2021-11-27',
              start_date: '2020-11-27',
            }
          ],
          class_signups: [],
          event_signups: [],
        };

        return customer;
      });

      // SPECIAL CASE FOR SENSES
      // this.customerList = _.uniqBy(this.customerList, 'email');
      // END SPECIAL CASE FOR SENSES

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
      this.ssCustomersCSV = await this.readExcelFile(
          event.target.files[0],
      );
      console.log(this.ssCustomersCSV);

      this.calculateCustomerList();
    },



    deselectInactiveCustomers() {
      for (var i = 0; i < this.customerList.length; i++) {
        if (!this.ssMembershipsCSV.find(
            row => row['Client ID'] == this.customerList[i].id_in_previous_booking_system,
        )) {
          this.selectedCustomers[i] = false;
        }
      }
      this.$forceUpdate();
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

.awaiting-selection {
  background: red;
}

</style>
