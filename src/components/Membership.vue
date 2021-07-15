<template>
  <div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <h4 class="pt-14">{{ $t('global.MembershipBelongingTo') }} {{ membership.user.first_name }}
        {{ membership.user.last_name }}:</h4>
      <h1>
        {{ membership.membership_type.name }}
        <span v-if="membership.current_membership_pause">({{ $t('global.Paused') }})</span>
      </h1>
      <h3 v-if="membership.discount_code">
        {{ $t('global.PromotionCode') }}: {{ membership.discount_code.name }}
      </h3>
      <h3 v-if="membership.membership_campaign">
        {{ $t('global.Campaign') }}: {{ membership.membership_campaign.name }},
        {{ membership.membership_campaign_number_of_reduced_payments_left }} {{ $t('global.ReducedPaymentsLeft') }}
      </h3>
      <div class="space4"></div>

      <md-button @click="$router.go(-1)" class="md-raised">
        <div class="pointer">
          <a>{{ $t('global.Back') }}</a>
        </div>
      </md-button>


      <div class="space2"></div>

      <div class="flex__1-2">
        <h3>{{ $t('global.Status') }}</h3>
        <md-table md-card>
          <md-table-row>
            <md-table-head>{{ $t('global.Status') }}</md-table-head>
          </md-table-row>
          <md-table-row>
            <md-table-cell>{{ membership.status_text }}
            </md-table-cell>
          </md-table-row>
        </md-table>
      </div>

      <div class="flex__1-2" v-if="membership.current_or_upcoming_membership_pause">
        <h3>
          {{
            membership.current_membership_pause
                ? $t('global.CurrentMembershipPause')
                : $t('global.ScheduledMembershipPause')
          }}
        </h3>
        <md-table md-card>
          <md-table-row>
            <md-table-head>{{ $t('global.StartDate') }}</md-table-head>
            <md-table-head>{{ $t('global.EndDate') }}</md-table-head>
            <md-table-head>{{ $t('global.Fee') }}</md-table-head>
            <md-table-head>{{ $t('global.Comment') }}</md-table-head>
          </md-table-row>
          <md-table-row>
            <md-table-cell>{{ formatDate(membership.current_or_upcoming_membership_pause.start_date) }}</md-table-cell>
            <md-table-cell>
              {{
                membership.current_or_upcoming_membership_pause.end_date
                    ? formatDate(membership.current_or_upcoming_membership_pause.end_date)
                    : '--'
              }}
            </md-table-cell>
            <md-table-cell>
              {{ membership.current_or_upcoming_membership_pause.fee | currency_dkk }} kr
              <span v-if="membership.current_or_upcoming_membership_pause.fee_paid_with_order_id">
                ({{ $t('global.Paid') }})
              </span>
              <span v-else-if="membership.current_or_upcoming_membership_pause.fee > 0">
                ({{ $t('global.Unpaid') }})
              </span>
            </md-table-cell>
            <md-table-cell>{{ membership.current_or_upcoming_membership_pause.comment }}</md-table-cell>
          </md-table-row>
        </md-table>
      </div>

      <div class="flex__1-2" v-if="membership.pending_no_show_fees.length">
        <h3>{{ $t('global.PendingNoShowFees') }}</h3>
        <md-table md-card>
          <md-table-row>
            <md-table-head>{{ $t('global.Date') }}</md-table-head>
            <md-table-head>{{ $t('global.Time') }}</md-table-head>
            <md-table-head>{{ $t('global.Class') }}</md-table-head>
            <md-table-head>{{ $t('global.Reason') }}</md-table-head>
            <md-table-head>{{ $t('global.Amount') }}</md-table-head>
            <md-table-head>&nbsp;</md-table-head>
          </md-table-row>
          <md-table-row v-for="fee in membership.pending_no_show_fees" :key="'fee_' + fee.id">
            <md-table-cell>
              {{ formatDate(fee.class.date) }}
            </md-table-cell>
            <md-table-cell>
              {{ fee.class.start_time.substr(0, 5) }}
            </md-table-cell>
            <md-table-cell>{{ fee.class.class_type.name }}</md-table-cell>
            <md-table-cell>
              {{ reasonText(fee) }}
            </md-table-cell>
            <md-table-cell>
              <span :style="{'text-decoration': fee.cancelled_at ? 'line-through' : 'none'}">
                {{ fee.amount | currency_dkk }} kr
              </span>
            </md-table-cell>
            <md-table-cell>
              <md-button class="md-raised" v-if="!fee.cancelled_at" @click.prevent="cancelFee(fee)">
                {{ $t('global.CancelFee') }}
              </md-button>
              <md-button class="md-raised" v-else @click.prevent="reactivateFee(fee)">{{
                  $t('global.ReactivateFee')
                }}
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </div>

      <div class="flex__1-2" v-if="membership.next_payment">
        <h3>{{ $t('global.NextPayment') }}</h3>
        <md-table md-card>
          <md-table-row>
            <md-table-head>{{ $t('global.Date') }}</md-table-head>
            <md-table-head>{{ $t('global.Amount') }}</md-table-head>
            <md-table-head>{{ $t('global.Period') }}</md-table-head>
          </md-table-row>
          <md-table-row>
            <md-table-cell>
              <span v-if="membership.next_payment.date">
                {{ formatDate(membership.next_payment.date) }}
              </span>
              <span v-if="membership.membership_pause_affects_next_payment_date" style="color:rgba(0,0,0,0.54);">
                  ({{
                  formatDate(moment(membership.paid_until)
                      .add(1, 'day'))
                }} {{ $t('global.withoutMembershipPause') }})
                <tooltip-info style="display:inline-block;"
                              v-if="membership.current_or_upcoming_membership_pause && !membership.current_or_upcoming_membership_pause.end_date"
                              :tooltip-text="$t('global.ActualPaymentDateIsUnknownAsMembershipPauseHasNoEndDate')"></tooltip-info>
                  <tooltip-info style="display:inline-block;"
                                v-else-if="membership.membership_pause_starts_days_before_next_payment_date === 0"
                                :tooltip-text="$t(
                                    'global.MembershipPauseStartsOnAPaymentDateSoTheNextPaymentWillBeWhenThePauseEnds',
                                    )"></tooltip-info>
                <tooltip-info style="display:inline-block;"
                              v-else-if="membership.membership_pause_length < membership.membership_pause_starts_days_before_next_payment_date"
                              :tooltip-text="$t(
                                    'global.TheLengthOfTheMembershipPauseNDaysHasBeenAddedToThePaymentDate',
                                    {days: membership.membership_pause_length}
                                    )"></tooltip-info>
                <tooltip-info style="display:inline-block;"
                              v-else
                              :tooltip-text="$t(
                                    'global.MembershipPauseStartsNDaysBeforeNextPaymentSoNextPaymentWillBeNDaysAfterPauseEnds',
                                    {days: membership.membership_pause_starts_days_before_next_payment_date}
                                    )"></tooltip-info>
                </span>
            </md-table-cell>
            <md-table-cell>{{ membership.next_payment.amount | currency_dkk }} kr</md-table-cell>
            <md-table-cell>{{ membership.payment_option.name }}</md-table-cell>
          </md-table-row>
        </md-table>
      </div>


      <div class="flex__1-2" v-if="membership.archived">
        <h3>{{ $t('global.MembershipHasBeenDeleted') }}</h3>
      </div>

      <div class="flex__1-2" v-else-if="membership.status === 'ended'">
        <h3>{{ $t('global.MembershipHasEnded') }}</h3>
      </div>

      <div class="flex__1-2" v-else-if="membership.status === 'cancelled_running'">
        <md-button type="button" class="md-primary md-raised" @click="resumeMembershipClick">
          {{ $t('global.ResumeMembership') }}
        </md-button>
      </div>

      <div class="flex__1-2" v-else-if="membership.status === 'active'">
        <h3>{{ $t('global.PaymentCard') }}</h3>
        <md-table class="padding1" md-card>
          <md-field v-if="activeSubscription">
            {{
              getPayType(activeSubscription.pay_type)
            }}: {{ activeSubscription.card_prefix.substr(0, 4) + ' ' + activeSubscription.card_prefix.substr(4, 2) }}xx
            xxxx {{
              activeSubscription.card_last_4_digits
            }}
          </md-field>
          <p v-else>
            {{ $t('global.NoPaymentCard') }}
          </p>
        </md-table>
      </div>

      <div class="space8"></div>

      <md-button
          type="button"
          class="md-primary md-raised ml-0"
          @click="changeMembershipClick"
          v-if="!membership.archived && membership.status === 'active'"
      >
        {{ $t('global.ChangeMembershipTypeOrPaymentPeriod') }}...
      </md-button>

      <md-button type="button" class="md-primary md-raised" @click="changeMembershipPaidUntilClick"
                 v-if="showChangeNextPaymentDateButton">
        {{ $t('global.ChangePaymentDate') }}...
      </md-button>

      <md-button type="button" class="md-primary md-raised" @click="changeDiscountCodeClick"
                 v-if="!membership.archived && membership.status === 'active'">
        {{ $t('global.PromotionCode') }}...
      </md-button>

      <md-button type="button" v-if="showPauseMembershipButton"
                 class="md-primary md-raised" @click="pauseMembershipClick">
        {{ pauseMembershipButtonText }}...
      </md-button>

      <md-button type="button" v-if="!membership.archived && membership.status !== 'ended'"
                 class="md-primary md-raised red" @click="stopMembershipClick">
        {{ $t('global.StopMembership') }}...
      </md-button>

      <div class="space8"></div>

      <div v-if="membership.orders.length">

        <h3>{{ $t('global.PreviousPayments') }}</h3>
        <md-table v-model="membership.orders" md-card>
          <md-table-row slot="md-table-row" slot-scope="{ item }" :key="item.id">
            <md-table-cell :md-label="$t('global.InvoiceNumber')">{{ item.invoice_id }}</md-table-cell>
            <md-table-cell :md-label="$t('global.Date')">{{
                formatDate(item.createdAt)
              }}
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Amount')" md-numeric>{{ item.total | currency_dkk }} kr</md-table-cell>
            <md-table-cell :md-label="$t('global.Status')">{{ getOrderStatusText(item) }}</md-table-cell>
            <md-table-cell>
              <a :href="getReceiptLink(item)" v-if="item.paid" target="_blank">{{ $t('global.DownloadReceipt') }}</a>
            </md-table-cell>
          </md-table-row>
        </md-table>

        <div class="space8"></div>
      </div>

      <div v-if="membership.membership_pauses.length > 1">

        <h3>{{ $t('global.PreviousMembershipPauses') }}</h3>
        <md-table v-model="previousMembershipPauses" md-card>
          <md-table-row slot="md-table-row" slot-scope="{ item }" :key="item.id">
            <md-table-cell :md-label="$t('global.StartDate')">
              {{ formatDate(item.start_date) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('global.EndDate')">
              {{ formatDate(item.end_date) }}
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Fee')" md-numeric>
              {{ item.fee | currency_dkk }} kr
              <span v-if="item.fee_paid_with_order_id">
                ({{ $t('global.Paid') }})
              </span>
              <span v-else-if="item.fee > 0">
                ({{ $t('global.Unpaid') }})
              </span>
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Comment')">{{ item.comment }}</md-table-cell>
          </md-table-row>
        </md-table>

        <div class="space8"></div>
      </div>

      <h3>{{ $t('global.Log') }}</h3>
      <md-table v-model="membership.log_entries" md-card>
        <md-table-row slot="md-table-row" slot-scope="{ item }" :key="item.id">
          <md-table-cell :md-label="$t('global.Date')">{{ formatDate(item.createdAt) }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Time')">{{ item.createdAt | moment('HH:mm:ss') }}</md-table-cell>
          <md-table-cell :md-label="$t('global.Text')">{{ item.entry }}</md-table-cell>
        </md-table-row>
      </md-table>

    </div>

    <md-dialog :md-active.sync="showStopMembershipDialog" v-if="membership && membership.status !== 'ended'">
      <md-dialog-title>{{ $t('global.StopMembership') }}</md-dialog-title>
      <md-dialog-content>

        <div v-if="membership.next_payment && membership.next_payment.date">
          <p>
            {{ $t('global.MembershipNextPaymentDateIs') }} {{ formatDate(membership.next_payment.date) }}
            <span v-if="membership.membership_pause_affects_next_payment_date">
            {{ $t('global.includingMembershipPause') }}
          </span>
          </p>

          <p v-if="membership.payment_option.number_of_months_payment_covers === 1">
            {{ $t('global.termsDesc') }}
          </p>

          <p>
            {{ $t('global.stopMemberShipOrProceedDesc') }}
            <span
                v-if="membership.payment_option.number_of_months_payment_covers === 1">{{
                $t('global.untilMonthAfterNextPayment')
              }}</span><span
              v-else>{{ $t('global.asLongAsPaidFor') }}</span>?
          </p>

        </div>

        <p v-else>
          {{ $t('global.MembershipCanNotBeStoppedWithNoticeSinceTheMembershipPauseHasNoEndDate') }}
        </p>


      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" class="md-raised" @click="showStopMembershipDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button type="button" class="md-primary md-raised" @click="stopMembershipNow">
          {{ $t('global.StopMembershipNow') }}
        </md-button>
        <md-button
            type="button"
            class="md-primary md-raised"
            @click="stopMembershipAccordingToTerms"
            v-if="!membership.current_or_upcoming_membership_pause || membership.current_or_upcoming_membership_pause.end_date"
        >
          <span v-if="membership.payment_option.number_of_months_payment_covers === 1">
              {{ $t('global.MembershipOneMonthAndStop') }}
          </span>
          <span v-else>
            {{ $t('global.MembershipContinueAsPaidFor') }}
          </span>

        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showChangeMembershipDialog">
      <md-dialog-title>{{ $t('global.ChangeMembership') }}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.Membership') }}</label>
          <md-select v-model="changeMembershipDialogMembershipType">
            <md-option v-for="membershipType in membershipTypes" :value="membershipType.id"
                       :key="'membershipType_' + membershipType.id">
              {{ membershipType.name }}
            </md-option>
          </md-select>
        </md-field>

        <md-field v-if="changeMembershipDialogMembershipType">
          <label>{{ $t('global.PaymentPeriod') }}</label>
          <md-select v-model="changeMembershipDialogSelectedPaymentOption">
            <md-option v-for="paymentOption in changeMembershipDialogPaymentOptions" :value="paymentOption.id"
                       :key="'paymentOption_' + paymentOption.id">
              {{ paymentOption.name }} / {{ paymentOption.payment_amount | currency_dkk }}
            </md-option>
          </md-select>
        </md-field>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" class="md-raised" @click="showChangeMembershipDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button type="button" class="md-primary md-raised" @click="changeMembership">
          {{ $t('global.Save') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showChangeMembershipPaidUntilDialog">
      <md-dialog-title>{{ $t('global.ChangePaymentDate') }}</md-dialog-title>
      <md-dialog-content>

        <md-datepicker md-immediately v-model="changeMembershipNextPaymentDate" class="not-clearable">
          <label>{{ $t('global.NextPaymentDate') }}</label>
        </md-datepicker>

        <md-field v-if="membership && membership.current_or_upcoming_membership_pause">
          <label>{{ $t('global.MembershipPause') }}</label>
          <md-input disabled="disabled"
                    :value="changeMembershipPaidUntilDialogMembershipPauseInfo"></md-input>
        </md-field>

        <md-field v-if="membership && membership.current_or_upcoming_membership_pause">
          <label>{{ $t('global.ActualNewPaymentDateIncludingMembershipPause') }}</label>
          <md-input disabled="disabled" :value="actualNewPaymentDateIncludingMembershipPause"></md-input>
        </md-field>

      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" class="md-raised" @click="showChangeMembershipPaidUntilDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button type="button" class="md-primary md-raised" @click="changeMembershipPaidUntil">
          {{ $t('global.Save') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showDiscountCodeDialog">
      <md-dialog-title>{{ $t('global.PromotionCode') }}</md-dialog-title>
      <md-dialog-content>

        <md-field>
          <label>{{ $t('global.PromotionCode') }}</label>
          <md-select v-model="discountCodeDialogDiscountCode">
            <md-option value="0">-- {{ $t('global.noPromotionCode') }} --</md-option>
            <md-option v-for="discountCode in applicableDiscountCodes" :value="discountCode.id"
                       :key="'discountCode_' + discountCode.id">
              {{ discountCode.name }}
            </md-option>
          </md-select>
        </md-field>

      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" class="md-raised" @click="showDiscountCodeDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button type="button" class="md-primary md-raised" @click="changeDiscountCode">
          {{ $t('global.Save') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showPauseMembershipDialog">
      <md-dialog-title>{{ pauseMembershipDialogTitle }}</md-dialog-title>
      <md-dialog-content>

        <md-datepicker
            v-model="pauseMembershipDialogStartDate"
            class="not-clearable"
            :md-disabled-dates="pauseMembershipStartDateDisabledDates"
            :md-immediately="true"
        >
          <label>{{ $t('global.PauseStartDate') }}</label>
        </md-datepicker>

        <div>
          <md-checkbox v-model="pauseMembershipDialogPauseMembershipIndefinitely">
            {{ $t('global.PauseMembershipIndefinitely') }}
          </md-checkbox>
        </div>

        <div v-if="!pauseMembershipDialogPauseMembershipIndefinitely">
          <md-datepicker
              v-model="pauseMembershipDialogEndDate"
              class="not-clearable"
              :md-disabled-dates="pauseMembershipEndDateDisabledDates"
              :md-immediately="true"
          >
            <label>{{ $t('global.PauseEndDate') }}</label>
          </md-datepicker>
        </div>

        <md-field>
          <label>{{ $t('global.Fee') }}
            <span v-if="membership && membership.current_or_upcoming_membership_pause && membership.current_or_upcoming_membership_pause.fee_paid_with_order_id">
              ({{ $t('global.Paid') }})
            </span>
          </label>
          <md-input
              type="number"
              :disabled="pauseMembershipDialogFeeDisabled"
              v-model="pauseMembershipDialogFee"></md-input>
          <span class="md-suffix">kr</span>
        </md-field>

        <md-field>
          <label>{{ $t('global.Comment') }}</label>
          <md-input v-model="pauseMembershipDialogComment"></md-input>
          <span class="md-helper-text">{{ $t('global.NotVisibleToTheCustomer') }}</span>
        </md-field>


      </md-dialog-content>
      <md-dialog-actions>
        <md-button type="button" class="md-raised" @click="showPauseMembershipDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button
            type="button" class="md-primary red md-raised"
            @click="deleteMembershipPause"
            v-if="membership && membership.current_or_upcoming_membership_pause"
        >
          {{ $t('global.Remove') }}
        </md-button>
        <md-button type="button" class="md-primary md-raised" @click="submitPauseMembershipDialog">
          {{ pauseMembershipDialogSubmitButtonText }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>


import YogoApi from '../gateways/YogoApi';
import { mapGetters, mapActions } from 'vuex';
import _filter from 'lodash/filter';
import moment from 'moment';
import LoadingAnimation from './LoadingAnimation';
import Imagefield from './ImageField';
import qs from 'qs';

import dateTimeFunctions from '@/mixins/dateTimeFunctions';
import TooltipInfo from '@/components/TooltipInfo';
import currencyFormatters from '@/mixins/currencyFormatters';

export default {
  name: 'Membership',
  components: {
    TooltipInfo,
    Imagefield,
    LoadingAnimation,
  },
  mixins: [dateTimeFunctions, currencyFormatters],
  data() {
    return {

      loading: true,

      membership: null,

      showStopMembershipDialog: false,

      membershipTypes: [],
      showChangeMembershipDialog: false,
      changeMembershipDialogMembershipType: null,
      changeMembershipDialogPaymentOptions: [],
      changeMembershipDialogSelectedPaymentOption: null,

      showChangeMembershipPaidUntilDialog: false,
      changeMembershipNextPaymentDate: null,

      showMembershipRealUserDialog: false,
      membershipRealUserDialogName: '',
      membershipRealUserDialogImage: null,

      showDiscountCodeDialog: false,
      applicableDiscountCodes: [],
      discountCodeDialogDiscountCode: '',

      showPauseMembershipDialog: false,
      pauseMembershipDialogStartDate: new Date(),
      pauseMembershipDialogPauseMembershipIndefinitely: false,
      pauseMembershipDialogEndDate: new Date(),
      pauseMembershipDialogFee: 0,
      pauseMembershipDialogComment: '',

    };
  },
  computed: {
    ...mapGetters([
      'client',
      'stateReady',
      'apiRoot',
    ]),
    activeSubscription() {
      if (!this.membership) return null;

      let activePaymentSubscriptions = _filter(this.membership.payment_subscriptions, paymentSubscription => paymentSubscription.status === 'active');

      if (!activePaymentSubscriptions.length) {
        return null;
      }

      if (!activePaymentSubscriptions.length > 1) {
        throw Error('Too many active subscription');
      }

      return activePaymentSubscriptions[0];
    },
    showChangeNextPaymentDateButton() {
      return this.membership
          && !this.membership.archived
          && this.membership.status === 'active';
    },
    changeMembershipPaidUntilDialogMembershipPauseInfo() {
      const formattedStartDate = moment(this.membership.current_or_upcoming_membership_pause.start_date)
          .format('DD-MM-YYYY');
      const formattedEndDate = this.membership.current_or_upcoming_membership_pause.end_date
          ? moment(this.membership.current_or_upcoming_membership_pause.end_date)
              .format('DD-MM-YYYY')
          : '?';
      return `${formattedStartDate} - ${formattedEndDate}`;
    },
    actualNewPaymentDateIncludingMembershipPause() {
      if (!this.showChangeMembershipPaidUntilDialog || !this.membership.current_or_upcoming_membership_pause) return null;
      if (this.membership.current_or_upcoming_membership_pause.start_date > moment(this.changeMembershipNextPaymentDate)
          .format('YYYY-MM-DD')) {
        return moment(this.changeMembershipNextPaymentDate)
            .format('DD-MM-YYYY');
      }
      if (!this.membership.current_or_upcoming_membership_pause.end_date) return this.$t('global.UnknownAsPauseHasNoEndDate');
      return moment(this.changeMembershipNextPaymentDate)
          .add(this.membership.membership_pause_length, 'days')
          .format('DD-MM-YYYY');
    },
    showPauseMembershipButton() {
      return this.membership
          && !this.membership.archived
          && (
              this.membership.status === 'active'
            || (
                this.membership.status === 'cancelled_running'
              && this.membership.current_or_upcoming_membership_pause
              )
          );
    },
    pauseMembershipButtonText() {
      return this.membership && this.membership.current_or_upcoming_membership_pause
        ? this.$t('global.EditMembershipPause')
        : this.$t('global.PauseMembership');
    },
    pauseMembershipDialogTitle() {
      return this.membership && this.membership.current_or_upcoming_membership_pause
          ? this.$t('global.EditMembershipPause')
          : this.$t('global.PauseMembership');
    },
    pauseMembershipDialogSubmitButtonText() {
      if (this.membership && this.membership.current_or_upcoming_membership_pause) {
        return this.$t('global.Save');
      }
      const startDateIso = moment(this.pauseMembershipDialogStartDate)
          .format('YYYY-MM-DD');
      const todayIsoDate = moment.tz('Europe/Copenhagen')
          .format('YYYY-MM-DD');
      return startDateIso > todayIsoDate
          ? this.$t('global.ScheduleMembershipPause')
          : this.$t('global.PauseMembership');
    },
    pauseMembershipDialogFeeDisabled() {
      return !!this.membership && !!this.membership.current_or_upcoming_membership_pause
          && this.membership.current_or_upcoming_membership_pause.fee > 0
          && !!this.membership.current_or_upcoming_membership_pause.fee_paid_with_order_id;
    },
    previousMembershipPauses() {
      let previousMembershipPauses = [];
      if (this.membership.current_or_upcoming_membership_pause) {
        previousMembershipPauses = this.membership && this.membership.membership_pauses.length > 1
            ? this.membership.membership_pauses.slice(0, -1)
            : [];
      } else {
        previousMembershipPauses = this.membership && this.membership.membership_pauses.length
            ? this.membership.membership_pauses
            : [];
      }
      return _.chain(previousMembershipPauses)
          .sortBy('start_date')
          .reverse()
          .value();

    },
  },
  mounted() {
    if (this.stateReady) this.fetchData();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchData();
    },
    changeMembershipDialogMembershipType(membershipTypeId) {

      const selectedMembershipType = _.find(this.membershipTypes, membershipType => membershipType.id === membershipTypeId);

      this.changeMembershipDialogPaymentOptions = selectedMembershipType.payment_options;

      this.$nextTick(
          () => {
            if (membershipTypeId === this.membership.membership_type.id) {
              this.changeMembershipDialogSelectedPaymentOption = this.membership.payment_option.id;
            } else {
              this.changeMembershipDialogSelectedPaymentOption = this.changeMembershipDialogPaymentOptions[0].id;
            }
          },
      );

    },
    pauseMembershipDialogStartDate(newMembershipPauseStartDate) {
      if (moment(newMembershipPauseStartDate)
          .isSameOrAfter(moment(this.pauseMembershipDialogEndDate))) {
        this.pauseMembershipDialogEndDate = moment(newMembershipPauseStartDate)
            .add(1, 'day')
            .toDate();
      }
    },
  },
  methods: {

    ...mapActions('alert', { setAlertCallback: 'setCallback' }),

    async fetchData() {

      this.loading = true;

      const membershipQuery = qs.stringify({
        id: this.$route.params.id,
        populate: [
          'payment_option',
          'user',
          'membership_type',
          'membership_type.payment_options',
          'payment_subscriptions',
          'payment_subscriptions.payment_subscription_transactions',
          'orders',
          'log_entries',
          'user',
          'discount_code',
          'membership_campaign',
          'membership_pauses',
          'next_payment',
          'pending_no_show_fees',
          'pending_no_show_fees.class',
          'pending_no_show_fees.class.class_type',
          'pending_no_show_fees.class_signup',
          'current_membership_pause',
          'upcoming_membership_pause',
          'current_or_upcoming_membership_pause',
          'earliest_valid_membership_pause_start_date',
          'status_text',
          'membership_pause_affects_next_payment_date',
          'membership_pause_starts_days_before_next_payment_date',
          'membership_pause_length',
          'cancelled_from_date_including_membership_pause'
        ],
      });

      [this.membershipTypes, this.membership] = await Promise.all([
        YogoApi.get('/membership-types?populate[]=payment_options'),
        YogoApi.get(`/memberships?${membershipQuery}`),
      ]);

      this.applicableDiscountCodes = await YogoApi.get(
          '/discount-codes?validFor=membership_type_' + this.membership.membership_type.id,
      );

      this.membership.orders.reverse();

      this.membership.no_show_fees = _.filter(
          this.membership.no_show_fees,
          fee => !fee.paid_with_order_id,
      );

      this.membership.log_entries = _.chain(this.membership.log_entries)
          .orderBy('createdAt')
          .reverse()
          .value();

      this.loading = false;

    },
    changeDiscountCodeClick() {
      this.discountCodeDialogDiscountCode = this.membership.discount_code ? this.membership.discount_code.id : 0;
      this.showDiscountCodeDialog = true;
    },
    async changeDiscountCode() {
      if (parseInt(this.discountCodeDialogDiscountCode) === parseInt(this.membership.discount_code ? this.membership.discount_code.id : 0)) {
        this.showDiscountCodeDialog = false;
        return;
      }
      await YogoApi.put('/memberships/' + this.membership.id, {
        discount_code: this.discountCodeDialogDiscountCode > 0 ? this.discountCodeDialogDiscountCode : null,
      });
      this.fetchData();
      this.showDiscountCodeDialog = false;
    },
    getPayType(payType) {

      const payTypes = {
        'V-DK': 'Visa/Dankort',
        'MC': 'Eurocard/Mastercard',
        'MC(DK)': 'Eurocard/Mastercard (DK)',
        'MC(SE)': 'Eurocard/Mastercard (SE)',
        'DIN': 'Diners Club',
        'DIN(DK)': 'Diners Club (DK)',
        'AMEX': 'American Express',
        'AMEX(DK)': 'American Express (DK)',
        'MTRO': 'Maestro',
        'MTRO(DK)': 'Maestro(DK)',
        'ELEC': 'VISA Electron',
        'FFK': 'Forbrugsforeningen',
      };
      if (payTypes[payType]) return payTypes[payType];

      return payType;

    },

    getOrderStatusText(order) {
      if (order.payment_failed) {
        return this.$t('global.Rejected');
      } else if (order.paid) {
        return this.$t('global.Paid');
      } else {
        return this.$t('global.AwaitingPayment');
      }
    },
    changeMembershipClick() {
      this.changeMembershipDialogMembershipType = this.membership.membership_type.id;
      this.changeMembershipDialogSelectedPaymentOption = this.membership.payment_option.id;
      this.showChangeMembershipDialog = true;
    },
    changeMembershipPaidUntilClick() {
      this.changeMembershipNextPaymentDate = moment(this.membership.paid_until)
          .add(1, 'day')
          .toDate();
      this.showChangeMembershipPaidUntilDialog = true;
    },
    async changeMembership() {
      const dkkFilter = this.$options.filters.currency_dkk;
      const newMembershipType = _.find(
          this.membershipTypes,
          membershipType => membershipType.id === this.changeMembershipDialogMembershipType,
      );
      const membershipTypeIsChanging = this.membership.membership_type.id !== newMembershipType.id;
      const newPaymentOption = _.find(
          newMembershipType.payment_options,
          paymentOption => paymentOption.id === this.changeMembershipDialogSelectedPaymentOption,
      );
      const paymentOptionIsChanging = this.membership.payment_option.id !== newPaymentOption.id;

      if (!membershipTypeIsChanging && !paymentOptionIsChanging) {
        alert('Du har ikke skiftet medlemskabstype eller betalingsperiode');
        return;
      }

      let confirmText =
          this.$t('global.DoYouWantToChangeMembershipFrom') +
          this.membership.membership_type.name + ',  ' +
          this.membership.payment_option.name + ' / ' +
          dkkFilter(this.membership.payment_option.payment_amount) + ' kr.' +
          this.$t('global.toSpace') +
          newMembershipType.name + ', ' +
          newPaymentOption.name + ' / ' +
          dkkFilter(newPaymentOption.payment_amount) + '?';

      if (membershipTypeIsChanging) {
        confirmText += this.$t('global.FutureClassesDesc');
      }

      if (!confirm(confirmText)) return;

      let updateData = {
        payment_option: newPaymentOption.id,
      };
      if (membershipTypeIsChanging) {
        updateData.membership_type = newMembershipType.id;
      }

      this.showChangeMembershipDialog = false;
      this.loading = true;

      await YogoApi.put('/memberships/' + this.$route.params.id, updateData);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.MembershipHasChanged'),
      });

      this.fetchData();

    },
    async changeMembershipPaidUntil() {
      const newPaymentDate = moment(this.changeMembershipNextPaymentDate);
      if (newPaymentDate.isBefore(moment()
          .subtract(28, 'days'))) {
        alert(this.$t('global.CantChangePaymentDate'));
        return;
      }
      if (!confirm(
          this.$t(
              'global.DoYouWantToChangePaymentDateFromDateToDate',
              {
                fromDate: this.formatDate(moment(this.membership.paid_until)
                    .add(1, 'day')),
                toDate: this.formatDate(newPaymentDate),
              },
          ),
      )) {
        return;
      }

      this.showChangeMembershipPaidUntilDialog = false;
      this.loading = true;

      await YogoApi.put('/memberships/' + this.membership.id, {
        paid_until: newPaymentDate.subtract(1, 'day')
            .format('YYYY-MM-DD'),
      });

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.PaymentDateWasChanged'),
      });

      this.fetchData();
    },
    async stopMembershipClick() {
      switch (this.membership.status) {
        case 'cancelled_running':
          if (!confirm(
              this.$t('global.DoYouWannaStopMembership') +
              this.$t('global.ThisWillCancelMembershipDesc'),
          )) {
            return;
          }
          await this.stopMembershipNow();
          return;

        case 'active':
          this.showStopMembershipDialog = true;
          return;

        case 'renewal_failed':
          if (!confirm(
              this.$t('global.DoYouWannaStopMembership') +
              this.$t('global.ThisWillCancelMembershipDesc'),
          )) {
            return;
          }
          await this.stopMembershipNow();
          return;
      }

    },
    async stopMembershipNow() {
      this.loading = true;

      await YogoApi.put('/memberships/' + this.membership.id, { status: 'ended' });

      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.membership.membership_type.name + this.$t('global.hasStopped'),
      });

      this.$router.push({
        name: 'CustomerInfo',
        params: { id: this.membership.user.id },
      });

    },
    async stopMembershipAccordingToTerms() {
      this.loading = true;
      this.showStopMembershipDialog = false;

      await YogoApi.put('/memberships/' + this.membership.id, {
        status: 'cancelled_running',
      });

      this.loading = false;
      this.showStopMembershipDialog = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.membership.membership_type.name + this.$t('global.stops') + (this.membership.payment_option.number_of_months_payment_covers === 1 ? this.$t('global.oneMonthAfterNextPayment') : this.$t('global.whenPaidPeriodExpire')),
      });

      this.fetchData();
    },
    async resumeMembershipClick() {
      if (!confirm(this.$t('global.ResumeMembership') + '?')) return;
      this.loading = true;
      await YogoApi.put('/memberships/' + this.$route.params.id, {
        status: 'active',
      });
      this.fetchData();
    },

    getReceiptLink(order) {
      return this.apiRoot + '/orders/' + order.id + '/pdf-receipt?receiptToken=' + order.receipt_token;
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

      this.fetchData();
    },
    async reactivateFee(noShowFee) {
      await YogoApi.post(`/no-show-fees/${noShowFee.id}/reactivate`);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.NoShowFeeActivated'),
      });

      this.fetchData();
    },
    pauseMembershipClick() {
      if (this.membership.current_or_upcoming_membership_pause) {
        return this.editCurrentOrUpcomingMembershipPauseClick();
      }
      this.pauseMembershipDialogStartDate = moment.tz('Europe/Copenhagen')
          .toDate();
      this.pauseMembershipDialogEndDate = moment.tz('Europe/Copenhagen')
          .add(1, 'month')
          .toDate();
      this.pauseMembershipDialogPauseMembershipIndefinitely = false;
      this.pauseMembershipDialogFee = this.client.settings.membership_pause_fee;
      this.pauseMembershipDialogComment = '';
      this.showPauseMembershipDialog = true;
    },
    editCurrentOrUpcomingMembershipPauseClick() {
      this.pauseMembershipDialogStartDate = moment(this.membership.current_or_upcoming_membership_pause.start_date)
          .toDate();
      this.pauseMembershipDialogEndDate = this.membership.current_or_upcoming_membership_pause.end_date
          ? moment(this.membership.current_or_upcoming_membership_pause.end_date)
              .toDate()
          : moment(this.membership.current_or_upcoming_membership_pause.start_date)
              .add(1, 'month')
              .toDate();
      this.pauseMembershipDialogPauseMembershipIndefinitely = !this.membership.current_or_upcoming_membership_pause.end_date;
      this.pauseMembershipDialogFee = this.membership.current_or_upcoming_membership_pause.fee;
      this.pauseMembershipDialogComment = this.membership.current_or_upcoming_membership_pause.comment;
      this.showPauseMembershipDialog = true;
    },
    pauseMembershipStartDateDisabledDates(date) {
      const isoDate = moment(date)
          .format('YYYY-MM-DD');
      return isoDate < this.membership.earliest_valid_membership_pause_start_date;
    },
    pauseMembershipEndDateDisabledDates(date) {
      const isoDate = moment(date)
          .format('YYYY-MM-DD');
      const membershipPauseStartDateIso = moment(this.pauseMembershipDialogStartDate)
          .format('YYYY-MM-DD');
      return isoDate <= membershipPauseStartDateIso;
    },

    async submitPauseMembershipDialog(overrideImmediatePaymentsWarning = false) {
      const existingMembershipPause = this.membership.current_or_upcoming_membership_pause;

      const pauseStartDateIso = moment(this.pauseMembershipDialogStartDate)
          .format('YYYY-MM-DD');
      const todayIsoDate = moment.tz('Europe/Copenhagen')
          .format('YYYY-MM-DD');

      if (this.pauseMembershipDialogFeeDisabled && parseInt(this.pauseMembershipDialogFee) !== parseInt(existingMembershipPause.fee)) {
        alert('Fee for membership pause has been paid and can not be changed');
        return;
      }

      if (
          this.pauseMembershipDialogFee > 0
          && (
              !existingMembershipPause
              || parseInt(this.pauseMembershipDialogFee) !== parseInt(existingMembershipPause.fee)
          )
      ) {
        if (!this.membership.payment_subscriptions.length) {
          alert(this.$t('global.MembershipNeedsAPaymentMethodToChargeFeeForMembershipPause'));
          return;
        }
        if (!confirm(this.$t(
            'global.FeeWillBeChargedImmediately',
            { fee: this.formatCurrencyDkk(this.pauseMembershipDialogFee) },
        ))) {
          return;
        }
      }
      this.loading = true;

      if (existingMembershipPause) {
        await this.updateMembershipPause(overrideImmediatePaymentsWarning);
      } else {
        await this.createMembershipPause();
      }
      this.showPauseMembershipDialog = false;
      this.fetchData();
    },
    async createMembershipPause() {
      this.loading = true;
      this.showPauseMembershipDialog = false;
      const startDateIso = moment(this.pauseMembershipDialogStartDate)
          .format('YYYY-MM-DD');
      const response = await YogoApi.post(
          `/membership-pauses`,
          {
            start_date: startDateIso,
            end_date: this.pauseMembershipDialogPauseMembershipIndefinitely
                ? null
                : moment(this.pauseMembershipDialogEndDate)
                    .format('YYYY-MM-DD'),
            membership: this.membership.id,
            fee: this.pauseMembershipDialogFee,
            comment: this.pauseMembershipDialogComment,
          },
          { headers: { 'X-Yogo-Client-Accepts-Extended-Error-Format': 1 } },
      );
      if (response.error) {
        this.loading = false;
        this.setAlertCallback(() => {
          this.showPauseMembershipDialog = true;
        });
        return;
      }
      const todayIsoDate = moment.tz('Europe/Copenhagen')
          .format('YYYY-MM-DD');
      if (startDateIso <= todayIsoDate) {
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.MembershipHasBeenPaused'),
        });
      } else {
        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.MembershipPauseScheduled'),
        });
      }
    },
    async updateMembershipPause() {
      const earliestPaymentDateIso = moment.tz('Europe/Copenhagen')
          .subtract(28, 'days')
          .format('YYYY-MM-DD');
      const currentPaymentDateIso = moment.tz(this.membership.paid_until, 'Europe/Copenhagen')
          .add(1, 'day')
          .format('YYYY-MM-DD');
      const membershipPauseStartDateIso = moment(this.pauseMembershipDialogStartDate)
          .format('YYYY-MM-DD');

      let resultingPaymentDateIso;
      if (membershipPauseStartDateIso <= currentPaymentDateIso) {
        if (!this.pauseMembershipDialogPauseMembershipIndefinitely) {
          resultingPaymentDateIso = null;
        } else {
          const membershipPauseLength = moment(this.pauseMembershipDialogEndDate)
              .diff(moment(this.pauseMembershipDialogStartDate), 'days');
          resultingPaymentDateIso = moment.tz(this.membership.paid_until, 'Europe/Copenhagen')
              .add(membershipPauseLength + 1, 'days')
              .format('YYYY-MM-DD');
        }
      } else {
        resultingPaymentDateIso = currentPaymentDateIso;
      }

      if (resultingPaymentDateIso < earliestPaymentDateIso) {
        alert(this.$t('global.CantEditMembershipPauseBecausePaymentDateIsTooEarly', { resultingPaymentDate: formatDate(moment(resultingPaymentDateIso)) }));
        return;
      }

      this.loading = true;
      this.showPauseMembershipDialog = false;

      const response = await YogoApi.put(
          `/membership-pauses/${this.membership.current_or_upcoming_membership_pause.id}`,
          {
            start_date: moment(this.pauseMembershipDialogStartDate)
                .format('YYYY-MM-DD'),
            end_date: this.pauseMembershipDialogPauseMembershipIndefinitely
                ? null
                : moment(this.pauseMembershipDialogEndDate)
                    .format('YYYY-MM-DD'),
            fee: this.membership.current_or_upcoming_membership_pause.fee_paid_with_order_id
                ? undefined
                : this.pauseMembershipDialogFee,
            comment: this.pauseMembershipDialogComment,
          },
          { headers: { 'X-Yogo-Client-Accepts-Extended-Error-Format': 1 } },
      );

      if (response.error) {
        this.loading = false;
      }

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.MembershipPauseUpdated'),
      });
    },

    async deleteMembershipPause() {

      if (this.membership.paid_until < moment.tz('Europe/Copenhagen')
          .subtract(28, 'days')
          .format('YYYY-MM-DD')
      ) {
        const resultingPaymentDate = moment.tz(this.membership.paid_until, 'Europe/Copenhagen')
            .add(1, 'day');
        alert(this.$t('global.CantDeleteMembershipPauseBecausePaymentDateIsTooEarly', { resultingPaymentDate: formatDate(resultingPaymentDate) }));
        return;
      }

      if (!confirm(this.$t('global.DoYouWantToRemoveTheMembershipPause'))) {
        return;
      }

      if (
          this.membership.current_or_upcoming_membership_pause.fee_paid_with_order_id
          && !confirm(
          this.$t(
              'global.MembershipPauseFeeHasBeenPaidAndWillNotBeRefundedAutomatically',
              { fee: this.formatCurrencyDkk(this.membership.current_or_upcoming_membership_pause.fee) },
          ),
          )
      ) {
        return;
      }

      await YogoApi.delete(
          `/membership-pauses/${this.membership.current_or_upcoming_membership_pause.id}`,
          { headers: { 'X-Yogo-Client-Accepts-Extended-Error-Format': 1 } },
      );
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.MembershipPauseRemoved'),
      });
      this.showPauseMembershipDialog = false;
      this.fetchData();
    },

    moment: moment,
  },

};
</script>

<style>


</style>
