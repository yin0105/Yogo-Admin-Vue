<template>
  <div class="customers">

    <router-link :to="{ name: 'CustomerAdd' }">
      <div class="fixed__top--right">
        <md-button class="md-fab turkis md-fixed md-fab-top-right">
          <md-icon>add</md-icon>
          <md-tooltip md-direction="left">{{ $t('global.CreateCustomer') }}</md-tooltip>
        </md-button>
      </div>
    </router-link>

    <h2>{{ $t('global.Customers') }}</h2>
    <div class="space4"></div>


    <md-card>
      <md-card-header>
        <md-field>
          <md-icon>search</md-icon>
          <md-input :placeholder="$t('global.searchInfo')" v-model="searchQuery" ref="searchInput"/>
        </md-field>


        <md-table v-model="customers" md-sort="name" md-sort-order="asc" md-fixed-header v-if="!loading" @md-selected="onSelectCustomer">

          <md-table-empty-state
            :md-label="searchQuery === '' ? '' : this.$t('global.NoCustomersFound')"
            :md-description="searchQuery === '' ? '' : this.$t('global.NoCustomersWithThisName')">
          </md-table-empty-state>

          <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
            <md-table-cell :md-label="$t('global.Image')">
              <img class="circle profile-image"
                   :src="item.image ? Imgix(item.image.filename, {w:120, h:120, fit:'crop'}) : require('../assets/img/account.svg')">
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Name')" md-sort-by="sort_full_name">{{ item.first_name + ' ' +
              item.last_name
              }}
            </md-table-cell>
            <md-table-cell :md-label="$t('global.Email')" md-sort-by="email">{{ item.email }}</md-table-cell>
            <md-table-cell :md-label="$t('global.Phone')" md-sort-by="phone">{{ item.phone }}</md-table-cell>
            <md-table-cell :md-label="$t('global.Created')" md-sort-by="sort_created">
              {{ formatDate(item.createdAt) }}
            </md-table-cell>
          </md-table-row>

        </md-table>

        <loading-animation v-if="loading"></loading-animation>
      </md-card-header>
    </md-card>


  </div> <!-- customers -->

</template>

<script>

  import LoadingAnimation from '@/components/LoadingAnimation'
  import _ from 'lodash'
  import moment from 'moment'

  import {mapGetters} from 'vuex'

  import YogoApi from '@/gateways/YogoApi'
  import Imgix from '@/services/Imgix'
  import dateTimeFunctions from '@/mixins/dateTimeFunctions';


  export default {
    name: 'customers',
    components: {
      'loading-animation': LoadingAnimation,
    },
    mixins: [Imgix, dateTimeFunctions],
    data() {
      return {
        customerEditColTitle: ' ',
        customers: [],
        loading: false,
        searchQuery: '',

        currentQueryLoading: '',

      }
    },
    computed: {
      ...mapGetters([
        'userIsLoggedIn',
        'userName',
        'profileImageFilename',
        'stateReady',
        'user',
      ]),
    },
    watch: {
      stateReady(newReadyState) {
        this.doSearch()
      },
      searchQuery(query) {
        this.doSearch()
      },
    },
    mounted() {
      this.$refs.searchInput.$el.focus()
    },
    methods: {
      async doSearch() {
        if (!this.stateReady) return
        if (this.loading) {
          return
        }
        if (this.searchQuery === this.currentQueryLoading) {
          return
        }

        if (this.searchQuery === '') {
          this.currentQueryLoading = ''
          this.customers = []
          return
        }

        this.loading = true
        this.currentQueryLoading = this.searchQuery

        const response = await YogoApi.get('/users' +
          '?customer=1' +
          '&searchQuery=' + encodeURIComponent(this.searchQuery) +
          '&populate[]=image',
        )

        this.customers = _.map(response, customer => {
          customer.sort_full_name = customer.first_name + ' ' + customer.last_name
          customer.sort_created = customer.createdAt.toString()
          return customer
        })
        this.loading = false
        if (this.searchQuery !== this.currentQueryLoading) {
          this.doSearch()
        }
      },
      moment: moment,
      onSelectCustomer(customer) {
        this.$router.push({
          name: 'CustomerInfo',
          params: {
            id: customer.id,
          },
        })
      },
    },

  }
</script>

<style lang="stylus">


  /**** tablet and up ****/

  @media screen and (min-width: 768px)

    .search__input--container
      display flex
      justify-content space-between
      align-items center

    .input-field
      flex 3

    .btn
      flex 1
      max-width 220px
      margin-left 40px

</style>
