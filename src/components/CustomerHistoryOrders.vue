<template>
  <div>
    <md-table v-model="orders">

      <md-table-empty-state
        :md-label="$t('global.NoPurchases')"
        md-description="">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell :md-label="$t('global.InvoiceNumber')">
          {{ item.invoice_id }} <span style="color:rgba(0,0,0,0.54)">(Reepay ID: {{ item.id }})</span>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.TimeAsPointInTime')">{{ item.paid ? timeStampToHumanDateTime(item.paid) : timeStampToHumanDateTime(item.createdAt) }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Amount')">{{ currencyDkk(item.total) }} kr</md-table-cell>
        <md-table-cell>
          <a :href="item.receipt_link" v-if="item.receipt_link" target="_blank">{{ $t('global.DownloadInvoice') }}</a>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex'
  import dateTimeFunctions from '../mixins/dateTimeFunctions'

  export default {
    name: 'CustomerHistoryOrders',
    mixins: [dateTimeFunctions],
    props: ['orders'],
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    methods: {
      currencyDkk(amount) {
        return this.$options.filters.currency_dkk(amount)
      }
    }
  }
</script>

<style>

  td {
    white-space: nowrap;
  }

</style>
