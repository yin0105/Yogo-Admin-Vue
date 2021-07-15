<template>
  <div>
    <md-table v-model="classPassTypes" :md-sort.sync="tableSortField"
              :md-sort-order.sync="tableSortOrder" :md-sort-fn="tableSortFn" md-card
              @md-selected="onSelectClassPassType">

      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.ID')" md-sort-by="id">{{ item.id }}</md-table-cell>
        <md-table-cell :md-label="$t('global.ClassPassTimeBased')" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Days')" md-sort-by="days" md-numeric>{{ item.days }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.PriceGroups')" md-sort-by="price_groups">{{ getPriceGroups(item)
          }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Price')" md-sort-by="price" md-numeric>{{ item.price |
          currency_dkk }} kr.
        </md-table-cell>
      </md-table-row>

      <md-table-empty-state>
        {{ $t('global.NoClassPassesTimeBased') }}
      </md-table-empty-state>

    </md-table>
  </div>
</template>

<script>

  import customTableSort from '../helpers/customTableSort'

  export default {
    name: 'ClassPassTypeTimeBasedList',
    props: ['classPassTypes'],
    data() {
      return {
        tableSortField: 'days',
        tableSortOrder: 'asc',
      }
    },
    methods: {
      onSelectClassPassType(classPassType) {
        this.$router.push({
          name: 'ClassPassTypeTimeBasedEdit',
          params: {
            id: classPassType.id,
          },
        })
      },
      getPriceGroups(classPassType) {
        if (!classPassType.price_groups.length) {
          return '--'
        }
        return _.map(classPassType.price_groups, 'name')
          .join(', ')
      },
      tableSortFn(value) {
        const sortMethods = {
          id: 'number',
          name: 'string',
          price: 'number',
          days: 'number',
          price_groups: 'array_element_name'
        }
        return customTableSort(value, this.tableSortField, this.tableSortOrder, sortMethods[this.tableSortField])
      },
    },
  }
</script>
