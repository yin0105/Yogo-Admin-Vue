<template>
  <Treeselect
      :value="value"
      @input="updateValue"
      :multiple="true"
      :options="treeSelectMembershipTypesOptions"
      :clearable="false"
      :defaultExpandLevel="1"
      value-consists-of="LEAF_PRIORITY"
      :no-options-text="$t('global.NoMembershipsCreatedYet')"
  />
</template>

<script>

import Treeselect from '@riophae/vue-treeselect';
import YogoApi from '@/gateways/YogoApi';

export default {
  name: 'YogoTreeselectMembershipTypes',
  components: { Treeselect },
  data() {
    return {
      membershipTypes: [],
    };
  },
  props: ['value'],
  computed: {
    treeSelectMembershipTypesOptions() {
      return this.membershipTypes.length
          ? [
            {
              id: 'all_membershipTypes',
              label: this.$t('global.AllMembershipTypes'),
              children: _.sortBy(
                  _.map(this.membershipTypes, membershipType => {
                    return {
                      id: membershipType.id,
                      label: membershipType.name,
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
    this.membershipTypes = await YogoApi.get('/membership-types');
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
  },
};

</script>
