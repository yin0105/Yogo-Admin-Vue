<template>
  <Treeselect
      :value="value"
      @input="updateValue"
      :multiple="true"
      :options="treeSelectClassPassTypesOptions"
      :clearable="false"
      :defaultExpandLevel="1"
      value-consists-of="LEAF_PRIORITY"
      :no-options-text="$t('global.NoClassPassesCreatedYet')"
  />
</template>

<script>

import Treeselect from '@riophae/vue-treeselect';
import YogoApi from '@/gateways/YogoApi';

export default {
  name: 'YogoTreeselectClassPassTypes',
  components: { Treeselect },
  data() {
    return {
      classPassTypes: [],
    };
  },
  props: ['value'],
  computed: {
    treeSelectClassPassTypesOptions() {
      return this.classPassTypes.length
          ? [
            {
              id: 'all_classPassTypes',
              label: this.$t('global.AllClassPassTypes'),
              children: _.sortBy(
                  _.map(this.classPassTypes, classPassType => {
                    return {
                      id: classPassType.id,
                      label: classPassType.name,
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
    this.classPassTypes = await YogoApi.get('/class-pass-types');
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
  },
};

</script>
