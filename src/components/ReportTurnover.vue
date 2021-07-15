<template>
  <div style="min-height: 450px">
    <ReportsSubmenu></ReportsSubmenu>

    <div class="wrapper__submenu--content">
      <h2>{{ $t('global.Turnover') }}</h2>

      <ReportPeriodSelectorSection v-bind.sync="selectedPeriod"
      ></ReportPeriodSelectorSection>

      <loading-animation v-if="loading"></loading-animation>

      <div class="toolbar">
        <md-button md-theme-default class="md-primary md-raised ml-0" @click="downloadFile('csv')">Download CSV</md-button>
        <md-button md-theme-default class="md-primary md-raised" @click="downloadFile('pdf')">Download PDF</md-button>
      </div>

        <div class="w-100 overflow-scroll">
        <table class="turnover-table">
          <tr>
            <th>
              {{ timeIntervalName }}
            </th>
            <th>{{ $t('global.NumberOfSales') }}</th>
            <th>
              {{ $t('global.TotalAmount') }}
            </th>
          </tr>

          <tr v-for="(row, rowIdx) in rows"
              :key="'row_' + rowIdx"
              :class="{subtotal: row.isSubtotal, 'category-title': row.isCategoryTitle, total: row.isTotal}"
              v-if="
              row.isCategoryTitle ||
              row.isTotal ||
              showCategory[row.item_type]">
            <th>
              <md-button v-if="row.isCategoryTitle && row.rowToggleType" @click="toggleCategoryDetails(row.rowToggleType)">
                {{ row.name }}
                <md-icon v-if="!showCategory[row.item_type]">expand_more</md-icon>
                <md-icon v-else>expand_less</md-icon>
              </md-button>
              <md-button v-else-if="row.isCategoryTitle">
                {{ row.name }}
              </md-button>
              <span v-else>{{ row.name }}</span>
            </th>
            <td>
              <span v-if="row.isCategoryTitle && showCategory[row.item_type]">&nbsp;</span>
              <span v-else>
                {{ row.item_count }}
              </span>
            </td>
            <td>
              <span v-if="row.isCategoryTitle && showCategory[row.item_type]">&nbsp;</span>
              <span v-else>
              {{ row.turnover | currency_dkk }}
              <span
                  v-if="row.item_type === 'product' || row.isTotal">({{
                  $t('global.IncludingVAT')
                }} {{ row.vat_amount | currency_dkk }})</span>
            </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>


</template>

<script>

import ReportPeriodSelectorSection from './ReportPeriodSelectorSection';

import LoadingAnimation from './LoadingAnimation';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';

import moment from 'moment';

import downloadFile from '../helpers/downloadFile';
import ReportsSubmenu from './ReportsSubMenu';

export default {
  name: 'ReportTurnover',
  components: {
    ReportsSubmenu,
    LoadingAnimation,
    ReportPeriodSelectorSection,
  },
  data() {
    return {
      selectedPeriod: {
        periodType: 'year',
        year: moment()
            .year(),
        month: moment()
            .month(),
        date: new Date(),
        endDate: new Date(),
      },

      timeIntervalName: '',
      startDate: null,
      endDate: null,
      rows: [],
      categories: {},
      showCategory: {
        membership: false,
        membership_no_show_fee: false,
        membership_pause_fee: false,
        class_pass_type: false,
        event: false,
        product: false,
      },

      loading: true,

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
      if (newReadyState) this.fetchData();
    },
    selectedPeriod: {
      handler: function (newPeriod) {
        this.fetchData();
      },
      deep: true,
    },
  },
  mounted() {
    if (this.stateReady) this.fetchData();
  },

  methods: {

    async fetchData() {

      this.loading = true;


      let query;
      switch (this.selectedPeriod.periodType) {
        case 'year':
          query = {
            periodType: 'year',
            startDate: this.selectedPeriod.year + '-01-01',
          };
          break;
        case 'month':
          query = {
            periodType: 'month',
            startDate: this.selectedPeriod.year + '-' + _.padStart(this.selectedPeriod.month + 1, 2, '0') + '-01',
          };
          break;
        case 'day':
          query = {
            periodType: 'day',
            startDate: moment(this.selectedPeriod.date)
                .format('YYYY-MM-DD'),
          };
          break;
        case 'custom':
          query = {
            periodType: 'custom',
            startDate: moment(this.selectedPeriod.date)
                .format('YYYY-MM-DD'),
            endDate: moment(this.selectedPeriod.endDate)
                .format('YYYY-MM-DD'),
          };
          break;
      }

      const url = '/reports/turnover';
      const turnoverData = await YogoApi.post(url, query);

      this.timeIntervalName = turnoverData.label;
      this.rows = turnoverData.items;
      this.startDate = turnoverData.startDate;
      this.endDate = turnoverData.endDate;

      const membershipRows = _.filter(this.rows, ['item_type', 'membership']);

      const membershipSumRow = this.makeSumRow(membershipRows, {
        name: this.$t('global.MembershipsTotal'),
        item_type: 'membership',
        isSubtotal: true,
      });
      const membershipTitleRow = {
        isCategoryTitle: true,
        item_type: 'membership',
        name: this.$t('global.Memberships'),
        rowToggleType: 'membership',
        turnover: membershipSumRow.turnover,
        item_count: membershipSumRow.item_count,
      };


      const noShowFeeRows = _.filter(this.rows, ['item_type', 'membership_no_show_fee']);

      const noShowFeeSumRow = this.makeSumRow(noShowFeeRows, {
        name: this.$t('global.NoShowFeesTotal'),
        item_type: 'membership_no_show_fee',
        isSubtotal: true,
      });
      const noShowFeeTitleRow = {
        isCategoryTitle: true,
        item_type: 'membership_no_show_fee',
        name: this.$t('global.NoShowFees'),
        rowToggleType: 'membership_no_show_fee',
        turnover: noShowFeeSumRow.turnover,
        item_count: noShowFeeSumRow.item_count,
      };


      const membershipPauseFeeRows = _.filter(this.rows, ['item_type', 'membership_pause_fee']);

      const membershipPauseFeeSumRow = this.makeSumRow(membershipPauseFeeRows, {
        name: this.$t('global.MembershipPauseFeesTotal'),
        item_type: 'membership_pause_fee',
        isSubtotal: true,
      });
      const membershipPauseFeeTitleRow = {
        isCategoryTitle: true,
        item_type: 'membership_pause_fee',
        name: this.$t('global.MembershipPauseFees'),
        rowToggleType: 'membership_pause_fee',
        turnover: membershipPauseFeeSumRow.turnover,
        item_count: membershipPauseFeeSumRow.item_count,
      };


      const classPassRows = _.filter(this.rows, ['item_type', 'class_pass_type']);
      const classPassSumRow = this.makeSumRow(classPassRows, {
        name: this.$t('global.ClassPassesTotal'),
        item_type: 'class_pass_type',
        isSubtotal: true,
      });
      const classPassTitleRow = {
        isCategoryTitle: true,
        item_type: 'class_pass_type',
        name: this.$t('global.ClassPasses'),
        rowToggleType: 'class_pass_type',
        turnover: classPassSumRow.turnover,
        item_count: classPassSumRow.item_count,
      };


      const productRows = _.filter(this.rows, ['item_type', 'product']);
      const productSumRow = this.makeSumRow(productRows, {
        name: this.$t('global.ProductsTotal'),
        item_type: 'product',
        isSubtotal: true,
      });
      const productTitleRow = {
        isCategoryTitle: true,
        item_type: 'product',
        name: this.$t('global.Products'),
        rowToggleType: 'product',
        turnover: productSumRow.turnover,
        vat_amount: productSumRow.vat_amount,
        item_count: productSumRow.item_count,
      };


      const eventRows = _.filter(this.rows, ['item_type', 'event']);
      const eventSumRow = this.makeSumRow(eventRows, {
        isSubtotal: true,
        item_type: 'event',
        name: this.$t('global.EventsTotal'),
      });

      const eventTitleRow = {
        isCategoryTitle: true,
        item_type: 'event',
        name: this.$t('global.Events'),
        rowToggleType: 'event',
        turnover: eventSumRow.turnover,
        item_count: eventSumRow.item_count,
      };

      const giftCardPurchaseRows = _.filter(this.rows, ['item_type', 'gift_card_purchase']);
      const giftCardPurchaseSumRow = this.makeSumRow(giftCardPurchaseRows, {
        isSubtotal: true,
        item_type: 'gift_card_purchase',
        name: '',
      });

      const giftCardPurchaseTitleRow = {
        isCategoryTitle: true,
        item_type: 'gift_card_purchase',
        name: this.$t('global.GiftCardsPurchased'),
        rowToggleType: null,
        turnover: giftCardPurchaseSumRow.turnover,
        item_count: giftCardPurchaseSumRow.item_count,
      };


      const giftCardSpendRows = _.filter(this.rows, ['item_type', 'gift_card_spend']);
      const giftCardSpendSumRow = this.makeSumRow(giftCardSpendRows, {
        isSubtotal: true,
        item_type: 'gift_card_spend',
        name: '',
      });

      const giftCardSpendTitleRow = {
        isCategoryTitle: true,
        item_type: 'gift_card_spend',
        name: this.$t('global.GiftCardsSpent'),
        rowToggleType: null,
        turnover: giftCardSpendSumRow.turnover,
        item_count: giftCardSpendSumRow.item_count,
      };


      const totalRow = this.makeSumRow([
            membershipSumRow,
            noShowFeeSumRow,
            membershipPauseFeeSumRow,
            eventSumRow,
            productSumRow,
            classPassSumRow,
            giftCardPurchaseSumRow,
            giftCardSpendSumRow,
          ],
          {
            isTotal: true,
            name: 'Total',
          },
      );


      this.rows = [membershipTitleRow]
          .concat(membershipRows)
          .concat([membershipSumRow])

          .concat([noShowFeeTitleRow])
          .concat(noShowFeeRows)
          .concat([noShowFeeSumRow])

          .concat([membershipPauseFeeTitleRow])
          .concat(membershipPauseFeeRows)
          .concat([membershipPauseFeeSumRow])

          .concat([classPassTitleRow])
          .concat(classPassRows)
          .concat([classPassSumRow])

          .concat([eventTitleRow])
          .concat(eventRows)
          .concat([eventSumRow])

          .concat([productTitleRow])
          .concat(productRows)
          .concat([productSumRow])

          .concat([giftCardPurchaseTitleRow])
          // .concat(giftCardPurchaseRows)
          // .concat([giftCardPurchaseSumRow])

          .concat([giftCardSpendTitleRow])
          // .concat(giftCardSpendRows)
          // .concat([giftCardSpendSumRow])

          .concat([totalRow]);

      this.loading = false;

    },
    makeSumRow(inputRows, sumRow) {
      if (!sumRow) {
        sumRow = {};
      }
      if (!sumRow.item_count) {
        sumRow.item_count = 0;
      }
      if (!sumRow.turnover) {
        sumRow.turnover = 0;
      }
      if (!sumRow.vat_amount) {
        sumRow.vat_amount = 0;
      }

      for (let j = 0; j < inputRows.length; j++) {
        sumRow.item_count += inputRows[j].item_count;
        sumRow.turnover += inputRows[j].turnover;
        sumRow.vat_amount = sumRow.vat_amount + inputRows[j].vat_amount;
      }

      return sumRow;
    },
    toggleCategoryDetails(itemType) {
      console.log(itemType);
      this.showCategory[itemType] = !this.showCategory[itemType];
    },
    async downloadFile(format) {

      const response = await YogoApi.post(
          '/reports/make-report-token',
          {
            periodType: 'custom',
            startDate: this.startDate,
            endDate: this.endDate,
          },
      );

      const relativePath = '/reports/turnover?format=' + format + '&reportToken=' + response.token;

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
