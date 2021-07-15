<template>

</template>

<script>

  import qs from 'qs'
  import csvParser from 'csv-parse/lib'

  import YogoApi from '@/gateways/YogoApi'
  import moment from 'moment'
  import XLSX from 'xlsx';

  export default {
    name: 'SettingsImportBase',
    data() {
      return {
        loading: false,

        customerList: [],
        emailDuplicates: [],

        selectedCustomers: [],

        yogoMembershipTypes: [],

        yogoClassPassTypes: [],

        yogoClasses: [],

        yogoEvents: [],

      }
    },

    computed: {
      yogoClassTypes() {
        return _
          .chain(this.yogoClasses)
          .map('class_type')
          .uniqBy('id')
          .value()
      },
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

    methods: {
      calculateEmailDuplicates() {

        const emailDuplicates = new Array(this.emailDuplicates.length);

        _.fill(emailDuplicates, false)

        let list = _.filter(this.customerList, (customer, idx) => this.selectedCustomers[idx])

        list = _.groupBy(list, 'email')

        list = _.filter(list, grp => grp.length > 1)

        list = _.flatten(list);

        _.each(list,
          (customer) => {
            emailDuplicates[customer.idx] = true;
          }
        )

        _.each(emailDuplicates,
            (value, idx) => {
              if (this.emailDuplicates[idx] !== emailDuplicates[idx]) {
                this.$set(this.emailDuplicates, idx, emailDuplicates[idx]);
              }
            }
        )

        /*_.chain(this.customerList)
          .filter((customer, idx) => this.selectedCustomers[idx])
          .groupBy('email')
          .filter(grp => grp.length > 1)
          .flatten()
          .each((customer) => {
            this.$set(this.emailDuplicates, customer.idx, true)
          })
          .values()*/

      },

      deselectCustomersWithoutEmail() {
        console.log('deselectCustomersWithoutEmail')
        for (var i = 0; i < this.customerList.length; i++) {

          if (!this.customerList[i].email.trim()) {
            this.selectedCustomers[i] = false
          }

        }
        this.calculateEmailDuplicates()
        this.$forceUpdate()
      },


      resolveDuplicateEmails() {
        console.log('resolveDuplicateEmails');
        const duplicatedEmailRowGroups = _.chain(this.customerList)
          .filter(
            (customer, idx) => this.emailDuplicates[idx] && this.selectedCustomers[idx],
          )
          .groupBy('email')
          .value()

        console.log('duplicatedEmailRowGroups', duplicatedEmailRowGroups)


        _.each(duplicatedEmailRowGroups, rowGroup => {

          _.each(rowGroup, row => {
            row.combinedData = row.first_name + row.last_name + row.address_1 + row.zip_code + row.city + row.country + row.phone;
            row.combinedDataLength = row.combinedData.length;
          })

          let firstRowCombinedData = '';
          let firstRowIdx;

          const email = rowGroup[0].email

          const rowsWithAccessItems = _.filter(
            rowGroup,
            row => row.class_passes.length || row.memberships.length || row.class_signups.length || row.event_signups.length,
          )
          if (rowsWithAccessItems.length >= 1) {
            console.log(email + ' har mindst en adgang')
            _.each(rowGroup, row => {
              if (!row.class_passes.length && !row.memberships.length && !row.class_signups.length && !row.event_signups.length) {
                console.log('Fravælger række uden adgang')
                this.$set(this.selectedCustomers, row.idx, false);
                return;
              }
              if (!firstRowCombinedData) {
                firstRowCombinedData = row.combinedData;
                firstRowIdx = row.idx;
                return;
              }
              if (row.combinedData === firstRowCombinedData) {
                console.log('Overfører adgang til første række.')
                console.log(row.combinedData)
                this.customerList[firstRowIdx].class_passes.push(...row.class_passes);
                this.customerList[firstRowIdx].memberships.push(...row.memberships);
                this.customerList[firstRowIdx].class_signups.push(...row.class_signups);
                this.customerList[firstRowIdx].event_signups.push(...row.event_signups);
                this.$set(this.selectedCustomers, row.idx, false)
              }
            })
            return
          }
          console.log(email + ' har ingen adgang')


          const maxDataLength = Math.max(...(_.map(rowGroup, 'combinedDataLength')))
          _.each(rowGroup, row => {
            if (row.combinedDataLength < maxDataLength) {
              console.log('Fravælger række med kortest datalængde')
              this.$set(this.selectedCustomers, row.idx, false);
              return
            }
            if (!firstRowCombinedData) {
              firstRowCombinedData = row.combinedData;
              return;
            }
            if (row.combinedData === firstRowCombinedData) {
              console.log('Fravælger række som er identisk med første række');
              console.log(row.combinedData);
              this.$set(this.selectedCustomers, row.idx, false);
            }
          })


        })

        this.calculateEmailDuplicates()
      },

      saveCustomerSelection() {
        window.localStorage.setItem('importCustomerSelection', JSON.stringify(this.selectedCustomers))
        alert('Selections saved')
      },

      loadCustomerSelection() {
        this.selectedCustomers = JSON.parse(window.localStorage.getItem('importCustomerSelection'))
        this.calculateEmailDuplicates()
        alert('Selections loaded')
      },

      toggleRowSelection(idx) {
        this.$set(this.selectedCustomers, idx, !this.selectedCustomers[idx])
        this.calculateEmailDuplicates()
      },

      selectAll() {
        this.selectedCustomers = this.customerList.map(customer => true)
        this.calculateEmailDuplicates()
      },

      deselectZipCodesFrom5000Up() {
        console.log('deselectZipCodesFrom5000Up')
        for (var i = 0; i < this.customerList.length; i++) {

          if (
              this.customerList[i].zip_code >= 5000
              && this.customerList[i].class_signups.length === 0
              && this.customerList[i].class_passes.length === 0
              && this.customerList[i].memberships.length === 0
              && this.customerList[i].event_signups.length === 0
          ) {
            this.selectedCustomers[i] = false
          }

        }
        this.calculateEmailDuplicates()
        this.$forceUpdate()
      },

      dateDDMMYYYYToYYYYMMDD(inputDate) {
        return inputDate.substr(6) + '-' + inputDate.substr(3, 2) + '-' + inputDate.substr(0, 2)
      },

      async readAndParseCsvFile(file, csvOptions, fileReaderOptions) {
        return new Promise((resolve, reject) => {
          fileReaderOptions = fileReaderOptions || {}
          const defaultCsvOptions = {
            delimiter: ',',
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
              //console.log('Parsing CSV: END')
              //console.log('CSV:', result)
              resolve(result)
            })
            parser.write(fileCsvContent)
            parser.end()

          }
          if (fileReaderOptions.readAsText) {
            fileReader.readAsText(file, fileReaderOptions.charset)
          } else {
            fileReader.readAsBinaryString(file)
          }
        })

      },
      async readExcelFile(file) {
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
    },
  }

</script>
