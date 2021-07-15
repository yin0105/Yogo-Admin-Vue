<template>
  <div>
    <h2>{{ $t('global.GiftCards') }}</h2>

    <router-link :to="{ name: 'GiftCardAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right z-10">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateGiftCard') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>

    <div v-else style="min-height:350px;">

      <div>
        <md-checkbox v-model="showUsedUpGiftCards">
          {{ $t('global.ShowUsedUpGiftCards') }}
        </md-checkbox>
        <md-checkbox v-model="showExpiredGiftCards">
          {{ $t('global.ShowExpiredGiftCards') }}
        </md-checkbox>
      </div>

      <md-table v-model="filteredGiftCards" md-card @md-selected="onSelectGiftCard">

        <md-empty-state
            md-icon="card_giftcard"
            :md-label="$t('global.NoGiftCards')"
            :md-description="$t('global.NoGiftCardsSoldYet')">
        </md-empty-state>

        <md-table-row
            slot="md-table-row"
            slot-scope="{ item }"
            :key="'gift_card_' + item.id"
            :class="{'turkis': !item.sent_at}"
            md-selectable="single"
        >
          <md-table-cell :md-label="$t('global.Purchased')">
            {{
              formatDate(item.createdAt, {
                time: true,
                month: 'short',
              })
            }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Sent')" md-sort-by="sort_by_sent">
            <span v-if="item.sent_at">
              {{
                formatDate(item.sent_at, {
                  time: true,
                  month: 'short',
                })
              }}<br>
              <span v-if="item.sent_by === 'user'">
                ({{ `${item.sent_by_user.first_name} ${item.sent_by_user.last_name}`.trim() }})</span>
              <span v-else>({{ $t('global.SentBySystem') }})</span>
            </span>
            <span v-else>
              --
            </span>
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Giver')" md-sort-by="giver_name">
            {{ item.giver_name }}<br>
            {{ item.giver_email }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Recipient')" md-sort-by="recipient_name">
              {{ item.recipient_name }}<br>
              {{ item.recipient_email }}
          </md-table-cell>
          <md-table-cell :md-label="$t('global.Amount')">{{ item.amount | currency_dkk }} DKK</md-table-cell>
          <md-table-cell :md-label="$t('global.AmountLeft')">{{ item.amount_left | currency_dkk }} DKK</md-table-cell>
          <md-table-cell :md-label="$t('global.ValidUntil')" md-sort-by="valid_until">
            {{ formatDate(item.valid_until, { month: 'short' }) }}
          </md-table-cell>

        </md-table-row>
      </md-table>

    </div>

    <div class="space8"></div>

    <md-dialog :md-active.sync="showGiftCardInfoDialog" v-if="infoDialogGiftCard" class="info-dialog">
      <md-dialog-title>{{ infoDialogGiftCard.giver_name }} → {{
          infoDialogGiftCard.recipient_name
        }}
      </md-dialog-title>
      <md-dialog-content>

        <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
          <div>
            <span class="bold">
              {{ $t('global.GiverName') }}:
            </span>
            {{ infoDialogGiftCard.giver_name }}
          </div>
          <md-button
            class="md-icon-button md-dense"
            @click="copyToClipboard(infoDialogGiftCard.giver_name)">
            <md-icon>content_copy</md-icon>
          </md-button>
        </div>

        <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
          <div>
            <span class="bold">
              {{ $t('global.GiverEmail') }}:
            </span>
            {{ infoDialogGiftCard.giver_email }}
          </div>
          <md-button
            class="md-icon-button md-dense"
            @click="copyToClipboard(infoDialogGiftCard.giver_email)">
            <md-icon>content_copy</md-icon>
          </md-button>
        </div>

        <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
          <div>
            <span class="bold">
              {{ $t('global.RecipientName') }}:
            </span>
            {{ infoDialogGiftCard.recipient_name }}
          </div>
          <md-button
            class="md-icon-button md-dense"
            @click="copyToClipboard(infoDialogGiftCard.recipient_name)">
            <md-icon>content_copy</md-icon>
          </md-button>
        </div>

        <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
          <div>
            <span class="bold">
              {{ $t('global.RecipientEmail') }}:
            </span>
            {{ infoDialogGiftCard.recipient_email }}
          </div>
          <md-button
            class="md-icon-button md-dense"
            @click="copyToClipboard(infoDialogGiftCard.recipient_email)">
            <md-icon>content_copy</md-icon>
          </md-button>
        </div>

        <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
          <div>
            <span class="bold">
              {{ $t('global.Code') }}:
            </span>
            {{ infoDialogGiftCard.code }}
          </div>
          <md-button
            class="md-icon-button md-dense"
            @click="copyToClipboard(infoDialogGiftCard.code)"
          >
            <md-icon>content_copy</md-icon>
          </md-button>
        </div>

        <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
          <div>
            <span class="bold">
              {{ $t('global.Sent') }}:
            </span>
            <span v-if="infoDialogGiftCard.sent_at">
            {{ formatDate(infoDialogGiftCard.sent_at) }}
            <span v-if="infoDialogGiftCard.sent_by === 'user'">
            ({{ `${infoDialogGiftCard.sent_by_user.first_name} ${infoDialogGiftCard.sent_by_user.last_name}`.trim() }})
            </span>
            <span v-else>({{ $t('global.SentBySystem') }})</span>
            </span>
            <span v-else>--</span>
            </div>
          </div>

          <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
            <div>
              <span class="bold">
                {{ $t('global.Amount') }}:
              </span>
              {{ formatCurrencyDkk(infoDialogGiftCard.amount) }} DKK
            </div>
            <md-button
              class="md-icon-button md-dense"
              @click="copyToClipboard(formatCurrencyDkk(infoDialogGiftCard.amount))"
            >
              <md-icon>content_copy</md-icon>
            </md-button>
          </div>

          <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
            <div>
              <span class="bold">
                {{ $t('global.AmountLeft') }}:
              </span>
              {{ formatCurrencyDkk(infoDialogGiftCard.amount_left) }} DKK
            </div>

            <md-button
              class="md-icon-button md-dense"
              @click="copyToClipboard(formatCurrencyDkk(infoDialogGiftCard.amount_left))"
            >
              <md-icon>content_copy</md-icon>
            </md-button>
          </div>

          <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
            <div>
              <span class="bold">
                {{ $t('global.Created') }}:
              </span>
              {{ formatDate(infoDialogGiftCard.createdAt, { time: true }) }}<br>

              {{ $t('global.InvoiceNo') }}:
              <span v-if="infoDialogGiftCard.paid_with_order">
                {{ infoDialogGiftCard.paid_with_order.invoice_id }}
              </span>
              <span v-else>
                --
              </span>
            </div>
            <md-button
              class="md-icon-button md-dense"
              @click="copyToClipboard(formatDate(infoDialogGiftCard.createdAt, { time: true }))"
            >
              <md-icon>content_copy</md-icon>
            </md-button>
          </div>

          <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
            <div>
              <span class="bold">
                {{ $t('global.ValidUntil') }}:
              </span>
              {{ formatDate(infoDialogGiftCard.valid_until) }}
            </div>
            <md-button
              class="md-icon-button md-dense"
              @click="copyToClipboard(formatDate(infoDialogGiftCard.valid_until))"
            >
              <md-icon>content_copy</md-icon>
            </md-button>
          </div>

          <div class="flex py-1 items-center justify-between border-bottom flex-wrap">
            <div>
              <span class="bold">{{ $t('global.Message') }}:</span>
              <span class="italic">
                {{ infoDialogGiftCard.message }}
              </span>
            </div>
            <md-button
              class="md-icon-button md-dense"
              @click="copyToClipboard(infoDialogGiftCard.message)"
            >
              <md-icon>content_copy</md-icon>
            </md-button>
          </div>

          <div class="mt-4">
            <h4>{{ $t('global.Log') }}</h4>

            <table>
              <tr v-for="entry in infoDialogGiftCard.log_entries">
                <th>{{ formatDate(entry.createdAt, {time: true}) }}</th>
                <td>{{ entry.entry }}</td>
              </tr>
            </table>
          </div>


      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="showGiftCardInfoDialog = false">
          {{ $t('global.Dismiss') }}
        </md-button>
        <md-button class="md-raised" v-if="infoDialogGiftCard.sent_at"
                   @click="registerAsNotSent(infoDialogGiftCard)">
          {{ $t('global.RegisterAsNotSent') }}
        </md-button>
        <md-button class="md-raised" v-else @click="registerAsSent(infoDialogGiftCard)">
          {{ $t('global.RegisterAsSent') }}
        </md-button>
        <md-button class="red text-white md-raised" @click="deleteGiftCard">
          {{ $t('global.Delete') }}
        </md-button>
        <md-button class="md-primary md-raised"
                   @click="$router.push({name: 'GiftCardEdit', params: {id: infoDialogGiftCard.id}})">
          {{ $t('global.Edit') }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

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
import currencyFormatters from '@/mixins/currencyFormatters';

export default {
  components: {
    LoadingAnimation,
    Datepicker,
  },
  mixins: [dateTimeFunctions, currencyFormatters],
  data() {
    return {
      loading: true,

      giftCards: [],
      showExpiredGiftCards: false,
      showUsedUpGiftCards: false,

      showGiftCardInfoDialog: false,
      infoDialogGiftCard: null,
    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
      'client',
    ]),
    filteredGiftCards() {
      const today = moment.tz('Europe/Copenhagen');
      return _.chain(this.giftCards)
          .filter(
              (giftCard) => {
                if (!this.showUsedUpGiftCards && giftCard.amount_left <= 0) {
                  return false;
                }
                return this.showExpiredGiftCards || moment.tz(giftCard.valid_until, 'Europe/Copenhagen')
                    .isSameOrAfter(today, 'day');
              },
          )
          .sortBy('createdAt')
          .reverse()
          .value();
    },
  },
  created() {
    if (this.stateReady) this.fetchGiftCards();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchGiftCards();
    },
    date(newDate) {
      this.fetchGiftCards();
    },
  },
  methods: {
    async fetchGiftCards() {
      const queryString = qs.stringify({
        populate: [
          'sent_by_user',
          'paid_with_order',
          'log_entries',
        ],
      });

      this.giftCards = await YogoApi.get(`/gift-cards?${queryString}`);

      this.noShowFees = _.sortBy(this.noShowFees, 'createdAt');

      this.loading = false;

    },

    onSelectGiftCard(selectedGiftCard) {
      this.infoDialogGiftCard = selectedGiftCard;
      this.showGiftCardInfoDialog = true;
    },

    copyToClipboard(content) {
      this.$copyText(content)
          .then(() => {
            this.$store.commit('postFlashMessage', {
              type: 'MESSAGE_TYPE_INFO',
              text: this.$t('global.CopiedToClipboard'),
            });
          });
    },

    async registerAsSent(giftCard) {
      await YogoApi.post(
          `/gift-cards/${giftCard.id}/register-as-sent`,
          {},
          { headers: { 'X-Yogo-Client-Accepts-Extended-Error-Format': 1 } },
      );
      this.showGiftCardInfoDialog = false;
      await this.fetchGiftCards();
    },

    async registerAsNotSent(giftCard) {
      await YogoApi.post(
          `/gift-cards/${giftCard.id}/register-as-not-sent`,
          {},
          { headers: { 'X-Yogo-Client-Accepts-Extended-Error-Format': 1 } },
      );
      this.showGiftCardInfoDialog = false;
      await this.fetchGiftCards();
    },

    async deleteGiftCard() {
      if (!confirm(this.$t('global.DoYouWantToDeleteThisGiftCard'))) return;

      await YogoApi.delete(`/gift-cards/${this.infoDialogGiftCard.id}`);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.GiftCardHasBeenDeleted'),
      });
      this.showGiftCardInfoDialog = false;
      await this.fetchGiftCards();
    },

  },
};
</script>

<style lang="scss">

.info-dialog {

  table {
    border-collapse: collapse;
  }

  th, td {
    padding: 4px 10px;
    border: 1px solid #ccc;
  }

  th {
    text-align: right;
    border: 1px solid #ccc;
    white-space: nowrap;
  }

  td {
    white-space: normal;
  }

  td > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
