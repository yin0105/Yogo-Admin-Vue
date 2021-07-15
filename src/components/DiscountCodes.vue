<template>
  <div>
    <h2>{{ $t('global.PromotionCodes') }}</h2>

    <router-link :to="{ name: 'DiscountCodeAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreatePromotionCode') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>
    <md-table
      v-model="discountCodes"
      md-card v-else @md-selected="onSelectDiscountCode"
      :md-sort.sync="currentSort"
      :md-sort-order.sync="currentSortOrder"
      :md-sort-fn="customSort"
    >

      <md-empty-state
        md-icon="monetization_on"
        :md-label="$t('global.CreatePromotionCode')"
        :md-description="$t('global.NoPromotionCodesYet')">
        <router-link :to="{name:'DiscountCodeAdd'}">
          <md-button class="md-primary md-raised">{{ $t('global.CreatePromotionCode') }}</md-button>
        </router-link>
      </md-empty-state>

      <md-table-row
        slot="md-table-row"
        slot-scope="{ item }"
        md-selectable="single"
        >
        <md-table-cell md-sort-by="name" :md-label="$t('global.Code')">{{ item.name }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Discount')">{{ item.discount_type_text }}
        </md-table-cell>
        <md-table-cell md-sort-by="valid_for_items_text" :md-label="$t('global.AppliesTo')">{{ item.valid_for_items_text }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.MaxCustomers')">{{ item.has_customer_limit ? item.customer_limit
          : '--' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.MaxTimesPerCustomer')">{{ item.has_use_per_customer_limit ?
          item.use_per_customer_limit : '--' }}
        </md-table-cell>
        <md-table-cell md-sort-by="active" :md-label="$t('global.Active')">
          <md-icon v-if="item.active">checkmark</md-icon>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <div class="space8"></div>
  </div>

</template>

<script>

  import LoadingAnimation from './LoadingAnimation.vue'
  import YogoApi from '../gateways/YogoApi'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      LoadingAnimation,
    },
    data() {
      return {
        loading: true,
        discountCodes: [],
        currentSort: 'name',
        currentSortOrder: 'asc',
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
      ]),
    },
    created() {
      if (this.stateReady) this.fetchDiscountCodes()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchDiscountCodes()
      },
    },
    methods: {
      async fetchDiscountCodes() {
        this.discountCodes = await YogoApi.get('/discount-codes' +
          '?populate[]=valid_for_items_text' +
          '&populate[]=discount_type_text'
        )

        this.loading = false

      },
      onSelectDiscountCode(discountCode) {
        this.$router.push({
          name: 'DiscountCodeEdit',
          params: { id: discountCode.id },
        })
      },
      customSort (value) {
        return value.sort((a, b) => {
          const sortBy = this.currentSort

          if (this.currentSortOrder === 'asc') {
            return a[sortBy].localeCompare(b[sortBy])
          }

          return b[sortBy].localeCompare(a[sortBy])
        })
      },
    },
  }
</script>

