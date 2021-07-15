<template>
  <div>
    <h2>{{ $t('global.Products') }}</h2>

    <router-link :to="{ name: 'ProductAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateProduct') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>
    <md-table v-model="products" md-card v-else-if="products.length" :md-sort.sync="tableSortField"
              :md-sort-order.sync="tableSortOrder" :md-sort-fn="tableSortFn" class="padding--svg" @md-selected="onSelectProduct">
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">

        <md-table-cell :md-label="$t('global.Image')" md-sort-by="image">
          <img v-if="item.image" :src="Imgix(item.image.filename, {w:80,h:80,fit:'crop'})">
        </md-table-cell>

        <md-table-cell :md-label="$t('global.Product')" md-sort-by="name">{{ item.name }}</md-table-cell>

        <md-table-cell :md-label="$t('global.Price')" md-sort-by="price" md-numeric>
          {{ item.price | currency_dkk }} kr.
        </md-table-cell>

        <md-table-cell :md-label="$t('global.ForSale')" md-sort-by="for_sale">
          <md-icon v-if="item.for_sale">checkmark</md-icon>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <p v-else>

      <md-empty-state
        md-icon="shopping_cart"
        :md-label="$t('global.CreateProduct')"
        :md-description="$t('global.NoProductsCreatedYet')">
        <router-link :to="{name:'ProductAdd'}">
          <md-button class="md-primary md-raised">
            {{ $t('global.CreateProduct') }}
          </md-button>
        </router-link>
      </md-empty-state>

    <div class="space8"></div>
  </div>

</template>

<script>

  import YogoApi from '@/gateways/YogoApi'
  import LoadingAnimation from "./LoadingAnimation.vue"
  import {mapGetters} from 'vuex'
  import customTableSort from '../helpers/customTableSort'
  import Imgix from '@/services/Imgix';

  export default {
    components: {LoadingAnimation},
    mixins: [Imgix],
    name: 'products',
    data() {
      return {
        products: [],
        loading: true,

        tableSortField: 'name',
        tableSortOrder: 'asc',
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
      ]),
    },
    created() {
      if (this.stateReady) this.fetchProducts()
    },
    mounted() {

    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchProducts()
      },
    },
    methods: {
      async fetchProducts() {
        this.products = await YogoApi.get('/products?eager=[image]&orderBy=name')
        this.loading = false
      },
      onSelectProduct(product) {
        this.$router.push({name: 'ProductEdit', params: {id: product.id}})
      },
      tableSortFn(value) {
        const sortMethods = {
          name: 'string',
          price: 'number',
          for_sale: 'boolean',
          image: 'boolean',
        }
        return customTableSort(value, this.tableSortField, this.tableSortOrder, sortMethods[this.tableSortField])
      },

    },
  }
</script>

<style lang="stylus" scoped>


</style>
