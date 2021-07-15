<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>Import</h2>

      <loading-animation v-if="loading"/>

      <div v-else>
        <div class="flex--row">
          <div class="flex--25">
            <label>Kunder og bookinger</label>
            <input type="file" @change="customerListFileChanged">
          </div>
        </div>


        <!--<table v-if="showPricingOptionsMap" class="mapping-table flex--50">
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
        </table>-->


        <!--<table v-if="showClassTypesMap" class="mapping-table flex--50">
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
        </table>-->

        <!--<table v-if="mboClasses.length" class="mapping-table flex--50">
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
        </table>-->

        <div class="space4"></div>

        <md-button class="md-raised md-primary" @click="calculateCustomerList">Beregn importliste
        </md-button>

        <div class="space4"></div>

        <div v-if="customerList.length">
          <table>
            <tr>
              <th>
                <button type="button" @click="deselectCustomersWithoutEmail">Deselect customers
                  without email
                </button>
                <button type="button" @click="deselectInactiveCustomers">Deselect inactive
                  customers
                </button>
                <button type="button" @click="saveCustomerSelectionAndPricingOptions">Save
                  selections
                </button>
                <button type="button" @click="loadCustomerSelectionAndPricingOptions">Load
                  selections
                </button>
              </th>
              <th>
                Email
              </th>
              <th>
                Fornavn
              </th>
              <th>
                Efternavn
              </th>
              <th>
                Adresse
              </th>
              <th>
                Postnummer
              </th>
              <th>
                By
              </th>
              <th>
                Land
              </th>
              <th>
                Telefon
              </th>
              <!--<th>
                Adgang
              </th>
              <th>
                Tilmelding klasser
              </th>
              <th>
                Tilmelding events
              </th>-->
              <th>
                Gecko ID
              </th>
              <!--<th>
                Oprettet
              </th>-->
            </tr>
            <tr v-for="(customer, idx) in customerList" class="customer"
                :class="{selected: selectedCustomers[idx], duplicate: emailDuplicates[idx]}">
              <td>
                <input @click.stop="toggleRowSelection(idx)" :checked="selectedCustomers[idx]"
                       type="checkbox">
              </td>
              <td>
                {{ customer.email }}
              </td>
              <td>
                {{ customer.first_name }}
              </td>
              <td>
                {{ customer.last_name }}
              </td>
              <td>
                {{ customer.address_1 }}
              </td>
              <td>
                {{ customer.zip_code }}
              </td>
              <td>
                {{ customer.city }}
              </td>
              <td>
                {{ customer.country }}
              </td>
              <td>
                {{ customer.phone }}
              </td>
              <!--<td>
                <div v-for="classPass in customer.class_passes" class="access-item">
                  {{ classPass.classPassTypeName }}<br>
                  <span
                    v-if="classPass.classPassTypePassType === 'fixed_count'">{{ classPass.classes_left }} klip tilbage<br></span>
                  Gyldig t.o.m. {{ classPass.valid_until }}
                </div>
                <div v-for="membership in customer.memberships" class="access-item">
                  {{ membership.membershipTypeName }}<br>
                  Betalt t.o.m. {{ membership.paid_until }}
                </div>
              </td>
              <td>
                <div v-for="signup in customer.class_signups" class="signup">
                  {{ signup.yogoClass.date }} <br>
                  kl. {{ signup.yogoClass.start_time }}-{{signup.yogoClass.end_time}}<br>
                  {{ signup.yogoClass.class_type.name}}<br>
                  ({{ signup.accessObjectName }})
                </div>
              </td>
              <td>
                <div v-for="eventSignup in customer.event_signups" class="event-signup">
                  {{ eventSignup.eventName }}
                </div>
              </td>-->
              <td>
                {{ customer.id_in_previous_booking_system }}
              </td>
              <!--<td>
                {{ customer.createdAt }}
              </td>-->
            </tr>
          </table>

        </div>

      </div>

      <md-button class="md-raised md-primary" @click="doImport">Importer</md-button>
      <div class="space8"></div>

      <hr>

      <div class="space8"></div>
      <h2>Nulstil import</h2>
      <div>
        <md-button class="md-raised md-primary" @click="resetImport">Nulstil import (BRUG MED
          OMTANKE!!)
        </md-button>
      </div>

      <hr>

      <div class="space8"></div>
      <h2>Emails</h2>
      <div>
        <md-button class="md-raised md-primary" @click="sendWelcomeSetPasswordEmailsToCustomers">
          Send emails til kunder
          med link til at sætte adgangskode
        </md-button>
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
          </td>
        </tr>
      </table>

    </div>

  </div>


</template>

<script>

  import SettingsSubMenu from './SettingsSubMenu'
  import LoadingAnimation from './LoadingAnimation'

  import YogoApi from '@/gateways/YogoApi'
  import { mapGetters } from 'vuex'

  import moment from 'moment'
  import qs from 'qs'

  import csvParser from 'csv-parse'

  export default {
    components: {
      LoadingAnimation,
      SettingsSubMenu,
    },
    data() {
      return {
        loading: false,

        customerList: [],

        geckoCustomerList: '',
        selectedCustomers: [],

        customerListToggleState: true,

        geckoClassPassesCSV: [],
        mboPricingOptions: {},

        yogoClassPassTypes: [],

        mboClassSignupsXLS: [],
        mboClassTypes: {},

        yogoClasses: [],

        yogoMembershipTypes: [],

        yogoEvents: [],

        resetPasswordCustomers: [],

      }
    },
    async mounted() {

      this.yogoClassPassTypes = await YogoApi.get('/class-pass-types')

      const classQuery = {
        startDate: moment()
          .format('YYYY-MM-DD'),
        endDate: moment()
          .add(6, 'month')
          .format('YYYY-MM-DD'),
        populate: ['class_type'],
      }
      const yogoClassesResponse = await YogoApi.get('/classes?' + qs.stringify(classQuery))
      this.yogoClasses = yogoClassesResponse.classes

      this.yogoMembershipTypes = await YogoApi.get('/membership-types')
      this.yogoEvents = await YogoApi.get('/events')
    },

    computed: {
      ...mapGetters([
        'client',
      ]),

      emailDuplicates() {
        let duplicates = {}
        for (let i = 0; i < this.customerList.length; i++) {
          const item = this.customerList[i]
          if (!this.selectedCustomers[i]) continue

          if (duplicates[item.email]) {
            duplicates[item.email]++
          } else {
            duplicates[item.email] = 1
          }
        }

        duplicates = _.pickBy(duplicates, value => value >= 2)

        let emailDuplicates = []
        this.customerList.forEach(
          (item, idx) => {
            emailDuplicates[idx] = !!(this.selectedCustomers[idx] && duplicates[item.email])
          },
        )

        return emailDuplicates
      },

      /*mboClasses() {

        return _
          .chain(this.mboClassSignupsXLS)
          .uniqBy(row => row.Date + row.Time + row.Type)
          .map(row => {
            const yogoClassTypeId = this.mboClassTypes[row.Type] ? this.mboClassTypes[row.Type].yogoClassTypeId : null

            return {
              date: row.Date,
              start_time: row.Time,
              classTypeName: row.Type,
              hasMatchingYogoClass: yogoClassTypeId &&
                _.find(
                  this.yogoClasses,
                  yogoClass =>
                    yogoClass.date === row.Date &&
                    yogoClass.start_time === row.Time &&
                    yogoClass.class_type.id == yogoClassTypeId,
                ),
            }
          })
          .sortBy(['date', 'start_time'])
          .value()

      },*/

      /*yogoClassTypes() {
        return _
          .chain(this.yogoClasses)
          .map('class_type')
          .uniqBy('id')
          .value()
      },
      showPricingOptionsMap() {
        return !!_.keys(this.mboPricingOptions).length
      },
      showClassTypesMap() {
        return !!_.keys(this.mboClassTypes).length
      },
      showMissingClassesTable() {
        return !!this.mboClasses.length
      },*/
    },
    watch: {
      /*customerListToggleState: function (state) {
        this.resetSelection(state)
      },

      mboClassPassesXLS() {
        this.updateMboPricingOptions()
      },
      mboClassSignupsXLS() {
        this.updateMboPricingOptions()
        this.updateMboClassTypes()
      },*/
    },
    methods: {

      calculateCustomerList() {
        this.customerList = _.chain(this.geckoCustomerList)
          .uniqBy('CustomerId')
          .map(geckoCustomer => {

            const nameParts = geckoCustomer.CustomerName.trim()
              .split(' ')

            return {
              email: geckoCustomer.CustomerEmail,
              first_name: nameParts.length > 1 ?
                nameParts.slice(0, nameParts.length - 1)
                  .join(' ') :
                nameParts[0],
              last_name: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
              address_1: geckoCustomer.CustomerAddress,
              zip_code: geckoCustomer.CustomerPostalCode,
              city: geckoCustomer.CustomerCity,
              country: 'DK',
              phone: geckoCustomer.CustomerMobile ? geckoCustomer.CustomerMobile : geckoCustomer.CustomerTelephone,
              //createdAt: moment.tz(geckoCustomer.CustomerCreatedDate, 'DD/MM/YYYY HH:mm', 'Europe/Copenhagen').format('x'),
              id_in_previous_booking_system: geckoCustomer.CustomerId,
              memberships: [],
              class_passes: [],
              class_signups: [],
              event_signups: [],
            }

          })
          .sortBy(['first_name', 'last_name'])
          .value()

        /*if (_.keys(this.mboPricingOptions).length) {
          this.geckoClassPassesCSV.forEach(row => {
            const mboPricingOptionName = row['Pricing option']
            const mboPricingOption = this.mboPricingOptions[mboPricingOptionName]
            if (!mboPricingOption) return

            let yogoObjectId = mboPricingOption.matchingYogoObjectId

            if (!yogoObjectId) return
            const mboCustomerId = row['Client ID']

            if (yogoObjectId.substr(0, 16) === 'class_pass_type_') {

              const yogoClassPassTypeId = yogoObjectId.substr(16)

              const yogoClassPassType = this.yogoClassPassTypes.find(classPassType => parseInt(classPassType.id) === parseInt(yogoClassPassTypeId))
              const classPass = {
                class_pass_type: yogoClassPassType.id,
                classPassTypeName: yogoClassPassType.name,
                classPassTypePassType: yogoClassPassType.pass_type,
                classes_left: row['Unbooked'],
                valid_until: row['Last Expiration Date'],
                start_date: row['First Activation Date'],
              }

              _.find(this.customerList, customer => customer.mboId == mboCustomerId)
                .class_passes
                .push(classPass)

            } else if (yogoObjectId.substr(0, 16) === 'membership_type_') {

              const yogoMembershipTypeId = yogoObjectId.substr(16)
              const yogoMembershipType = this.yogoMembershipTypes.find(membershipType => parseInt(membershipType.id) === parseInt(yogoMembershipTypeId))

              const membership = {
                membership_type: yogoMembershipType.id,
                membershipTypeName: yogoMembershipType.name,
                paid_until: row['Last Expiration Date'],
                start_date: row['First Activation Date'],
              }
              _.find(this.customerList, customer => customer.mboId == mboCustomerId)
                .memberships
                .push(membership)

            } else if (yogoObjectId.substr(0, 6) === 'event_') {

              const yogoEventId = yogoObjectId.substr(6)
              const yogoEvent = this.yogoEvents.find(event => parseInt(event.id) === parseInt(yogoEventId))

              const eventSignup = {
                event: yogoEvent.id,
                eventName: yogoEvent.name,
              }
              _.find(this.customerList, customer => customer.mboId == mboCustomerId)
                .event_signups
                .push(eventSignup)
            }


          })
        }*/

        /*if (this.mboClassSignupsXLS.length) {
          _.each(this.mboClassSignupsXLS, mboClassSignup => {

            const yogoClass = this.yogoClasses.find(
              yogoClassItem => yogoClassItem.date === mboClassSignup.Date &&
                yogoClassItem.start_time === mboClassSignup.Time &&
                yogoClassItem.class_type.id === this.mboClassTypes[mboClassSignup.Type].yogoClassTypeId,
            )

            if (!yogoClass) return
            const customer = _.find(this.customerList, customer => customer.mboId === mboClassSignup['Client ID'])
            if (!customer) {
              console.log('Could not find customer with ID ' + mboClassSignup['Client ID'] + '!!')
              return
            }
            let yogoAccessObjectId = this.mboPricingOptions[mboClassSignup['Pricing Option']].matchingYogoObjectId
            if (!yogoAccessObjectId) return
            let yogoAccessObject

            if (yogoAccessObjectId.substr(0, 16) === 'membership_type_') {

              if (yogoAccessObjectId === 'membership_type_x') {
                if (!customer.memberships || !customer.memberships[0]) return
                yogoAccessObjectId = 'membership_type_' + customer.memberships[0].membership_type
              }
              yogoAccessObject = this.yogoMembershipTypes.find(membershipType => parseInt(membershipType.id) === parseInt(yogoAccessObjectId.substr(16)))

            } else if (yogoAccessObjectId.substr(0, 16) === 'class_pass_type_') {
              yogoAccessObject = this.yogoClassPassTypes.find(classPassType => parseInt(classPassType.id) === parseInt(yogoAccessObjectId.substr(16)))
            } else {
              return
            }

            customer.class_signups = customer.class_signups || []
            customer.class_signups.push({
              'class': yogoClass.id,
              accessObjectId: yogoAccessObjectId,
              accessObjectName: yogoAccessObject.name,
              yogoClass: yogoClass,
            })
          })
        }*/

      },

      async customerListFileChanged(event) {

        this.geckoCustomerList = await this.readAndParseCsvFile(event.target.files[0])

        this.geckoCustomerList = _.sortBy(this.geckoCustomerList, 'CustomerId')

        this.resetSelection(true)

      },

      /*async classPassFileChanged(event) {

        this.mboClassSignupsXLS = (await this.readExcelFile(event.target.files[0]))
          .slice(0, -1) // Remove summary row
          .map(row => {
            row.Date = this.momentFromSerializedExcelDate(row.Date)
              .format('YYYY-MM-DD')
            row.Time = row.Time.trim()
            row.Type = row.Type.trim()
            row['Pricing Option'] = row['Pricing Option'].trim()
            return row
          })

      },*/

      /*async classPassFileChanged(event) {

        this.geckoClassPassesCSV = await this.readAndParseCsvFile(event.target.files[0], {}, {readAsText: true})

      },*/

      async readAndParseCsvFile(file, csvOptions, fileReaderOptions) {
        return new Promise((resolve, reject) => {
          const defaultCsvOptions = {
            delimiter: ';',
            columns: true,
          }
          csvOptions = csvOptions || {}
          csvOptions = _.assign(defaultCsvOptions, csvOptions)

          const fileReader = new FileReader()
          fileReader.onload = e => {
            const fileCsvContent = e.target.result
            const parser = csvParser(csvOptions)
            const result = []

            parser.on('readable', () => {
              let record = parser.read()
              while (record) {
                result.push(record)
                record = parser.read()
              }
            })
            parser.on('error', function (err) {
              console.error(err.message)
            })
            parser.on('end', () => {
              console.log('Parsing CSV: END')
              console.log('CSV:', result)
              resolve(result)
            })
            parser.write(fileCsvContent)
            parser.end()

          }
          if (fileReaderOptions && fileReaderOptions.readAsText) {
            fileReader.readAsText(file)
          } else {
            fileReader.readAsBinaryString(file)
          }
        })

      },

      /*updateMboPricingOptions() {
        this.mboPricingOptions = _
          .chain(this.geckoClassPassesCSV)
          .map('Pricing option')
          .concat(
            _.map(this.mboClassSignupsXLS, 'Pricing Option'),
          )
          .uniq()
          .sortBy()
          .keyBy()
          .mapValues(() => {
            return { matchingYogoObjectId: null }
          })
          .value()

        //this.autoMatchMboObjectsToYogoObjects(this.mboPricingOptions, 'yogoClassPassTypeId', this.yogoClassPassTypes)

      },

      updateMboClassTypes() {

        this.mboClassTypes = _
          .chain(this.mboClassSignupsXLS)
          .map('Type')
          .uniq()
          .sortBy()
          .keyBy()
          .mapValues(() => {
            return { yogoClassTypeId: null }
          })
          .value()

        this.autoMatchMboObjectsToYogoObjects(this.mboClassTypes, 'yogoClassTypeId', this.yogoClassTypes)
      },*/





      /*async readExcelFile(file) {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = e => {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const first_sheet_name = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[first_sheet_name]
            resolve(XLSX.utils.sheet_to_json(worksheet))
          }
          fileReader.readAsArrayBuffer(file)
        })
      },

      autoMatchMboObjectsToYogoObjects(mboObjects, mboObjectPropertyName, yogoObjects) {
        _.each(mboObjects, (mboObject, mboObjectName) => {
          const mboObjectNameLC = mboObjectName.toLowerCase()

          let matchingYogoObject = _.find(yogoObjects, yogoObject => {
            const yogoObjectNameLC = yogoObject.name.toLowerCase()
            return mboObjectNameLC === yogoObjectNameLC
          })

          if (!matchingYogoObject) {
            matchingYogoObject = _.find(yogoObjects, yogoObject => {
              const yogoObjectNameLC = yogoObject.name.toLowerCase()
              return mboObjectNameLC.indexOf(yogoObjectNameLC) > -1 ||
                yogoObjectNameLC.indexOf(mboObjectNameLC) > -1
            })
          }
          mboObject[mboObjectPropertyName] = matchingYogoObject ? matchingYogoObject.id : null
        })
      },*/

      toggleRowSelection(idx) {
        this.$set(this.selectedCustomers, idx, !this.selectedCustomers[idx])
      },

      resetSelection(state) {
        if (typeof state === 'undefined') {
          state = true
        }
        this.selectedCustomers = this.geckoCustomerList.map(mboCustomer => state)
      },

      deselectCustomersWithoutEmail() {
        for (var i = 0; i < this.customerList.length; i++) {

          if (!this.customerList[i].email.trim()) {
            this.selectedCustomers[i] = false
          }

        }
        this.$forceUpdate()
      },

      deselectInactiveCustomers() {
        for (var i = 0; i < this.customerList.length; i++) {
          if (!this.geckoClassPassesCSV.find(
            row => row['Client ID'] == this.customerList[i].mboId,
          )) {
            this.selectedCustomers[i] = false
          }
        }
        this.$forceUpdate()
      },

      saveCustomerSelectionAndPricingOptions() {
        window.localStorage.setItem('importCustomerSelection', JSON.stringify(this.selectedCustomers))
        window.localStorage.setItem('importPricingOptionsMapping', JSON.stringify(this.mboPricingOptions))
        window.localStorage.setItem('importClassTypesMapping', JSON.stringify(this.mboClassTypes))
        alert('Selections saved')
      },

      loadCustomerSelectionAndPricingOptions() {
        this.selectedCustomers = JSON.parse(window.localStorage.getItem('importCustomerSelection'))
        this.mboPricingOptions = JSON.parse(window.localStorage.getItem('importPricingOptionsMapping'))
        this.mboClassTypes = JSON.parse(window.localStorage.getItem('importClassTypesMapping'))
        alert('Selections loaded')
      },

      formatZipCode(zipCode) {
        return zipCode.replace(/DK-|DK/, '')
      },

      formatPhone(phone) {
        if (phone.match(/^\d{8}$/)) return phone
        let potentialDanishNumber = phone.replace(/[ -]/, '')
        if (potentialDanishNumber.match(/\+?45\d{8}/)) {
          return potentialDanishNumber.substr(potentialDanishNumber.length - 8)
        }
        return phone
      },
      momentFromSerializedExcelDate(serializedExcelDate) {
        return moment('1900-01-01')
          .add(serializedExcelDate - 2, 'days')
      },
      dateDDMMYYYYToYYYYMMDD(inputDate) {
        return inputDate.substr(6) + '-' + inputDate.substr(3, 2) + '-' + inputDate.substr(0, 2)
      },
      async doImport() {
        this.loading = true

        if (this.emailDuplicates.find(item => item)) {
          this.loading = false
          alert('Der er duplikerede emailadresser i listen')
          return
        }

        const importCustomers = _.filter(this.customerList, (customer, idx) => this.selectedCustomers[idx])

        let importResponse
        try {
          importResponse = await YogoApi.post('/import/customers', { customers: importCustomers })
        } catch (e) {
          this.loading = false
          this.$nextTick(() => {
            alert('Api\'en giver følgende fejl: \n' + e.response.data)
          })
          return
        }

        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: 'Indstillingerne er opdateret',
        })

      },

      async resetImport() {
        if (!confirm('Er du helt sikker på at du vil slette alle\n- class_passes\n- class_signups\n- memberships\n- membership_logs\n- event-signups\n- alle brugere, der ikke er admins, undervisere eller checkin\n??????\nDette berører IKKE nødvendigvis KUN sidste import, men alle kunder i systemet!!')) return
        if (!confirm('Er du helt sikker? Kunder, adgangskort, medlemskaber og tilmeldinger til hold og events bliver slettet, ikke blot arkiveret. De kan ikke gendannes!')) return
        this.loading = true
        await YogoApi.post('/import/reset-import')
        this.loading = false

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: 'Importen er fjernet',
        })

      },

      async sendWelcomeSetPasswordEmailsToCustomers() {
        if (!confirm('Er du sikker på at du vil nulstille adgangskoder for ALLE kunder i systemet? (Admins og lærere bliver ikke nulstillet, heller ikke selvom de evt også er oprettet som kunder.)')) return

        this.resetPasswordCustomers = (await YogoApi.get('/users?customer=1'))
          .filter(customer => !customer.admin)

        await Promise.all(
          _.map(
            this.resetPasswordCustomers,
            async customer => {
              customer.sending_email = true
              await YogoApi.post(
                '/import/welcome-customer-reset-password',
                {
                  id: customer.id,
                },
              )
              customer.sending_email = false
              customer.email_sent = true
              this.$forceUpdate()
            },
          ),
        )

        alert('Færdig med at nulstille adgangskoder og sende emails.\n' + this.resetPasswordCustomers.length + ' kunder behandlet.')

      },
    },

  }

</script>

<style scoped lang="scss">

  table {
    border-collapse: collapse;
  }

  tr.selected {
    background: white;
  }

  tr.customer:not(.selected) {
    background: #999;
  }

  tr.duplicate {
    background: pink;
  }

  tr.awaiting-selection {
    background: pink;
  }

  th, td {
    border: 1px solid black;
    padding: 1px 4px;
    text-align: left;

  }

  .mapping-table {
    margin-bottom: 20px;
  }

  .access-item {
    border: 1px solid forestgreen;
    background: palegreen;
    white-space: nowrap;
    margin: 2px;
    padding: 2px 4px;
  }

  .signup {
    border: 1px solid cornflowerblue;
    background: aliceblue;
    white-space: nowrap;
    margin: 2px;
    padding: 2px 4px;
  }

  .event-signup {
    border: 1px solid orange;
    background: lightgoldenrodyellow;
    white-space: nowrap;
    margin: 2px;
    padding: 2px 4px;
  }


</style>
