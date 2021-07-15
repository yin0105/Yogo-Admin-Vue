<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Import fra generisk liste</h2>

      <loading-animation v-if="loading"/>

      <div v-else>

        <div class="flex--row">
          <div class="flex--25">
            <label>Import Data (Excel format)</label>
            <input type="file" @change="importDataFileChanged">
          </div>
        </div>

        <ImportCustomerList
            :customer-list="customerList"
            :email-duplicates="emailDuplicates"
            :selected-customers="selectedCustomers"
            @deselectCustomersWithoutEmail="deselectCustomersWithoutEmail"
            @saveCustomerSelection="saveCustomerSelection"
            @loadCustomerSelection="loadCustomerSelection"
            @resolveDuplicateEmails="resolveDuplicateEmails"
            @selectAll="selectAll"
            @deselectZipCodesFrom5000Up="deselectZipCodesFrom5000Up"
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

import { mapGetters } from 'vuex';
import ImportMixins from './Import/ImportMixins';
import ImportCustomerList from './Import/ImportCustomerList';
import ImportReset from './Import/ImportReset';
import ImportWelcomeEmails from './Import/ImportWelcomeEmails';
import moment from 'moment-timezone';

export default {
  name: 'SettingsImportGeneric',
  components: {
    ImportWelcomeEmails,
    ImportReset,
    ImportCustomerList,
    LoadingAnimation,
    SettingsSubMenu,
  },
  mixins: [ImportMixins],
  data() {
    return {

      importData: [],

    };
  },


  computed: {
    ...mapGetters([
      'client',
    ]),


  },
  watch: {},
  methods: {

    calculateCustomerList() {
      console.log('calculateCustomerList');

      let classPassCount = 0,
          membershipCount = 0
      ;

      this.customerList = _.map(this.importData, (customer, idx) => {
        customer.memberships = [];
        customer.class_passes = [];
        customer.class_signups = [];
        customer.event_signups = [];
        customer.id_in_previous_booking_system = customer.ID;
        customer.idx = idx;

        customer.profile_created = this.normalizeDate(customer.profile_created);

        if (customer.full_name) {
          const nameParts = customer.full_name.split(' ');
          customer.last_name = nameParts.pop();
          customer.first_name = nameParts.join(' ');
        }

        if (customer.class_pass_type_id) {
          const yogoClassPassType = _.find(this.yogoClassPassTypes, { id: customer.class_pass_type_id });
          const classPass = {
            class_pass_type: customer.class_pass_type_id,
            classPassTypeName: yogoClassPassType.name,
            classPassTypePassType: yogoClassPassType.pass_type,
            classes_left: customer.class_pass_classes_left,
            valid_until: customer.class_pass_valid_until,
            start_date: customer.class_pass_start_date,
          };
          customer.class_passes.push(classPass);
          classPassCount += 1;
        }

        if (customer.membership_type_id) {

          const yogoMembershipType = _.find(this.yogoMembershipTypes, { id: customer.membership_type_id });

          const membership = {
            membership_type: yogoMembershipType.id,
            membershipTypeName: yogoMembershipType.name,
            paid_until: customer.membership_paid_until,
            start_date: customer.membership_start_date,
          };

          customer.memberships.push(membership);

          membershipCount += 1;

        }

        return customer;
      });

      this.selectAll();

      console.log(classPassCount + ' class passes pushed');
      console.log(membershipCount + ' memberships pushed');

      this.emailDuplicates = Array(this.customerList.length);
      this.calculateEmailDuplicates();

    },

    async importDataFileChanged(event) {

      this.importData = (await this.readExcelFile(event.target.files[0]));

    },

    normalizeDate(inputDate) {
      console.log('inputDate', inputDate);
      if (!inputDate) return '';
      if (inputDate.match(/^\d\d\d\d-\d\d-\d\d$/)) {
        return inputDate;
      }
      if (_.isInteger(inputDate)) {
        throw new Error('Don\'t use Excel integer dates. Import f.ex the field as text instead of date.');
      }
      if (inputDate.match(/^\d\d\.\d\d\.\d\d\d\d +\d\d:\d\d/)) {
        return `${inputDate.substr(6, 4)}-${inputDate.substr(3, 2)}-${inputDate.substr(0, 2)}`;
      }
      if (inputDate.match(/\d{1,2}\/\d{1,2}\/\d{4} \d\d:\d\d:\d\d [AP]M/)) {
        return moment.tz(inputDate, 'M/D/YYYY hh:mm:ss a', 'Europe/Copenhagen')
            .format('YYYY-MM-DD');
      }
      throw new Error(inputDate);
    }

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

</style>
