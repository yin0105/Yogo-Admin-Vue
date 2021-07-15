<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Import fra Sport Solution</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--row">
          <div class="flex--20">
            <label>Kunder (Customers.csv)</label>
            <input type="file" @change="customersFileChanged">
          </div>

          <div class="flex--20">
            <label>Medlemskabstyper (MembershipTypes.csv)</label>
            <input type="file" @change="membershipTypesFileChanged">
          </div>

          <div class="flex--20">
            <label>Adgang (Memberships.csv)</label>
            <input type="file"
                   @change="membershipsFileChanged">
          </div>


          <div class="flex--20">
            <label>Beroperioder (ContractHoldPeriods.csv)</label>
            <input type="file"
                   @change="onHoldPeriodsFileChanged">
          </div>


          <div class="flex--20">
            <label>Tilmeldinger (TeamBooking.csv)</label>
            <input type="file" @change="teamBookingsFileChanged">
          </div>

        </div>


        <table v-if="showPricingOptionsMap" class="mapping-table flex--50">
          <tr colspan="2">Adgangstyper</tr>
          <tr>
            <th>Sport Solution</th>
            <th>Yogo</th>
          </tr>
          <tr v-for="ssPrice in ssPrices"
              :class="{'awaiting-selection': !ssPrice.matchingYogoObjectId}">
            <td>{{ ssPrice.MembershipName }}</td>
            <td>
              <select v-model="ssPrice.matchingYogoObjectId">
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
                    {{ yogoEvent.name }} ({{ yogoEvent.start_date }})
                  </option>
                </optgroup>
              </select>
            </td>
          </tr>
        </table>

        <button v-if="showPricingOptionsMap" type="button" @click="savePricingOptions">Save pricing
          options
        </button>
        <button v-if="showPricingOptionsMap" type="button" @click="loadPricingOptions">Load pricing
          options
        </button>

        <div class="space4"></div>

        <table v-if="showClassTypesMap" class="mapping-table flex--50">
          <tr colspan="2">Holdtyper</tr>
          <tr>
            <th>Mindbody Online</th>
            <th>Yogo</th>
          </tr>
          <tr v-for="(ssClassType, ssClassTypeName) in ssClassTypes"
              :class="{'awaiting-selection': !ssClassType.yogoClassTypeId}">
            <td>{{ ssClassTypeName }}</td>
            <td><select v-model="ssClassType.yogoClassTypeId">
              <option value="">-</option>
              <option v-for="yogoClassType in yogoClassTypes" :value="yogoClassType.id">
                {{ yogoClassType.name }}
              </option>
            </select>
            </td>
          </tr>
        </table>

        <button v-if="showClassTypesMap" type="button" @click="saveClassTypes">Save class types
        </button>
        <button v-if="showClassTypesMap" type="button" @click="loadClassTypes">Load class types
        </button>

        <div class="space4"></div>

        <table v-if="ssClassesWithSignups.length" class="mapping-table flex--50">
          <tr>
            <th colspan="4">Klasser</th>
          </tr>
          <tr>
            <th>Dato</th>
            <th>Tid</th>
            <th>Type</th>
            <th>Klassen er oprettet i Yogo</th>
          </tr>
          <tr v-for="ssClass in ssClassesWithSignups"
              :class="{'awaiting-selection': !ssClass.hasMatchingYogoClass}">
            <td style="white-space: nowrap;">{{ ssClass.date }}</td>
            <td>{{ ssClass.start_time }}</td>
            <td>{{ ssClass.classTypeName }}</td>
            <td>
              <md-icon v-if="ssClass.hasMatchingYogoClass">done</md-icon>
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

      exportSystemName: 'Sport Solution',

      ssCustomersCSV: '',
      ssMembershipsCSV: [],
      ssMembershipTypesCSV: [],
      ssClassSignupsCSV: [],
      ssAccountTransactionsCSV: [],

      ssPrices: [],
      ssClassTypes: {},
    };
  },


  computed: {

    ssClassesWithSignups() {
      const today = moment.tz('Europe/Copenhagen');
      return _
          .chain(this.ssClassSignupsCSV)
          .uniqBy('TeamDate')
          .filter(row => moment.tz(row.TeamDate, 'Europe/Copenhagen')
              .isSameOrAfter(today, 'day'))
          .map(row => {
            const yogoClassTypeId = this.ssClassTypes[row.TeamName] ? this.ssClassTypes[row.TeamName].yogoClassTypeId : null;
            const ssDateTime = moment(row.TeamDate)
                .tz('Europe/Copenhagen');
            console.log(ssDateTime.format('YYYY-MM-DD HH:mm:ss'), row.TeamDate);
            console.log(yogoClassTypeId);

            return {
              date: ssDateTime.format('YYYY-MM-DD'),
              start_time: ssDateTime.format('HH:mm:ss'),
              classTypeName: row.TeamName,
              hasMatchingYogoClass: yogoClassTypeId &&
                  _.find(
                      this.yogoClasses,
                      (yogoClass) => {
                        return yogoClass.date + ' ' + yogoClass.start_time === ssDateTime.format('YYYY-MM-DD HH:mm')
                            && parseInt(yogoClass.class_type.id) === parseInt(yogoClassTypeId);
                      },
                  ),
            };
          })
          .sortBy(['date', 'start_time'])
          .value();

    },

    showPricingOptionsMap() {
      return !!this.ssPrices.length;
    },
    showClassTypesMap() {
      return !!_.keys(this.ssClassTypes).length;
    },
    showMissingClassesTable() {
      return !!this.ssClasses.length;
    },
  },

  methods: {

    decodeUsDateTimeToDate(usDateTime) {
      const m = moment.tz(usDateTime, 'M/D/YYYY LTS', 'Europe/Copenhagen');
      return m.isValid() ? m.format('YYYY-MM-DD') : null;
    },

    calculateCustomerList() {
      this.customerList = _.map(this.ssCustomersCSV, (ssCustomer, idx) => {
        const customer = {
          id_in_previous_booking_system: ssCustomer.ID,
          first_name: ssCustomer.Name,
          last_name: ssCustomer.LastName !== 'NULL' ? ssCustomer.LastName : '',
          date_of_birth: this.decodeUsDateTimeToDate(ssCustomer.Birthdate),
          phone: this.formatPhone(ssCustomer.Mobile || ssCustomer.Phone || ''),
          address_1: ssCustomer.Address,
          zip_code: ssCustomer.ZipCode !== 'NULL' ? ssCustomer.ZipCode : '',
          email: ssCustomer.Email.toLocaleLowerCase(),

          memberships: [],
          class_passes: [],
          class_signups: [],
          event_signups: [],
        };
        if (ssCustomer.DibsAgreementNumber && ssCustomer.DibsAgreementNumber !== 'NULL') {
          customer.dibsTicketId = ssCustomer.DibsAgreementNumber;
        }
        if (customer.phone === 'NULL') {
          customer.phone = '';
        }
        return customer;
      });
      this.customerList = _.sortBy(this.customerList, customer => customer.email + customer.id_in_previous_booking_system);

      _.each(this.customerList, (customer, idx) => {
        customer.idx = idx;
      });
      this.selectAll();

      if (_.keys(this.ssPrices).length) {

        let
            membershipCount = 0,
            ignoredMembershipCount = 0,
            invalidMembershipTypes = 0,
            classPassCount = 0,
            eventSignupCount = 0,
            unknownMembershipTypeCount = 0;

        this.ssMembershipsCSV.forEach((membership, membershipIdx) => {

          /*if (membership.LastPaid === 'NULL') {
            console.log('Skipping membership because LastPaid == "NULL"', membership)
            ignoredMembershipCount++
            return
          }*/
          const LastPaid = this.decodeUsDateTimeToDate(membership.LastPaid);
          const StartDate = this.decodeUsDateTimeToDate(membership.StartDate);
          const EndDate = this.decodeUsDateTimeToDate(membership.EndDate);
          /*if (LastPaid === 'Invalid date') {
            console.log('Skipping membership because LastPaid is Invalid date', membership)
            invalidMembershipTypes++
            return
          }
          if (LastPaid.localeCompare('2020-07-01') < 0) {
            console.log('Skipping membership because LastPaid is before 2020-07-01', membership)
            ignoredMembershipCount++
            return
          }*/
          const ssMembershipType = _.find(this.ssPrices, { ID: membership.MembershipTypeID });

          if (!ssMembershipType) {
            console.log('this.ssPrices:', this.ssPrices);
            console.error('Could not find membership type with ID ', membership.MembershipTypeID);
            invalidMembershipTypes++;
            return;
          }

          let yogoObjectId = ssMembershipType.matchingYogoObjectId;

          if (!yogoObjectId) {
            console.log('No matching yogo object for membership type ', ssMembershipType);
            invalidMembershipTypes++;
            return;
          }
          const ssCustomerId = membership.CustomerID;

          if (yogoObjectId.substr(0, 16) === 'class_pass_type_') {

            classPassCount++;

            const yogoClassPassTypeId = yogoObjectId.substr(16);

            const yogoClassPassType = this.yogoClassPassTypes.find(classPassType => parseInt(classPassType.id) === parseInt(yogoClassPassTypeId));
            const classPass = {
              class_pass_type: yogoClassPassType.id,
              classPassTypeName: yogoClassPassType.name,
              classPassTypePassType: yogoClassPassType.pass_type,
              classes_left: (membership.ClipsLeft && membership.ClipsLeft !== 'NULL')
                  ? parseInt(membership.ClipsLeft)
                  : 0,
              valid_until: EndDate,
              start_date: StartDate,
            };

            _.find(this.customerList, ['id_in_previous_booking_system', ssCustomerId])
                .class_passes
                .push(classPass);

          } else if (yogoObjectId.substr(0, 16) === 'membership_type_') {

            membershipCount++;

            const yogoMembershipTypeId = yogoObjectId.substr(16);

            const yogoMembershipType = _.find(this.yogoMembershipTypes, ['id', parseInt(yogoMembershipTypeId)]);

            const membershipToCreate = {
              membership_type: yogoMembershipType.id,
              membershipTypeName: yogoMembershipType.name,
              paid_until: moment.tz(LastPaid, 'YYYY-MM-DD', 'Europe/Copenhagen')
                  .subtract(1, 'day')
                  .format('YYYY-MM-DD'),
              start_date: moment.tz(StartDate, 'YYYY-MM-DD', 'Europe/Copenhagen')
                  .format('YYYY-MM-DD'),
            };

            const contractHoldPeriods = _.filter(this.ssOnHoldPeriodsCSV, { MembershipID: membership.ID });
            if (contractHoldPeriods.length) {
              console.log('contractHoldPeriods:', contractHoldPeriods);
              _.each(contractHoldPeriods, (holdPeriod) => {
                holdPeriod.isoStartDate = this.decodeUsDateTimeToDate(holdPeriod.PeriodStart);
                holdPeriod.isoEndDate = this.decodeUsDateTimeToDate(holdPeriod.PeriodEnd);
              });
              const todayIso = moment.tz('Europe/Copenhagen').format('YYYY-MM-DD');

              const currentHoldPeriods = _.filter(
                  contractHoldPeriods,
                  period => period.isoStartDate <= todayIso && period.isoEndDate >= todayIso,
              );
              console.log('currentHoldPeriods:', currentHoldPeriods);
              if (currentHoldPeriods.length > 1) {
                throw new Error('More than one active hold period for membership ' + membership.ID);
              }

              if (currentHoldPeriods.length === 1) {
                membershipToCreate.paid_until = currentHoldPeriods[0].isoEndDate;
                membershipToCreate.holdPeriodActive = true;
              }
              console.log('membershipToCreate.paid_until:', membershipToCreate.paid_until);
            }

            _.find(this.customerList, ['id_in_previous_booking_system', ssCustomerId])
                .memberships
                .push(membershipToCreate);


          } else if (yogoObjectId.substr(0, 6) === 'event_') {

            eventSignupCount++;

            const yogoEventId = parseInt(yogoObjectId.substr(6));
            console.log('yogoEventId:', yogoEventId);
            const yogoEvent = _.find(this.yogoEvents, { id: yogoEventId });
            console.log(yogoEvent);

            const eventSignup = {
              event: yogoEvent.id,
              eventName: yogoEvent.name,
            };
            _.find(this.customerList, ['id_in_previous_booking_system', ssCustomerId])
                .event_signups
                .push(eventSignup);
          } else {
            unknownMembershipTypeCount++;
          }
        });

        /*_.each(this.customerList, customer => {
          if (customer.memberships.length > 1) {
            const ignoreCount = customer.memberships.length - 1;
            ignoredMembershipCount = ignoredMembershipCount + ignoreCount;
            membershipCount = membershipCount - ignoreCount;
            console.log('Customer has more than one membership:', _.cloneDeep(customer));
            customer.memberships = _.sortBy(customer.memberships, 'paid_until')
                .slice(customer.memberships.length - 1);
            console.log('Customer now has one membership:', customer);

          }
        });*/

        console.log('Class pass count: ', classPassCount);
        console.log('Membership count: ', membershipCount);
        console.log('Invalid membership type count: ', invalidMembershipTypes);
        console.log('Ignored membership count: ', ignoredMembershipCount);
        console.log('Event signup count (currently ignored): ', eventSignupCount);
        console.log('Unknown membership type count: ', unknownMembershipTypeCount);
        console.log(
            'Total number of memberships processed: ',
            classPassCount +
            membershipCount +
            invalidMembershipTypes +
            ignoredMembershipCount +
            eventSignupCount +
            unknownMembershipTypeCount,
        );
        console.log('Imported CSV contains ' + this.ssMembershipsCSV.length + ' memberships');
      }


      if (this.ssClassSignupsCSV.length) {
        console.log('calculating class signups');
        let skippedSignupCount = 0;
        const today = moment.tz('Europe/Copenhagen');
        _.each(this.ssClassSignupsCSV, ssClassSignup => {

          const ssClassDate = moment(ssClassSignup.TeamDate)
              .tz('Europe/Copenhagen');
          if (ssClassDate.isBefore(today, 'day')) {
            console.log('Skipping signup because it is earlier than today');
            skippedSignupCount += 1;
            return;
          }

          const ssClassDateTime = ssClassDate.format('YYYY-MM-DD HH:mm');
          const ssClassType = this.ssClassTypes[ssClassSignup.TeamName];
          if (!ssClassType) {
            console.log('The class type ' + ssClassSignup.TeamName + ' is not mapped to a YOGO class type. Skipping signup.');
            skippedSignupCount += 1;
            return;
          }
          const ssClassYogoClassTypeId = ssClassType.yogoClassTypeId;

          console.log(ssClassDateTime, ssClassYogoClassTypeId);
          const yogoClass = this.yogoClasses.find(
              yogoClassItem => yogoClassItem.date + ' ' + yogoClassItem.start_time === ssClassDateTime &&
                  yogoClassItem.class_type.id === ssClassYogoClassTypeId,
          );

          if (!yogoClass) {
            console.error('Could not find a class for signup: ', ssClassSignup);
            return;
          }
          const customer = _.find(this.customerList, ['id_in_previous_booking_system', ssClassSignup.CustomerID]);
          if (!customer) {
            console.error('Trying to add class signup, but could not find customer with ID ' + ssClassSignup.CustomerID, 'Class signup:', ssClassSignup);
            return;
          }
          let yogoAccessObjectId = null;

          let yogoAccessObject;

          if (customer.memberships && customer.memberships.length) {

            yogoAccessObjectId = 'membership_type_' + customer.memberships[0].membership_type;
            yogoAccessObject = _.find(this.yogoMembershipTypes, { id: customer.memberships[0].membership_type });

          } else if (customer.class_passes && customer.class_passes.length) {

            yogoAccessObjectId = 'class_pass_type_' + customer.class_passes[0].class_pass_type;
            yogoAccessObject = _.find(this.yogoClassPassTypes, { id: customer.class_passes[0].class_pass_type });

          }

          console.log(yogoAccessObjectId, yogoAccessObject);

          customer.class_signups = customer.class_signups || [];
          customer.class_signups.push({
            'class': yogoClass.id,
            accessObjectId: yogoAccessObjectId || undefined,
            accessObjectName: yogoAccessObject ? yogoAccessObject.name : undefined,
            yogoClass: yogoClass,
          });
        });
        console.log('Skipped ' + skippedSignupCount + ' signups because class type wasn\'t mapped');
      }

      this.emailDuplicates = Array(this.customerList.length);
      this.calculateEmailDuplicates();

    },

    async customersFileChanged(event) {
      console.log('customersFileChanged');
      this.ssCustomersCSV = await this.readAndParseCsvFile(
          event.target.files[0],
          { delimiter: ';' },
          {
            readAsText: true,
            charset: 'iso-8859-1',
          },
      );
      console.log(this.ssCustomersCSV);
    },

    async membershipTypesFileChanged(event) {
      console.log('membershipTypesFileChanged');
      let n = 0;
      this.ssMembershipTypesCSV = await this.readCsvFile(event.target.files[0],
          { delimiter: ';' },
          {
            readAsText: true,
            charset: 'iso-8859-1',
          },
      );

      this.calculateSsPrices();

    },

    calculateSsPrices() {
      this.ssPrices = this.ssMembershipTypesCSV;

      if (this.ssMembershipsCSV.length) {
        this.ssPrices = _.filter(
            this.ssPrices,
            ssPriceItem => !!_.find(this.ssMembershipsCSV, { MembershipTypeID: ssPriceItem.ID }),
        );
      }

      this.ssPrices = _.sortBy(this.ssPrices, 'MembershipName');

      console.log(this.ssPrices);
    },

    async membershipsFileChanged(event) {
      console.log('membershipsFileChanged');
      if (!this.ssMembershipTypesCSV) {
        alert('Venligst indlæs medlemskabstyper først');
        return;
      }
      this.ssMembershipsCSV = (await this.readCsvFile(event.target.files[0],
          { delimiter: ';' },
          {
            readAsText: true,
            charset: 'iso-8859-1',
          },
      ));
      console.log(this.ssMembershipsCSV);

      this.filterSsMemberships();

      this.calculateSsPrices();
    },

    filterSsMemberships() {
      this.ssMembershipsCSV = _.filter(
          this.ssMembershipsCSV,
          (ssMembership) => {

            const ssMembershipType = _.find(this.ssMembershipTypesCSV, { ID: ssMembership.MembershipTypeID });
            const endDate = moment.tz(ssMembership.EndDate, 'M/D/YYYY HH:mm:ss A', 'Europe/Copenhagen');
            const customer = _.find(this.ssCustomersCSV, { ID: ssMembership.CustomerID });
            console.log(ssMembershipType, customer);
            console.log('Checking ssMembership ID ' + ssMembership.ID + ' for customer ' + customer.ID + ' ' + customer.Name + ' ' + customer.LastName);

            console.log('ssMembershipType.MembershipTypeType:', ssMembershipType.MembershipTypeType);

            switch (ssMembershipType.MembershipTypeType) {
              case '3':
                if (ssMembership.ClipsLeft < 1 ||
                    endDate.isBefore(moment.tz('Europe/Copenhagen'), 'day')
                ) {
                  console.log('Removing klippekort ID ' + ssMembership.ID + ', type ID ' + ssMembership.MembershipTypeID + ', ' + ssMembershipType.MembershipName + ', ending ' + endDate.format('YYYY-MM-DD') + ' with ' + ssMembership.ClipsLeft + ' classes left');
                  return false;
                }
                break;
              case '2':
                if (endDate.isBefore(moment.tz('Europe/Copenhagen'), 'day')) {
                  console.log('Removing running membership ID ' + ssMembership.ID + ', type ID ' + ssMembership.MembershipTypeID + ', ' + ssMembershipType.MembershipName + ', ending ' + endDate.format('YYYY-MM-DD'));
                  return false;
                }
                break;
              case '1':
                if (endDate.isBefore(moment.tz('Europe/Copenhagen')
                    .subtract(3, 'months'), 'day')) {
                  console.log('Removing single payment membership ID ' + ssMembership.ID + ', type ID ' + ssMembership.MembershipTypeID + ', ' + ssMembershipType.MembershipName + ', ending ' + endDate.format('YYYY-MM-DD'));
                  return false;
                }
                break;
              default:
                alert('Unknown MembershipTypeType: ' + ssMembershipType.MembershipTypeType);
                break;
            }
            return true;
          },
      );
    },

    async onHoldPeriodsFileChanged(event) {
      console.log('onHoldPeriodsFileChanged');
      this.ssOnHoldPeriodsCSV = (await this.readCsvFile(event.target.files[0],
          { delimiter: ';' },
          {
            readAsText: true,
            charset: 'iso-8859-1',
          }));
      console.log(this.ssOnHoldPeriodsCSV);
    },

    /*async accountTransactionsFileChanged(event) {
      console.log('accontTransactionsFileChanged')
      this.ssAccountTransactionsCSV = (await this.readCsvFile(event.target.files[0]))
      console.log(this.ssAccountTransactionsCSV)
    },*/

    async teamBookingsFileChanged(event) {
      this.ssClassSignupsCSV = (await this.readCsvFile(event.target.files[0],
          { delimiter: ';' },
          {
            readAsText: true,
            charset: 'iso-8859-1',
          },
      ));
      console.log(this.ssClassSignupsCSV);
      this.updateSsClassTypes();
    },


    updateSsClassTypes() {
      this.ssClassTypes = _.chain(this.ssClassSignupsCSV)
          .filter((classSignup) => {
            const classDate = moment.tz(classSignup.TeamDate, 'M/D/YYYY HH:mm:ss A', 'Europe/Copenhagen');
            console.log(classDate.format('YYYY-MM-DD HH:mm:ss'));
            const isTodayOrLater = classDate.isSameOrAfter(moment.tz('Europe/Copenhagen'), 'day');
            if (isTodayOrLater) {
              console.log('isTodayOrLater', isTodayOrLater);
            }
            return isTodayOrLater;
          })
          .map('TeamName')
          .uniq()
          .sortBy()
          .keyBy()
          .mapValues(() => {
            return { yogoClassTypeId: null };
          })
          .value();
    },


    async readCsvFile(file) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = e => {
          console.log('csv file read');
          const data = e.target.result;
          console.log('file data:', data);
          csvParser(
              data,
              {
                columns: true,
                delimiter: ';',
              },
              (err, csvData) => {
                console.log('err, csvData:', err, csvData);
                if (err) return reject(err);
                resolve(csvData);
              },
          );
        };
        fileReader.readAsText(file, 'iso-8859-1');
      });
    },

    autoMatchSsObjectsToYogoObjects(ssObjects, ssObjectPropertyName, yogoObjects) {
      _.each(ssObjects, (ssObject, ssObjectName) => {
        const ssObjectNameLC = ssObjectName.toLowerCase();

        let matchingYogoObject = _.find(yogoObjects, yogoObject => {
          const yogoObjectNameLC = yogoObject.name.toLowerCase();
          return ssObjectNameLC === yogoObjectNameLC;
        });

        if (!matchingYogoObject) {
          matchingYogoObject = _.find(yogoObjects, yogoObject => {
            const yogoObjectNameLC = yogoObject.name.toLowerCase();
            return ssObjectNameLC.indexOf(yogoObjectNameLC) > -1 ||
                yogoObjectNameLC.indexOf(ssObjectNameLC) > -1;
          });
        }
        ssObject[ssObjectPropertyName] = matchingYogoObject ? matchingYogoObject.id : null;
      });
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


    savePricingOptions() {
      window.localStorage.setItem('importPricingOptionsMapping', JSON.stringify(this.ssPrices));
      //window.localStorage.setItem('importClassTypesMapping', JSON.stringify(this.ssClassTypes))
      alert('Pricing options saved');
    },

    loadPricingOptions() {
      const persistedPrices = JSON.parse(window.localStorage.getItem('importPricingOptionsMapping'));
      _.each(this.ssPrices, (ssPrice) => {
        console.log('ssPrice:', ssPrice);
        const persistedPrice = _.find(persistedPrices, {ID: ssPrice.ID});
        if (persistedPrice) {
          console.log('persistedPrice:', persistedPrice);
          this.$set(ssPrice, 'matchingYogoObjectId', persistedPrice.matchingYogoObjectId);
          return;
        }
      });

      alert('Pricing options loaded');
    },

    saveClassTypes() {
      window.localStorage.setItem('importClassTypesMapping', JSON.stringify(this.ssClassTypes));
      alert('Class types saved');
    },

    loadClassTypes() {
      const persistedClassTypes = JSON.parse(window.localStorage.getItem('importClassTypesMapping'));
      _.each(this.ssClassTypes, (ssClassType, ssClassTypeName) => {
        const persistedClassType = persistedClassTypes[ssClassTypeName];
        if (persistedClassType) {
          this.$set(ssClassType, 'yogoClassTypeId', persistedClassType.yogoClassTypeId);
          return;
        }
      });
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
  background: red;
}

</style>
