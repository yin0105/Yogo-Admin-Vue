<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>

    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Memberships') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else class="flex--50">

        <h4>{{ $t('global.Receipts') }}</h4>

        <div>
          <md-checkbox v-model="form.send_receipt_on_email_for_automatic_membership_payments">{{
              $t('global.SendReceiptOnEmailForAutomaticMembershipPayments')
            }}
          </md-checkbox>
        </div>


        <h4>{{ $t('global.PausingMemberships') }}</h4>

        <!--<md-checkbox v-model="form.customer_can_pause_membership">
          {{ $t('global.CustomerCanPauseMembership') }}
        </md-checkbox>

        <div v-if="form.customer_can_pause_membership">

          <md-field>
            <label>{{ $t('global.MaxPausesPerRunningYear') }}</label>
            <md-input v-model="form.membership_pause_max_count_per_running_year" type="number"></md-input>
          </md-field>

          <md-checkbox v-model="form.customer_can_pause_membership_indefinitely">
            {{ $t('global.CustomerCanPauseMembershipIndefinitely') }}
          </md-checkbox>

          <md-field v-if="!form.customer_can_pause_membership_indefinitely">
            <label>{{ $t('global.MaxLengthOfPause') }}</label>
            <md-input v-model="form.membership_pause_max_days_per_pause" type="number"></md-input>
            <span class="md-suffix">{{ $t('time.days')}}</span>
          </md-field>

        </div>-->

        <md-field>
          <label>{{ $t('global.MembershipPauseFee') }}</label>
          <md-input v-model="form.membership_pause_fee" type="number"></md-input>
          <div class="md-helper-text">{{ $t('global.AdminsCanChooseADifferentFee') }}</div>
        </md-field>

        <div class="space4"></div>
        <div>
          <md-checkbox v-model="form.membership_fee_send_receipt_on_email">{{
              $t('global.SendReceiptForFeeOnEmail')
            }}
          </md-checkbox>
          <div class="looks-like-md-helper-text">{{ $t('global.ReceiptsAreAlwaysAvailableInTheCustomersProfile') }}</div>
        </div>

        <div class="space4"></div>
        <h4>{{ $t('global.Cancellation_Membership') }}</h4>

        <div>
          <md-checkbox v-model="form.customer_can_cancel_membership">{{
              $t('global.CustomerCanCancelMembership')
            }}
          </md-checkbox>
        </div>

        <div class="mt2">
          <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>
        </div>

      </div>

      <div class="space8"></div>
      <div class="space8"></div>

    </div>

  </div>
</template>

<script>

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import _pick from 'lodash/pick';

export default {

  components: {
    SettingsSubMenu,
    LoadingAnimation,
  },

  data() {
    return {
      loading: true,
      form: {},
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  async created() {
    this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=send_receipt_on_email_for_automatic_membership_payments' +
        '&keys[]=customer_can_pause_membership' +
        '&keys[]=membership_pause_max_count_per_running_year' +
        '&keys[]=customer_can_pause_membership_indefinitely' +
        '&keys[]=membership_pause_max_days_per_pause' +
        '&keys[]=membership_pause_fee' +
        '&keys[]=customer_can_cancel_membership' +
        '&keys[]=membership_pause_fee_send_receipt_on_email',
    );
    this.loading = false;
  },
  methods: {
    async submit() {
      this.loading = true;
      const submitData = _pick(
          this.form,
          [
            'send_receipt_on_email_for_automatic_membership_payments',
            'customer_can_pause_membership',
            'membership_pause_max_count_per_running_year',
            'customer_can_pause_membership_indefinitely',
            'membership_pause_max_days_per_pause',
            'membership_pause_fee',
            'customer_can_cancel_membership',
            'membership_pause_fee_send_receipt_on_email'
          ],
      );
      await YogoApi.put('/clients/' + this.client.id + '/settings', submitData);
      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.SettingsHasBeenUpdated'),
      });

      this.$store.dispatch('updateClientSettings');

    },
  },

};

</script>
