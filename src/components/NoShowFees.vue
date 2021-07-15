<template>
  <div>
    <h2>{{ $t('global.NoShowFees') }}</h2>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else style="min-height:350px;">
      <Datepicker v-model="date" :monday-first="true"></Datepicker>

      <md-table v-model="noShowFees" md-card>

        <md-empty-state
            md-icon="assignment_late"
            :md-label="$t('global.NoNoShowFees')"
            :md-description="$t('global.NoNoShowFeesOnThisDate')">
        </md-empty-state>

        <md-table-row slot="md-table-row" slot-scope="{ item }" :key="'no_show_fee_' + item.id">
          <md-table-cell :md-label="$t('global.Start')" md-sort-by="sortcol_start_time">
            {{ item.class.start_time.substr(0, 5) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Class')">{{ item.class.class_type.name }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Customer')" md-sort-by="user_id">
            {{ `${item.user.first_name} ${item.user.last_name}` }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Reason')">
            {{ reasonText(item) }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Fee')">
            <span :style="{'text-decoration': item.cancelled_at ? 'line-through' : 'none'}">{{ item.fee_text }}</span>
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Access')">
            <span v-if="item.class_signup.used_class_pass">{{
                item.class_signup.used_class_pass.class_pass_type.name
              }}</span>
            <span v-if="item.class_signup.used_membership">{{
                item.class_signup.used_membership.membership_type.name
              }}</span>
          </md-table-cell>
          <md-table-cell>
            <span v-if="item.paid_with_order_id">{{ $t('global.PaidAt', {paidAt: formatDate(item.paid_with_order.paid)}) }}</span>
            <md-button v-else-if="!item.cancelled_at" @click="cancelFee(item)">
              {{ $t('global.CancelFee') }}
            </md-button>
            <md-button v-else @click="reactivateFee(item)">
              {{ $t('global.ActivateFee') }}
            </md-button>
          </md-table-cell>

        </md-table-row>
      </md-table>

    </div>

    <div class="space8"></div>
  </div>

</template>

<script>

import LoadingAnimation from './LoadingAnimation.vue';
import YogoApi from '../gateways/YogoApi';
import { mapGetters } from 'vuex';
import qs from 'qs';
import moment from 'moment-timezone';
import Datepicker from 'vuejs-datepicker';
import dateTimeFunctions from '@/mixins/dateTimeFunctions';

export default {
  components: {
    LoadingAnimation,
    Datepicker,
  },
  mixins: [dateTimeFunctions],
  data() {
    return {
      loading: true,
      date: moment.tz('Europe/Copenhagen').toDate(),
      noShowFees: [],
    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
      'client',
    ]),
  },
  created() {
    if (this.stateReady) this.fetchNoShowFees();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchNoShowFees();
    },
    date(newDate) {
      this.fetchNoShowFees();
    },
  },
  methods: {
    async fetchNoShowFees() {
      const queryString = qs.stringify({
        date: moment(this.date)
            .tz('Europe/Copenhagen')
            .format('YYYY-MM-DD'),
        populate: [
          'user',
          'class.class_type',
          'class_signup',
          'class_signup.used_class_pass',
          'class_signup.used_class_pass.class_pass_type',
          'class_signup.used_membership',
          'class_signup.used_membership.membership_type',
          'fee_text',
          'paid_with_order',
        ],
      });

      this.noShowFees = await YogoApi.get(`/no-show-fees?${queryString}`);

      this.noShowFees = _.sortBy(this.noShowFees, ['class.start_time', 'class.class_type.name', 'user.first_name', 'user.last_name']);

      this.loading = false;

    },
    reasonText(noShowFee) {
      let text = this.$t('global.NoShowFeeReason_' + noShowFee.reason);
      if (noShowFee.reason === 'late_cancel') {
        const cancelDate = this.formatDate(noShowFee.class_signup.cancelled_at, { time: true });
        text += ` (${cancelDate})`;
      }
      return text;
    },
    async cancelFee(noShowFee) {
      await YogoApi.post(`/no-show-fees/${noShowFee.id}/cancel`);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.NoShowFeeCancelled'),
      });

      this.fetchNoShowFees();
    },
    async reactivateFee(noShowFee) {
      await YogoApi.post(`/no-show-fees/${noShowFee.id}/reactivate`);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.NoShowFeeActivated'),
      });

      this.fetchNoShowFees();
    },
  },
};
</script>

