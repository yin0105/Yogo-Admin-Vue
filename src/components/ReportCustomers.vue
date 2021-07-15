<template>
  <div style="min-height: 450px">
    <ReportsSubmenu></ReportsSubmenu>

    <div class="wrapper__submenu--content">
      <h2>{{ $t('global.Customers') }}</h2>

      <loading-animation v-if="loading"></loading-animation>

      <md-checkbox v-model="onlyActiveCustomers">Kun aktive kunder</md-checkbox>
      <md-checkbox v-model="onlyInactiveCustomers">Kun inaktive kunder</md-checkbox>

      <div class="toolbar">
        <md-button md-theme-default class="md-primary md-raised ml-0" @click="downloadFile('csv')">Download CSV
        </md-button>
        <!--<md-button md-theme-default class="md-primary md-raised" @click="downloadFile('pdf')">Download PDF</md-button>-->
      </div>

      <div class="w-100 overflow-scroll">
        <YogoTable :cols="cols"
                   :rows="customers"
                   :pageSize="100">
          <template v-slot:default="slotProps">

            <YogoTd>{{ slotProps.item.email }}</YogoTd>
            <YogoTd>{{ slotProps.item.first_name }}</YogoTd>
            <YogoTd>{{ slotProps.item.last_name }}</YogoTd>
          </template>
        </YogoTable>
      </div>
    </div>
  </div>


</template>

<script>

import LoadingAnimation from './LoadingAnimation';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';

import moment from 'moment-timezone';
import qs from 'qs';

import downloadFile from '../helpers/downloadFile';
import ReportsSubmenu from './ReportsSubMenu';
import YogoTable from '@/components/ui/YogoTable';
import YogoTd from '@/components/ui/YogoTd';

export default {
  name: 'ReportTurnover',
  components: {
    YogoTable,
    YogoTd,
    ReportsSubmenu,
    LoadingAnimation,
  },
  data() {
    return {
      customers: [],

      onlyActiveCustomers: false,
      onlyInactiveCustomers: false,

      loading: true,

      cols: [
        {
          label: 'E-mail',
        },
        {
          label: 'Fornavn',
        },
        {
          label: 'Efternavn',
        },
      ],
    };
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
      if (newReadyState) this.fetchCustomers();
    },
    onlyActiveCustomers(newOnlyActiveCustomers) {
      if (newOnlyActiveCustomers) {
        this.onlyInactiveCustomers = false;
      }
      if (this.stateReady) this.fetchCustomers();
    },
    onlyInactiveCustomers(newOnlyInactiveCustomers) {
      if (newOnlyInactiveCustomers) {
        this.onlyActiveCustomers = false;
      }
      if (this.stateReady) this.fetchCustomers();
    },
  },
  mounted() {
    if (this.stateReady) this.fetchCustomers();
  },

  methods: {

    async fetchCustomers() {

      this.loading = true;

      const query = qs.stringify({
        onlyActiveCustomers: this.onlyActiveCustomers,
        onlyInactiveCustomers: this.onlyInactiveCustomers,
      });

      this.customers = await YogoApi.post(`/reports/customers?${query}`);

      this.loading = false;

    },

    async downloadFile(format) {

      const response = await YogoApi.post(
          '/reports/make-report-token',
          {
            onlyActiveCustomers: this.onlyActiveCustomers,
            onlyInactiveCustomers: this.onlyInactiveCustomers,
          },
      );

      const relativePath = '/reports/customers?format=' + format + '&reportToken=' + response.token;

      downloadFile(relativePath);

    },
    moment: moment,
  },
};
</script>


<style lang="stylus" scoped>

table.turnover-table
  border-collapse collapse
  width 100%
  background #fff
  border 1px solid #ddd

  button
    text-transform none

  tr
    th
      padding 12px 23px

    &:first-of-type
      background #01a7c2
      color #fff

      th
        font-weight 600
        text-align right

        &:first-of-type
          text-align left
          padding 15px 25px

    &:nth-child(even)
      background #f9f8f8

  th,
  td
    text-align center
    padding 0 15px
    line-height 1.4
    font-weight normal
    border 1px solid #ddd

    @media screen and (min-device-width: 768px)
      text-align left

  td
    text-align right

  tr.category-title
    th
      padding 0 15px

    th,
    td,
    span
      font-weight bold

  tr.subtotal,
  tr.total
    th,
    td
      font-weight bold
      text-transform uppercase
      color #01a7c2
      background #eee

    th
      padding 15px 25px

    td
      text-decoration underline


</style>
