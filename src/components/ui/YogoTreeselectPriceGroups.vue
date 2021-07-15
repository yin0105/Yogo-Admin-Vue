<template>
  <Treeselect
      :value="value"
      @input="updateValue"
      :multiple="true"
      :options="treeSelectPriceGroupOptions"
      :clearable="false"
      :defaultExpandLevel="1"
      value-consists-of="LEAF_PRIORITY"
      :no-options-text="$t('global.NoPriceGroupsCreatedYet')"
  />
</template>

<script>

import Treeselect from '@riophae/vue-treeselect';
import YogoApi from '@/gateways/YogoApi';

export default {
  name: 'YogoTreeselectPriceGroups',
  components: { Treeselect },
  data() {
    return {
      priceGroups: [],
    };
  },
  props: ['value'],
  computed: {
    treeSelectPriceGroupOptions() {
      return this.priceGroups.length
          ? [
            {
              id: 'all_priceGroups',
              label: this.$t('global.AllPriceGroups'),
              children: _.sortBy(
                  _.map(this.priceGroups, priceGroup => {
                    return {
                      id: priceGroup.id,
                      label: priceGroup.name,
                    };
                  }),
                  'label',
              ),
            },
          ]
          : [];
    },
  },
  async created() {
    this.priceGroups = await YogoApi.get('/price-groups');
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
  },
};

</script>
