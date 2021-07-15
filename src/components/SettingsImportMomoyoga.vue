<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Import fra Momoyoga</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--row">
          <div class="flex--25">
            <label>Kunder</label>
            <input type="file" @change="customerListFileChanged">
          </div>

          <div class="flex--25">
            <label>Salg</label>
            <input type="file" @change="salesReportFileChanged">
          </div>

        </div>


        <table v-if="showPricingOptionsMap" class="mapping-table flex--50">
          <tr colspan="2">Adgangstyper</tr>
          <tr>
            <th>Momoyoga</th>
            <th>YOGO</th>
          </tr>
          <tr v-for="pricingOption in pricingOptions"
              :class="{'awaiting-selection': pricingOption.yogoObjectId}">
            <td>{{ pricingOption.momoyogaName }}</td>
            <td>
              <select v-model="pricingOption.yogoObjectId">
                <option :value="null">-- ikke angivet --</option>
                <optgroup label="Medlemskaber">
                  <option v-for="yogoMembershipType in yogoMembershipTypes"
                          :value="'membership_type_'+ yogoMembershipType.id">
                    {{ yogoMembershipType.name }}
                  </option>
                  <!--<option value="membership_type_x">Kundens medlemskab, uanset type</option>-->
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
        <div v-if="showPricingOptionsMap">
          <button @click="savePricingOptionSelections">Gem adgangstyper</button>
          <button @click="loadPricingOptionSelections">Hent adgangstyper</button>
        </div>

        <div class="space8" v-if="showPricingOptionsMap"></div>

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

import moment from 'moment-timezone';
import ImportMixins from './Import/ImportMixins';
import ImportCustomerList from './Import/ImportCustomerList';
import ImportReset from './Import/ImportReset';
import ImportWelcomeEmails from './Import/ImportWelcomeEmails';

export default {
  name: 'SettingsImportMomoyoga',
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

      momoyogaCustomerList: [],
      salesReport: [],

      customerList: [],

      pricingOptions: [],

    };
  },


  computed: {
    ...mapGetters([
      'client',
    ]),

    showPricingOptionsMap() {
      return !!_.keys(this.pricingOptions).length;
    },
  },
  watch: {},
  methods: {

    calculateCustomerList() {
      console.log('calculateCustomerList');

      const TODAY_ISO_DATE = moment.tz('Europe/Copenhagen')
          .format('YYYY-MM-DD');


      this.customerList = _.map(this.momoyogaCustomerList, (customer, idx) => {
        customer.memberships = [];
        customer.class_passes = [];
        customer.class_signups = [];
        customer.event_signups = [];
        customer.idx = idx;
        return customer;
      });

      this.selectAll();

      let classPassCount = 0,
          membershipCount = 0,
          eventSignupCount = 0,
          skippedPricingOptionCount = 0,
          pushedClassPassCount = 0,
          pushedMembershipCount = 0,
          pushedEventSignupCount = 0
      ;

      const relevantSales = _.filter(
          this.salesReport,
          salesRow => moment(salesRow['Expiry date'], 'DD/MM/YYYY')
              .format('YYYY-MM-DD') >= TODAY_ISO_DATE,
      );

      relevantSales.forEach((salesRow) => {
        const momoyogaProductName = salesRow['Order'];

        const pricingOption = _.find(this.pricingOptions, { momoyogaName: momoyogaProductName });

        if (!pricingOption) {
          throw new Error('YOGO object not selected for Momoyoga product ' + momoyogaProductName + ', invoice ID ' + salesRow['Invoice number']);
        }

        const yogoObjectId = pricingOption.yogoObjectId;

        const customer = _.find(this.customerList, { email: salesRow['Email address'] });

        if (!customer) {
          throw new Error('Customer not found for email ' + salesRow['Email address']);
        }


        if (yogoObjectId.substr(0, 16) === 'class_pass_type_') {

          classPassCount += 1;

          const yogoClassPassTypeId = yogoObjectId.substr(16);

          const yogoClassPassType = this.yogoClassPassTypes.find(classPassType => parseInt(classPassType.id) === parseInt(yogoClassPassTypeId));

          const classPass = {
            class_pass_type: yogoClassPassType.id,
            classPassTypeName: yogoClassPassType.name,
            classPassTypePassType: yogoClassPassType.pass_type,
            classes_left: yogoClassPassType.number_of_classes, // Must be adjusted manually
            valid_until: moment(salesRow['Expiry date'], 'DD/MM/YYYY')
                .format('YYYY-MM-DD'),
            start_date: moment(salesRow['Start date'], 'DD/MM/YYYY')
                .format('YYYY-MM-DD'),
          };

          customer.class_passes.push(classPass);
          pushedClassPassCount += 1;

        } else if (yogoObjectId.substr(0, 16) === 'membership_type_') {

          membershipCount += 1;

          const yogoMembershipTypeId = yogoObjectId.substr(16);
          console.log('yogoMembershipTypeId', yogoMembershipTypeId);
          const yogoMembershipType = this.yogoMembershipTypes.find(membershipType => parseInt(membershipType.id) === parseInt(yogoMembershipTypeId));


          const membership = {
            membership_type: yogoMembershipType.id,
            membershipTypeName: yogoMembershipType.name,
            paid_until: moment(salesRow['Expiry date'], 'DD/MM/YYYY').subtract(1, 'day')
                .format('YYYY-MM-DD'),
            start_date: moment(salesRow['Start date'], 'DD/MM/YYYY')
                .format('YYYY-MM-DD'),
          };


          customer.memberships.push(membership);
          pushedMembershipCount += 1;

        } else if (yogoObjectId.substr(0, 6) === 'event_') {

          eventSignupCount += 1;

          const yogoEventId = yogoObjectId.substr(6);
          const yogoEvent = this.yogoEvents.find(event => parseInt(event.id) === parseInt(yogoEventId));

          const eventSignup = {
            event: yogoEvent.id,
            eventName: yogoEvent.name,
          };
          customer.event_signups.push(eventSignup);
          pushedEventSignupCount += 1;
        }

      });


      console.log(pushedClassPassCount + ' class passes pushed out of ' + classPassCount);
      console.log(pushedMembershipCount + ' memberships pushed out of ' + membershipCount);
      console.log(pushedEventSignupCount + ' event signups pushed out of ' + eventSignupCount);
      console.log('Skipped pricing options: ' + skippedPricingOptionCount);
      //console.log('Not accounted for: ' + (this.mboClassPassesXLS.length - pushedClassPassCount - pushedMembershipCount - pushedEventSignupCount));


      this.emailDuplicates = Array(this.customerList.length);
      this.calculateEmailDuplicates();

    },

    async customerListFileChanged(event) {
      this.momoyogaCustomerList = (await this.readExcelFile(event.target.files[0]))
          .map((row) => {
            return {
              first_name: row['First name'],
              last_name: row['Last name'],
              address_1: row['Address'],
              city: row['City'],
              zip_code: row['Postal code'] ? row['Postal code'].toString() : '',
              country: 'DK',
              phone: row['Phone number'] ? row['Phone number'].toString() : '',
              email: row['Email address'],
              id_in_previous_booking_system: row['ID'],
              date_of_birth: row['Date of birth'] ? moment(row['Date of birth'], 'DD/MM/YYYY')
                  .format('YYYY-MM-DD') : null,
              profile_created: row['Registered'] ? moment(row['Registered'], 'DD/MM/YYYY')
                  .format('YYYY-MM-DD') : null,
            };
          });
      this.momoyogaCustomerList = _.sortBy(
          this.momoyogaCustomerList,
          customer => customer.email + customer.id_in_previous_booking_system,
      );
      this.selectAll();

    },


    updatePricingOptions() {
      const todayIsoDate = moment.tz('Europe/Copenhagen').format('YYYY-MM-DD');
      this.pricingOptions = _
          .chain(this.salesReport)
          .filter(row => moment(row['Expiry date'], 'DD/MM/YYYY').format('YYYY-MM-DD') >= todayIsoDate)
          .map('Order')
          .uniq()
          .sortBy()
          .map(orderName => ({
            momoyogaName: orderName,
            yogoObjectId: null,
          }))
          .value();

      //this.autoMatchMboObjectsToYogoObjects(this.pricingOptions, 'yogoClassPassTypeId', this.yogoClassPassTypes);

    },


    async salesReportFileChanged(event) {
      this.salesReport = (await this.readExcelFile(event.target.files[0]));
      console.log('this.salesReport', this.salesReport);
      this.updatePricingOptions();
    },


    deselectInactiveCustomers() {
      /*for (var i = 0; i < this.customerList.length; i++) {
        if (!this.mboClassPassesXLS.find(
            row => row['Client ID'] == this.customerList[i].mboId,
        )) {
          this.selectedCustomers[i] = false;
        }
      }
      this.$forceUpdate();
      this.calculateEmailDuplicates();*/

    },


    savePricingOptionSelections() {
      window.localStorage.setItem('importPricingOptionsMapping', JSON.stringify(this.pricingOptions));
      alert('Pricing options saved');
    },

    loadPricingOptionSelections() {
      const persistedPrices = JSON.parse(window.localStorage.getItem('importPricingOptionsMapping'));
      _.each(this.pricingOptions, (pricingOption) => {
        console.log('pricingOption:', pricingOption);
        const persistedPrice = _.find(persistedPrices, { momoyogaName: pricingOption['momoyogaName'] });
        if (persistedPrice) {
          console.log('persistedPrice:', persistedPrice);
          this.$set(pricingOption, 'yogoObjectId', persistedPrice.yogoObjectId);
        }
      });
      alert('Pricing options loaded');
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
  background: pink;
}

.alternate-input {
  maring-top: 1em;
  background-color: lightgreen;
}


</style>
