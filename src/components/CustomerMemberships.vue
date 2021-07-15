<template>
  <div>
    <md-table
      v-model="memberships"
      md-sort="name"
      md-sort-order="asc"
      md-card
      v-if="memberships.length"
      @md-selected="onSelectMembership"
    >
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.Membership')">{{ item.membership_type.name }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Payment')">{{item.payment_option.name }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.NextPayment')">{{ item.next_payment && item.next_payment.date ?
          formatDate(item.next_payment.date) : '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Amount')"><span v-if="item.next_payment">{{ item.next_payment.amount | currency_dkk }}
          kr.</span><span v-else>--</span>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Status')">
          {{ item.status_text }}
        </md-table-cell>
      </md-table-row>

    </md-table>

    <p v-else>
      {{ $t('global.NoMemberships') }}<br>
    </p>

  </div>
</template>

<script>

  import { mapGetters } from 'vuex'
  import moment from 'moment'
  import dateTimeFunctions from '@/mixins/dateTimeFunctions';

  export default {
    name: 'CustomerMemberships',
    props: ['memberships'],
    mixins: [dateTimeFunctions],
    computed: {
      ...mapGetters([
        'client',
      ]),
    },
    methods: {
      moment: moment,
      onSelectMembership(membership) {
        this.$router.push({
          name: 'Membership',
          params: {
            id: membership.id,
          },
        })
      },
    },
  }
</script>
