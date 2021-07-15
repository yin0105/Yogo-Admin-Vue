<template>
  <div>
    <md-table v-model="membershipTypes" :md-sort.sync="tableSortField"
              :md-sort-order.sync="tableSortOrder" :md-sort-fn="tableSortFn" md-card
              @md-selected="onSelectMembershipType">
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.ID')" md-sort-by="id">{{ item.id }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.MembershipType')" md-sort-by="name">{{ item.name }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.PriceGroups')" md-sort-by="price_groups">{{ getPriceGroups(item)
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Price')" md-sort-by="payment_options" md-numeric>{{ getMembershipTypePrice(item) }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.NumberOfMemberships')" md-sort-by="membershipCount" md-numeric>{{ item.membershipCount }}{{
          item.has_max_number_of_memberships ? ' (max ' + item.max_number_of_memberships + ')' : ''
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.ActiveCampaign')" md-sort-by="active_campaign"><span v-if="item.active_campaign">{{ item.active_campaign.name }} - {{ item.active_campaign.number_of_months_at_reduced_price }} {{ $t('global.MonthsTo') }} {{ item.active_campaign.reduced_price }} kr</span><span
          v-else>--</span>
        </md-table-cell>

      </md-table-row>

      <md-table-empty-state>
        {{ $t('global.NoMembershipTypes') }}
      </md-table-empty-state>

    </md-table>
  </div>
</template>

<script>

  import customTableSort from '../helpers/customTableSort'

  export default {
    name: 'MembershipTypeList',
    props: ['membershipTypes'],
    data() {
      return {
        tableSortField: 'name',
        tableSortOrder: 'asc',
      }
    },
    computed: {
      showCampaignColumn() {
        return !!_.find(this.membershipTypes, membershipType => membershipType.active_campaign)
      },
    },
    methods: {
      onSelectMembershipType(membershipType) {
        this.$router.push({
          name: 'MembershipTypeEdit',
          params: { id: membershipType.id },
        })
      },
      getMembershipTypePrice(membershipType) {
        const dkkFilter = this.$options.filters.currency_dkk

        return _.chain(membershipType.payment_options)
          .filter(paymentOption => paymentOption.for_sale)
          .sortBy('number_of_months_payment_covers')
          .map(paymentOption => dkkFilter(paymentOption.payment_amount) + ' kr')
          .value()
          .join(' / ')

      },
      getPriceGroups(membershipType) {
        if (!membershipType.price_groups.length) {
          return '--'
        }
        return _.map(membershipType.price_groups, 'name')
          .join(', ')
      },
      tableSortFn(value) {
        const sortMethods = {
          id: 'number',
          name: 'string',
          payment_options: (a, b) => {
            const aPaymentOptions = _.chain(a.payment_options)
              .filter({ for_sale: true })
              .sortBy('number_of_months_payment_covers')
              .value()

            const bPaymentOptions = _.chain(b.payment_options)
              .filter({ for_sale: true })
              .sortBy('number_of_months_payment_covers')
              .value()
            let idx = 0
            while (
              typeof aPaymentOptions[idx] !== 'undefined'
              && typeof bPaymentOptions[idx] !== 'undefined'
              && aPaymentOptions[idx].payment_amount === bPaymentOptions[idx].payment_amount
              ) {
              idx += 1
            }

            if (typeof aPaymentOptions[idx] === 'undefined') return -1
            if (typeof bPaymentOptions[idx] === 'undefined') return 1
            if (parseFloat(aPaymentOptions[idx].payment_amount) < parseFloat(bPaymentOptions[idx].payment_amount)) return -1
            if (parseFloat(aPaymentOptions[idx].payment_amount) > parseFloat(bPaymentOptions[idx].payment_amount)) return 1
            return 0
          },
          days: 'number',
          membershipCount: 'number',
          price_groups: 'array_element_name',
          active_campaign: 'object_name',
        }
        return customTableSort(
          value,
          this.tableSortField,
          this.tableSortOrder,
          sortMethods[this.tableSortField],
        )
      },
    },
  }
</script>
