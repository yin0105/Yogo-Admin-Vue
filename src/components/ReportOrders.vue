<template>
  <div style="min-height: 450px">
    <ReportsSubMenu></ReportsSubMenu>

    <div class="wrapper__submenu--content pb-40">
      <h2>{{ $t('global.IndividualSales') }}</h2>

      <ReportPeriodSelectorSection v-bind.sync="selectedPeriod"
      ></ReportPeriodSelectorSection>

      <loading-animation v-if="loading"></loading-animation>

      <md-table v-model="orders">

        <md-table-empty-state :md-label="$t('global.NoOrdersDuringThisTime')"></md-table-empty-state>

        <md-table-row slot="md-table-row" slot-scope="{ item }">
          <md-table-cell :md-label="$t('global.Date')">{{ item.paid | moment('D. MMMM YYYY') }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Time')">{{ $t('global.KL') }} {{ item.paid | moment('HH:mm') }}</md-table-cell>
          <md-table-cell :md-label="$t('global.InvoiceNumber')">{{ item.invoice_id }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Customer')">{{ item.user_first_name + ' ' + item.user_last_name }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Amount')">{{ item.total | currency_dkk }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Invoice')">
            <a :href="getReceiptLink(item)" target="_blank">
              {{ $t('global.DownloadInvoice') }}
            </a>
          </md-table-cell>
        </md-table-row>
      </md-table>

    </div>

  </div>

</template>

<script>

  import ReportsSubMenu from './ReportsSubMenu'
  import ReportPeriodSelectorSection from './ReportPeriodSelectorSection'

  import LoadingAnimation from './LoadingAnimation'
  import YogoApi from '../gateways/YogoApi'
  import { mapGetters } from 'vuex'

  import moment from 'moment'

  import qs from 'qs'

  export default {
    name: 'ReportOrders',
    components: {
      ReportsSubMenu,
      LoadingAnimation,
      ReportPeriodSelectorSection,
    },
    data() {
      return {

        selectedPeriod: {
          periodType: 'day',
          year: '2019',
          month: moment()
            .month(),
          date: new Date(),
          endDate: new Date(),
        },

        loading: true,
        orders: [],
      }
    },
    computed: {
      ...mapGetters([
        'client',
        'stateReady',
        'apiRoot',
      ]),
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchData()
      },
      selectedPeriod: {
        handler: function (newPeriod) {
          this.fetchData()
        },
        deep: true,
      },
    },
    created() {
      if (this.stateReady) this.fetchData()
    },
    mounted: function () {
      //$('select').material_select();
    },
    methods: {
      async fetchData() {

        this.loading = true

        const query = {
          periodType: this.selectedPeriod.periodType,
        }
        switch (this.selectedPeriod.periodType) {
          case 'year':
            query.year = this.selectedPeriod.year
            break
          case 'month':
            query.month = this.selectedPeriod.month + 1
            query.year = this.selectedPeriod.year
            break
          case 'day':
            query.date = moment(this.selectedPeriod.date)
              .format('YYYY-MM-DD')
            break
          case 'custom':
            query.startDate = moment(this.selectedPeriod.date)
              .format('YYYY-MM-DD')
            query.endDate = moment(this.selectedPeriod.endDate)
              .format('YYYY-MM-DD')
            break
        }


        this.orders = await YogoApi.get('/orders?' + qs.stringify(query))

        this.orders = this.orders.sort(
          (a, b) => {
            if (a.invoice_id > b.invoice_id) return -1
            if (b.invoice_id > a.invoice_id) return 1
            return 0
          },
        )


        this.loading = false

      },
      getReceiptLink(order) {
        return this.apiRoot + '/orders/' + order.id + '/pdf-receipt?receiptToken=' + order.receipt_token
      },
      moment: moment,
    },
  }
</script>


<style lang="stylus">

</style>
