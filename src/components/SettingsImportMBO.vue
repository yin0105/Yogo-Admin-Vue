<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Import fra MBO</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--row">
          <div class="flex--25">
            <label>Kunder (Reports->Clients->Mailing List)</label>
            <input type="file" @change="customerListFileChanged">
          </div>

          <div class="flex--25">
            <label>Adgang (Reports->Clients->Visits Remaining)</label>
            <input type="file"
                   @change="visitsRemainingReportChanged">
            <div class="alternate-input">
              <label>Adgang (Subscriber Data Export->CustomerPricingOptions1)</label>
              <input type="file"
                     @change="subscriberExportCustomerPricingOptionsChanged">
            </div>
          </div>

          <div class="flex--25">
            <label>Suspenderede medlemskaber (Reports->Memberships, suspended)</label>
            <input type="file"
                   @change="suspendedMembershipsChanged">
          </div>

          <div class="flex--25">
            <label>Beroperioder (Subscriber Data Export->ClientAutopayContracts1)</label>
            <input type="file"
                   @change="suspensionPeriodsChanged">
          </div>

          <!--<div class="flex--25">
            <label>Opstartsdatoer (Subscriber Data Export->Clients1)</label>
            <input type="file"
                   @change="Clients1ReportChanged">
          </div>-->

          <div class="flex--25">
            <label>Tilmeldinger (Attendance Without Revenue Report)</label>
            <input type="file" @change="attendanceWithoutRevenueReportChanged">
          </div>
        </div>


        <table v-if="showPricingOptionsMap" class="mapping-table flex--50">
          <tr colspan="2">Adgangstyper</tr>
          <tr>
            <th>Mindbody Online</th>
            <th>Yogo</th>
          </tr>
          <tr v-for="(mboPricingOption, mboPricingOptionName) in mboPricingOptions"
              :class="{'awaiting-selection': !mboPricingOption.matchingYogoObjectId}">
            <td>{{ mboPricingOptionName }}</td>
            <td>
              <select v-model="mboPricingOption.matchingYogoObjectId">
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
        <div v-if="showPricingOptionsMap">
          <button @click="savePricingOptionSelections">Gem adgangstyper</button>
          <button @click="loadPricingOptionSelections">Hent adgangstyper</button>
        </div>

        <div class="space8" v-if="showPricingOptionsMap"></div>

        <table v-if="showClassTypesMap" class="mapping-table flex--50">
          <tr colspan="2">Holdtyper</tr>
          <tr>
            <th>Mindbody Online</th>
            <th>Yogo</th>
          </tr>
          <tr v-for="(value, importedClassType) in mboClassTypes"
              :class="{'awaiting-selection': !value.yogoClassTypeId}">
            <td>{{ importedClassType }}</td>
            <td><select v-model="value.yogoClassTypeId">
              <option value="">-</option>
              <option v-for="yogoClassType in yogoClassTypes" :value="yogoClassType.id">
                {{ yogoClassType.name }}
              </option>
            </select>
            </td>
          </tr>
        </table>

        <div v-if="showClassTypesMap">
          <button @click="saveClassTypeSelections">Gem klassetyper</button>
          <button @click="loadClassTypeSelections">Hent klassetyper</button>
        </div>

        <div class="space8" v-if="showClassTypesMap"></div>


        <table v-if="mboClasses.length" class="mapping-table flex--50">
          <tr>
            <th colspan="4">Klasser</th>
          </tr>
          <tr>
            <th>Dato</th>
            <th>Tid</th>
            <th>Type</th>
            <th>Klassen er oprettet i Yogo</th>
          </tr>
          <tr v-for="mboClass in mboClasses"
              :class="{'awaiting-selection': !mboClass.hasMatchingYogoClass}">
            <td style="white-space: nowrap;">{{ mboClass.date }}</td>
            <td>{{ mboClass.start_time }}</td>
            <td>{{ mboClass.classTypeName }}</td>
            <td>
              <md-icon v-if="mboClass.hasMatchingYogoClass">done</md-icon>
            </td>
          </tr>
        </table>

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
  name: 'SettingsImportMBO',
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

      mboCustomerList: '',

      mboClassPassesXLS: [],
      mboPricingOptions: {},

      mboClassSignupsXLS: [],
      mboClassTypes: {},

      MBODataExportClients: [],

      mboSuspendedMemberships: [],
      mboMembershipSuspensions: [],

      importingPricingOptionsViaSubscriberDataExport: false,

    };
  },


  computed: {
    ...mapGetters([
      'client',
    ]),

    mboClasses() {

      return _
          .chain(this.mboClassSignupsXLS)
          .uniqBy(row => row.Date + row.Time + row.Type)
          .map(row => {
            const yogoClassTypeId = this.mboClassTypes[row.Type] ? this.mboClassTypes[row.Type].yogoClassTypeId : null;

            return {
              date: row.Date,
              start_time: row.Time,
              classTypeName: row.Type,
              hasMatchingYogoClass: yogoClassTypeId &&
                  !!_.find(
                      this.yogoClasses,
                      yogoClass =>
                          yogoClass.date === row.Date &&
                          yogoClass.start_time === row.Time &&
                          yogoClass.class_type.id == yogoClassTypeId,
                  ),
            };
          })
          .sortBy(['date', 'start_time'])
          .value();

    },

    yogoClassTypes() {
      return _
          .chain(this.yogoClasses)
          .map('class_type')
          .uniqBy('id')
          .value();
    },
    showPricingOptionsMap() {
      return !!_.keys(this.mboPricingOptions).length;
    },
    showClassTypesMap() {
      return !!_.keys(this.mboClassTypes).length;
    },
    showMissingClassesTable() {
      return !!this.mboClasses.length;
    },
  },
  watch: {

    mboClassPassesXLS() {
      this.updateMboPricingOptions();
    },
    mboClassSignupsXLS() {
      this.updateMboPricingOptions();
      this.updateMboClassTypes();
    },
  },
  methods: {

    calculateCustomerList() {
      console.log('calculateCustomerList');

      const TODAY_ISO_DATE = moment.tz('Europe/Copenhagen')
          .format('YYYY-MM-DD');

      const MBOCreationDates = _.chain(this.MBODataExportClients)
          .keyBy('MBSystemID')
          .mapValues('ProfileCreationDate')
          .value();

      const MBOBirthDates = _.chain(this.MBODataExportClients)
          .keyBy('MBSystemID')
          .mapValues('Birthdate')
          .value();

      this.customerList = _.map(this.mboCustomerList, (customer, idx) => {
        customer.memberships = [];
        customer.class_passes = [];
        customer.class_signups = [];
        customer.event_signups = [];
        customer.id_in_previous_booking_system = customer.mboId;
        customer.idx = idx;

        customer.profile_created = MBOCreationDates[customer.mboId] ?
            moment(MBOCreationDates[customer.mboId].split(' ')[0], 'M/D/Y')
                .format('YYYY-MM-DD') :
            null;

        customer.date_of_birth = MBOBirthDates[customer.mboId] ?
            moment(MBOBirthDates[customer.mboId].split(' ')[0], 'M/D/Y')
                .format('YYYY-MM-DD') :
            null;

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

      if (_.keys(this.mboPricingOptions).length) {
        console.log('this.mboClassPassesXLS.length:', this.mboClassPassesXLS.length);
        this.mboClassPassesXLS.forEach(row => {
          const mboPricingOptionName = row['Pricing option'];
          const mboPricingOption = this.mboPricingOptions[mboPricingOptionName];
          if (!mboPricingOption) {
            skippedPricingOptionCount += 1;
            return;
          }

          let yogoObjectId = mboPricingOption.matchingYogoObjectId;

          if (!yogoObjectId) {
            skippedPricingOptionCount += 1;
            return;
          }
          const mboCustomerId = row['Client ID'];
          //console.log(mboCustomerId);

          const customer = _.find(this.customerList, { mboId: mboCustomerId });
          //console.log('customer', customer);
          if (!customer) return;

          // This check is only relevant if importing via Subscriber Data Export
          if (this.importingPricingOptionsViaSubscriberDataExport && row['Expiration Date'] < TODAY_ISO_DATE) {
            //console.log('Skipping pricing option because ExpDate is ' + row['Expiration Date']);
            skippedPricingOptionCount += 1;
            return;
          }

          if (yogoObjectId.substr(0, 16) === 'class_pass_type_') {

            classPassCount += 1;

            const yogoClassPassTypeId = yogoObjectId.substr(16);

            const yogoClassPassType = this.yogoClassPassTypes.find(classPassType => parseInt(classPassType.id) === parseInt(yogoClassPassTypeId));

            const classPass = {
              class_pass_type: yogoClassPassType.id,
              classPassTypeName: yogoClassPassType.name,
              classPassTypePassType: yogoClassPassType.pass_type,
              classes_left: row['Unbooked'],
              valid_until: row['Expiration Date'],
              start_date: row['Activation Date'],
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
              paid_until: row['Expiration Date'],/*moment(row['Activation Date'])
                  .add(1, 'month')
                  .format('YYYY-MM-DD'),*/
              start_date: row['Activation Date'],
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

      }

      console.log(pushedClassPassCount + ' class passes pushed out of ' + classPassCount);
      console.log(pushedMembershipCount + ' memberships pushed out of ' + membershipCount);
      console.log(pushedEventSignupCount + ' event signups pushed out of ' + eventSignupCount);
      console.log('Skipped pricing options: ' + skippedPricingOptionCount);
      console.log('Not accounted for: ' + (this.mboClassPassesXLS.length - pushedClassPassCount - pushedMembershipCount - pushedEventSignupCount));


      /////////////////////////////////////////
      // Check for suspended memberships
      /////////////////////////////////////////
      let suspendedMembershipsApplied = 0;

      _.each(this.mboSuspendedMemberships, mboSuspendedMembership => {

        const suspensionPeriodForCustomer = _.find(this.mboMembershipSuspensions, { PayingClientID: mboSuspendedMembership.ID });
        if (suspensionPeriodForCustomer
            && suspensionPeriodForCustomer.ContractSuspendStartDate <= TODAY_ISO_DATE
            && (!suspensionPeriodForCustomer.ContractSuspendEndDate
                || suspensionPeriodForCustomer.ContractSuspendEndDate >= TODAY_ISO_DATE
            )
        ) {
          suspendedMembershipsApplied += 1;
          const yogoMembershipType = _.find(this.yogoMembershipTypes, { id: 230 }); // "MEMBERSHIP ON HOLD"
          const membership = {
            membership_type: yogoMembershipType.id,
            membershipTypeName: yogoMembershipType.name,
            paid_until: suspensionPeriodForCustomer.ContractSuspendEndDate
                ? suspensionPeriodForCustomer.ContractSuspendEndDate
                : '2021-12-31',
            start_date: '2021-01-01',
          };
          _.find(this.customerList, { id_in_previous_booking_system: mboSuspendedMembership.ID })
              .memberships
              .push(membership);
        }
      });
      console.log(this.mboSuspendedMemberships.length + ' suspended memberships. ' + suspendedMembershipsApplied + ' applied');


      let processedSignupCount = 0;
      let notFoundCustomerCount = 0;
      if (this.mboClassSignupsXLS.length) {
        console.log('Now processing ' + this.mboClassSignupsXLS.length + ' class signups');
        _.each(this.mboClassSignupsXLS, mboClassSignup => {

          const yogoClass = this.yogoClasses.find(
              yogoClassItem => yogoClassItem.date === mboClassSignup.Date &&
                  yogoClassItem.start_time === mboClassSignup.Time
                  && yogoClassItem.class_type.id === this.mboClassTypes[mboClassSignup.Type].yogoClassTypeId,
          );

          if (!yogoClass) {
            console.log('Could not find class ' + mboClassSignup.Date + ' ' + mboClassSignup.Time + ' ' + mboClassSignup.Type);
            return;
          }
          const customer = _.find(this.customerList, customer => customer.mboId === mboClassSignup['Client ID']);
          if (!customer) {
            console.log('Could not find customer with ID ' + mboClassSignup['Client ID'] + '!!');
            notFoundCustomerCount += 1;
            return;
          }
          const MBOPricingOption = this.mboPricingOptions[mboClassSignup['Pricing Option']];

          let yogoAccessObjectId,
              yogoAccessObject;
          if (MBOPricingOption && MBOPricingOption.matchingYogoObjectId) {

            yogoAccessObjectId = MBOPricingOption.matchingYogoObjectId;

            if (yogoAccessObjectId.substr(0, 16) === 'membership_type_') {

              if (yogoAccessObjectId === 'membership_type_x') {
                if (!customer.memberships || !customer.memberships[0]) return;
                yogoAccessObjectId = 'membership_type_' + customer.memberships[0].membership_type;
              }
              yogoAccessObject = this.yogoMembershipTypes.find(membershipType => parseInt(membershipType.id) === parseInt(yogoAccessObjectId.substr(16)));

            } else if (yogoAccessObjectId.substr(0, 16) === 'class_pass_type_') {
              yogoAccessObject = this.yogoClassPassTypes.find(classPassType => parseInt(classPassType.id) === parseInt(yogoAccessObjectId.substr(16)));
            }
          }

          customer.class_signups = customer.class_signups || [];
          customer.class_signups.push({
            'class': yogoClass.id,
            accessObjectId: yogoAccessObjectId || undefined,
            accessObjectName: yogoAccessObject ? yogoAccessObject.name : undefined,
            yogoClass: yogoClass,
          });
          processedSignupCount += 1;
        });
      }
      console.log('Pushed ' + processedSignupCount + ' signups.');
      this.emailDuplicates = Array(this.customerList.length);
      this.calculateEmailDuplicates();

    },

    async customerListFileChanged(event) {
      const file = event.target.files[0];

      const fileReader = new FileReader();
      fileReader.onload = e => {
        const mboCustomerListHtml = decodeURIComponent(escape(e.target.result));

        const parser = new DOMParser();
        let htmlDoc = parser.parseFromString(mboCustomerListHtml, 'text/html');

        const resultRows = htmlDoc.getElementsByClassName('resultRow');
        this.mboCustomerList = _.map(resultRows, resultRow => {
          const cells = resultRow.getElementsByTagName('td');
          return {
            first_name: cells[1].childNodes[0] ? cells[1].childNodes[0].nodeValue.trim() : '',
            last_name: cells[0].childNodes[0] ? cells[0].childNodes[0].nodeValue.trim() : '',
            address_1: cells[4].childNodes[0] ? cells[4].childNodes[0].nodeValue.trim() : '',
            city: cells[5].childNodes[0] ? cells[5].childNodes[0].nodeValue.trim() : '',
            zip_code: this.formatZipCode(
                cells[7].childNodes[0] ? cells[7].childNodes[0].nodeValue.trim() : '',
            ),
            country: cells[8].childNodes[0] ? cells[8].childNodes[0].nodeValue.trim() : '',
            phone: this.formatPhone(
                cells[9].childNodes[0] ? cells[9].childNodes[0].nodeValue.trim() : '',
            ),
            email: cells[12].childNodes[0] ? cells[12].childNodes[0].nodeValue.toLocaleLowerCase()
                .trim() : '',
            mboId: cells[3].childNodes[0] ? cells[3].childNodes[0].nodeValue.trim() : '',
          };
        });
        this.mboCustomerList = _.sortBy(
            this.mboCustomerList,
            mboCustomer => mboCustomer.email + mboCustomer.mboId,
        );
        this.selectAll();

      };
      fileReader.readAsBinaryString(file);

    },

    updateMboPricingOptions() {
      this.mboPricingOptions = _
          .chain(this.mboClassPassesXLS)
          .map('Pricing option')
          .concat(
              _.map(this.mboClassSignupsXLS, 'Pricing Option'),
          )
          .uniq()
          .sortBy()
          .keyBy()
          .mapValues(() => {
            return { matchingYogoObjectId: null };
          })
          .value();

      this.autoMatchMboObjectsToYogoObjects(this.mboPricingOptions, 'yogoClassPassTypeId', this.yogoClassPassTypes);

    },

    updateMboClassTypes() {

      this.mboClassTypes = _
          .chain(this.mboClassSignupsXLS)
          .map('Type')
          .uniq()
          .sortBy()
          .keyBy()
          .mapValues(() => {
            return { yogoClassTypeId: null };
          })
          .value();

      this.autoMatchMboObjectsToYogoObjects(this.mboClassTypes, 'yogoClassTypeId', this.yogoClassTypes);
    },


    async visitsRemainingReportChanged(event) {

      this.mboClassPassesXLS = (await this.readExcelFile(event.target.files[0]))
          .map(row => {

            row['Expiration Date'] = this.dateDDMMYYYYToYYYYMMDD(
                row['Expiration Date'] || row['Last Expiration Date'],
            );
            row['Activation Date'] = this.dateDDMMYYYYToYYYYMMDD(
                row['Activation Date'] || row['First Activation Date'],
            );

            return row;
          });

    },

    async subscriberExportCustomerPricingOptionsChanged(event) {

      this.importingPricingOptionsViaSubscriberDataExport = true;

      this.mboClassPassesXLS = (await this.readExcelFile(event.target.files[0]))
      .map(row => {

        row['Expiration Date'] = this.suspendDateToIsoDate(
            row['ExpDate'],
        );
        row['Activation Date'] = this.suspendDateToIsoDate(
            row['ActiveDate'],
        );
        row['Pricing option'] = row['Description'];
        row['Client ID'] = row['MBSystemID'].toString();
        row['Unbooked'] = row['Remaining'];

        return row;
      });

    },

    async Clients1ReportChanged(event) {
      this.MBODataExportClients = await this.readAndParseCsvFile(event.target.files[0]);
    },

    async attendanceWithoutRevenueReportChanged(event) {

      this.mboClassSignupsXLS = (await this.readExcelFile(event.target.files[0]))
          .slice(0, -1) // Remove summary row
          .map(row => {
            row.Date = this.momentFromSerializedExcelDate(row.Date)
                .format('YYYY-MM-DD');
            row.Time = row.Time.trim();
            row.Type = row.Type.trim();
            row['Pricing Option'] = row['Pricing Option'].trim();
            return row;
          });

    },


    async suspendedMembershipsChanged(event) {
      this.mboSuspendedMemberships = await this.readAndParseCsvFile(
          event.target.files[0],
          { delimiter: ';' },
          { readAsText: true },
      );
      console.log(this.mboSuspendedMemberships);
    },

    async suspensionPeriodsChanged(event) {
      this.mboMembershipSuspensions = (await this.readAndParseCsvFile(
          event.target.files[0],
          { delimiter: ';' },
      ));

      this.mboMembershipSuspensions = _.map(this.mboMembershipSuspensions,
          (row) => {
            row['ContractSuspendStartDate'] = this.suspendDateToIsoDate(row['ContractSuspendStartDate']);
            row['ContractSuspendEndDate'] = this.suspendDateToIsoDate(row['ContractSuspendEndDate']);
            if (row['PayingClientID'] !== row['ReceivingClientId']) throw new Error(row['PayingClientID'] + ' ' + row['ReceivingClientId']);
            return row;
          },
      );
      console.log(this.mboMembershipSuspensions);
      this.mboMembershipSuspensions = _.groupBy(this.mboMembershipSuspensions, 'PayingClientID');
      console.log('Grouped:', this.mboMembershipSuspensions);
      this.mboMembershipSuspensions = _.mapValues(
          this.mboMembershipSuspensions,
          suspensionPeriods => _.chain(suspensionPeriods)
              .sortBy('ContractSuspendstartDate')
              .value()
              .pop(),
      );
      console.log('Filtered', this.mboMembershipSuspensions);
    },

    suspendDateToIsoDate(suspendDate) {
      if (!suspendDate) return '';
      if (_.isInteger(suspendDate)) {
        throw new Error('Don\'t use Excel integer dates. Import f.ex the field as text instead of date.');
      }
      if (suspendDate.match(/^\d\d\.\d\d\.\d\d\d\d \d\d:\d\d/)) {
        return `${suspendDate.substr(6, 4)}-${suspendDate.substr(0, 2)}-${suspendDate.substr(3, 2)}`;
      }
      if (suspendDate.match(/\d{1,2}\/\d{1,2}\/\d{4} \d\d:\d\d:\d\d [AP]M/)) {
        return moment.tz(suspendDate, 'M/D/YYYY hh:mm:ss a', 'Europe/Copenhagen')
            .format('YYYY-MM-DD');
      }
      throw new Error(suspendDate);
    },

    autoMatchMboObjectsToYogoObjects(mboObjects, mboObjectPropertyName, yogoObjects) {
      _.each(mboObjects, (mboObject, mboObjectName) => {
        const mboObjectNameLC = mboObjectName.toLowerCase();

        let matchingYogoObject = _.find(yogoObjects, yogoObject => {
          const yogoObjectNameLC = yogoObject.name.toLowerCase();
          return mboObjectNameLC === yogoObjectNameLC;
        });

        if (!matchingYogoObject) {
          matchingYogoObject = _.find(yogoObjects, yogoObject => {
            const yogoObjectNameLC = yogoObject.name.toLowerCase();
            return mboObjectNameLC.indexOf(yogoObjectNameLC) > -1 ||
                yogoObjectNameLC.indexOf(mboObjectNameLC) > -1;
          });
        }
        mboObject[mboObjectPropertyName] = matchingYogoObject ? matchingYogoObject.id : null;
      });
    },


    deselectInactiveCustomers() {
      for (var i = 0; i < this.customerList.length; i++) {
        if (!this.mboClassPassesXLS.find(
            row => row['Client ID'] == this.customerList[i].mboId,
        )) {
          this.selectedCustomers[i] = false;
        }
      }
      this.$forceUpdate();
      this.calculateEmailDuplicates();

    },


    savePricingOptionSelections() {
      window.localStorage.setItem('importPricingOptionsMapping', JSON.stringify(this.mboPricingOptions));
      alert('Pricing options saved');
    },

    loadPricingOptionSelections() {
      console.log('window.localStorage.getItem(\'importPricingOptionsMapping\'):', window.localStorage.getItem('importPricingOptionsMapping'));
      this.mboPricingOptions = JSON.parse(window.localStorage.getItem('importPricingOptionsMapping'));
      alert('Pricing options loaded');
    },

    saveClassTypeSelections() {
      window.localStorage.setItem('importClassTypesMapping', JSON.stringify(this.mboClassTypes));
      alert('Class types saved');
    },

    loadClassTypeSelections() {
      this.mboClassTypes = JSON.parse(window.localStorage.getItem('importClassTypesMapping'));
      alert('Class types loaded');
    },


    formatZipCode(zipCode) {
      return zipCode.replace(/DK-|DK/, '');
    },

    formatPhone(phone) {
      if (phone.match(/^\d{8}$/)) return phone;
      let potentialDanishNumber = phone.replace(/[ -]/, '');
      if (potentialDanishNumber.match(/\+?45\d{8}/)) {
        return potentialDanishNumber.substr(potentialDanishNumber.length - 8);
      }
      return phone;
    },
    momentFromSerializedExcelDate(serializedExcelDate) {
      return moment('1900-01-01')
          .add(serializedExcelDate - 2, 'days');
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
  maring-top:1em;
  background-color: lightgreen;
}


</style>
